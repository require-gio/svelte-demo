// ============================================================
// /api/chat/+server.ts – Chat-Endpoint via Genie Conversation API
// ============================================================
// Warum Genie statt eigenes LLM + SQL?
// → Genie übernimmt die gesamte Pipeline: Text-to-SQL, Self-Correction,
//   Schema-Verständnis, Konversationskontext. Wir müssen nur die Frage
//   senden und das Ergebnis abholen. Kein Prompt-Engineering nötig.
//
// Stateful Conversations:
// → Das Frontend sendet `conversationId` bei Follow-up-Fragen mit.
//   Genie behält den Kontext und kann Rückbezüge verstehen.
// ============================================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChatResponse } from '$lib/types';
import { askGenie } from '$lib/server/genie';

export const POST: RequestHandler = async ({ request }) => {
	try {
		// ── 1. Request validieren ──
		const body = await request.json();
		const question = body.question?.trim();

		if (!question || typeof question !== 'string') {
			return json(
				{ type: 'error', content: 'Bitte stelle eine Frage.' } satisfies ChatResponse,
				{ status: 400 }
			);
		}

		if (question.length > 2000) {
			return json(
				{ type: 'error', content: 'Die Frage ist zu lang (max. 2000 Zeichen).' } satisfies ChatResponse,
				{ status: 400 }
			);
		}

		// ── 2. Optional: conversationId für Follow-up-Fragen ──
		const conversationId: string | undefined = body.conversationId?.trim() || undefined;
		const tableName: string | undefined = body.tableName?.trim() || undefined;

		console.log(`[Chat] Frage: "${question}" | Tabelle: ${tableName ?? '-'} | Conversation: ${conversationId ?? 'NEU'}`);

		// ── 3. Genie API aufrufen ──
		const genieQuestion = tableName
			? `[Table: ${tableName}] ${question}`
			: question;
		const result = await askGenie(genieQuestion, conversationId);

		// ── 4. Ergebnis formatieren und zurückgeben ──
		if (result.columns && result.rows && result.rows.length > 0) {
			// Tabellarisches Ergebnis
			const content = result.description
				?? `${result.rows.length} Ergebnis${result.rows.length > 1 ? 'se' : ''} gefunden.`;

			// Einzelner Wert (1 Zeile, 1 Spalte) → als Text
			if (result.rows.length === 1 && result.columns.length === 1) {
				const value = result.rows[0][result.columns[0]];
				const label = result.columns[0];
				return json({
					type: 'text',
					content: `**${label}:** ${value}`,
					sql: result.sql,
					conversationId: result.conversationId
				} satisfies ChatResponse);
			}

			return json({
				type: 'table',
				content,
				columns: result.columns,
				rows: result.rows,
				sql: result.sql,
				conversationId: result.conversationId
			} satisfies ChatResponse);
		}

		// Text-Antwort (keine Query generiert)
		if (result.textContent) {
			return json({
				type: 'text',
				content: result.textContent,
				sql: result.sql,
				conversationId: result.conversationId
			} satisfies ChatResponse);
		}

		// Fallback: Beschreibung vorhanden aber keine Daten
		return json({
			type: 'text',
			content: result.description ?? 'Die Abfrage hat keine Ergebnisse zurückgegeben.',
			sql: result.sql,
			conversationId: result.conversationId
		} satisfies ChatResponse);

	} catch (error) {
		console.error('[Chat] Fehler:', error);

		const message =
			error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten.';

		return json(
			{ type: 'error', content: message } satisfies ChatResponse,
			{ status: 500 }
		);
	}
};
