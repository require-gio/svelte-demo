// ============================================================
// Shared TypeScript Types für die gesamte Anwendung
// ============================================================

// ── Unity Catalog API Response Types ──

export interface UCColumn {
	name: string;
	type_name: string;
	type_text: string;
	type_json?: string;
	type_precision?: number;
	type_scale?: number;
	position: number;
	nullable: boolean;
	comment?: string;
}

export interface UCTableResponse {
	name: string;
	catalog_name: string;
	schema_name: string;
	full_name: string;
	table_type: string;
	data_source_format?: string;
	columns?: UCColumn[];
	storage_location?: string;
	comment?: string;
	owner?: string;
	created_at?: number;
	updated_at?: number;
	table_id?: string;
}

// ── App-Level Types ──

/**
 * Eine einzelne Spalte einer Databricks-Tabelle.
 * Wird aus der Unity Catalog Tables API extrahiert.
 */
export interface ColumnInfo {
	name: string;
	type: string;
	comment?: string;
	nullable?: boolean;
	position?: number;
}

/**
 * Tabellen-Info aus der /api/tables Endpunkt-Antwort.
 */
export interface TableInfo {
	name: string;
	shortName: string;
	schema: ColumnInfo[];
	comment?: string;
	tableType?: string;
}

// ── Chat Types ──

/**
 * Die Antwort des /api/chat Endpoints an das Frontend.
 */
export interface ChatResponse {
	type: 'table' | 'text' | 'error';
	content: string;
	columns?: string[];
	rows?: Record<string, unknown>[];
	sql?: string;
	conversationId?: string;
}

/**
 * Eine einzelne Nachricht im Chat-Verlauf (Frontend-State).
 */
export interface ChatMessage {
	role: 'user' | 'assistant';
	type: 'text' | 'table' | 'error';
	content: string;
	columns?: string[];
	rows?: Record<string, unknown>[];
	sql?: string;
}
