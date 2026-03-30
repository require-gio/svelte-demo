// ============================================================
// genie.ts – Databricks Genie Conversation API Client
// ============================================================
// Warum Genie statt eigenes LLM + Text-to-SQL?
// → Genie übernimmt die gesamte NLQ-to-SQL-Pipeline:
//   Schema-Verständnis, SQL-Generierung, Self-Correction,
//   und Konversationskontext. Kein OpenAI-Key nötig, keine
//   Prompt-Iteration, keine Self-Correction-Loops.
//   Die API ist stateful – Follow-up-Fragen funktionieren
//   automatisch im Kontext der vorherigen Fragen.
// ============================================================

import { env } from '$env/dynamic/private';
import { getAccessToken, getDatabricksHost } from '$lib/server/auth';

// Polling-Konfiguration (Databricks empfiehlt: alle 5-10s, max 10 Min)
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_DURATION_MS = 10 * 60 * 1000; // 10 Minuten

// ============================================================
// Typen
// ============================================================

export interface GenieMessageResult {
	conversationId: string;
	messageId: string;
	/** Der von Genie generierte SQL (falls vorhanden) */
	sql?: string;
	/** Beschreibung des Ergebnisses in natürlicher Sprache */
	description?: string;
	/** Spalten des Query-Ergebnisses */
	columns?: string[];
	/** Daten als Array von Objekten */
	rows?: Record<string, unknown>[];
	/** Textantwort von Genie (wenn keine Query generiert wurde) */
	textContent?: string;
}

interface GenieStartConversationResponse {
	conversation_id: string;
	message_id: string;
	message: GenieMessage;
}

interface GenieSendMessageResponse {
	message_id: string;
	message: GenieMessage;
}

interface GenieMessage {
	message_id: string;
	conversation_id: string;
	content: string;
	status: 'SUBMITTED' | 'FILTERING_CONTEXT' | 'ASKING_AI' | 'EXECUTING_QUERY' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
	created_timestamp: number;
	last_updated_timestamp: number;
	error?: {
		error_code?: string;
		message?: string;
	};
	attachments?: GenieAttachment[];
}

interface GenieAttachment {
	attachment_id: string;
	query?: {
		query: string;
		description?: string;
		title?: string;
		statement_id?: string;
		query_result_metadata?: {
			row_count?: number;
		};
	};
	text?: {
		content: string;
	};
}

interface GenieQueryResultResponse {
	statement_id: string;
	manifest?: {
		schema?: {
			columns?: Array<{
				name: string;
				type_name: string;
				position: number;
			}>;
		};
	};
	result?: {
		data_array?: unknown[][];
	};
}

// ============================================================
// Authentifizierter Fetch gegen Databricks API
// ============================================================

function getGenieApi(): string {
	const host = getDatabricksHost();
	const spaceId = env.GENIE_SPACE_ID;
	if (!spaceId) throw new Error('GENIE_SPACE_ID is not set');
	return `${host}/api/2.0/genie/spaces/${spaceId}`;
}

async function genieFetch(url: string, body?: unknown): Promise<Response> {
	const token = await getAccessToken();
	return fetch(url, {
		method: body ? 'POST' : 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		...(body ? { body: JSON.stringify(body) } : {})
	});
}

// ============================================================
// 1. Neue Konversation starten
// ============================================================

export async function startConversation(content: string): Promise<{ conversationId: string; messageId: string }> {
	const response = await genieFetch(`${getGenieApi()}/start-conversation`, { content });

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Genie API Error (start-conversation): ${response.status} – ${errorText}`);
	}

	const data: GenieStartConversationResponse = await response.json();
	return {
		conversationId: data.conversation_id,
		messageId: data.message_id
	};
}

// ============================================================
// 2. Follow-up Nachricht senden
// ============================================================

export async function sendFollowUp(conversationId: string, content: string): Promise<{ messageId: string }> {
	const response = await genieFetch(
		`${getGenieApi()}/conversations/${conversationId}/messages`,
		{ content }
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Genie API Error (send message): ${response.status} – ${errorText}`);
	}

	const data: GenieSendMessageResponse = await response.json();
	return { messageId: data.message_id };
}

// ============================================================
// 3. Message-Status pollen bis COMPLETED/FAILED
// ============================================================

async function pollForCompletion(conversationId: string, messageId: string): Promise<GenieMessage> {
	const startTime = Date.now();

	while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

		const response = await genieFetch(
			`${getGenieApi()}/conversations/${conversationId}/messages/${messageId}`
		);

		if (!response.ok) {
			throw new Error(`Genie API Error (poll): ${response.status}`);
		}

		const message: GenieMessage = await response.json();

		if (message.status === 'COMPLETED') {
			return message;
		}

		if (message.status === 'FAILED' || message.status === 'CANCELLED') {
			throw new Error(
				message.error?.message ?? `Genie-Anfrage fehlgeschlagen (Status: ${message.status})`
			);
		}

		// SUBMITTED, FILTERING_CONTEXT, ASKING_AI, EXECUTING_QUERY → weiter pollen
	}

	throw new Error('Timeout: Genie-Anfrage hat zu lange gedauert (>10 Min).');
}

// ============================================================
// 4. Query-Ergebnis abrufen
// ============================================================

async function getQueryResult(
	conversationId: string,
	messageId: string,
	attachmentId: string
): Promise<{ columns: string[]; rows: Record<string, unknown>[] }> {
	const response = await genieFetch(
		`${getGenieApi()}/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}/query-result`
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Genie API Error (query-result): ${response.status} – ${errorText}`);
	}

	const data: GenieQueryResultResponse = await response.json();

	const columnMeta = data.manifest?.schema?.columns ?? [];
	const columnNames = columnMeta.map((c) => c.name);
	const rawRows = data.result?.data_array ?? [];

	const rows = rawRows.map((row) => {
		const obj: Record<string, unknown> = {};
		columnNames.forEach((name, index) => {
			obj[name] = row[index];
		});
		return obj;
	});

	return { columns: columnNames, rows };
}

// ============================================================
// 5. Haupt-Funktion: Frage an Genie senden und Ergebnis holen
// ============================================================

export async function askGenie(
	question: string,
	conversationId?: string
): Promise<GenieMessageResult> {
	// 1. Nachricht senden (neue Konversation oder Follow-up)
	let convId: string;
	let msgId: string;

	if (conversationId) {
		convId = conversationId;
		const result = await sendFollowUp(conversationId, question);
		msgId = result.messageId;
	} else {
		const result = await startConversation(question);
		convId = result.conversationId;
		msgId = result.messageId;
	}

	// 2. Auf Completion pollen
	const completedMessage = await pollForCompletion(convId, msgId);

	// 3. Ergebnis aufbereiten
	const genieResult: GenieMessageResult = {
		conversationId: convId,
		messageId: msgId
	};

	if (completedMessage.attachments && completedMessage.attachments.length > 0) {
		for (const attachment of completedMessage.attachments) {
			// Query-Attachment: SQL + Ergebnisse
			if (attachment.query) {
				genieResult.sql = attachment.query.query;
				genieResult.description = attachment.query.description;

				// Query-Ergebnis abrufen
				const queryResult = await getQueryResult(convId, msgId, attachment.attachment_id);
				genieResult.columns = queryResult.columns;
				genieResult.rows = queryResult.rows;
			}

			// Text-Attachment: Natürlichsprachliche Antwort
			if (attachment.text) {
				genieResult.textContent = attachment.text.content;
			}
		}
	}

	return genieResult;
}
