// ============================================================
// databricks.ts – Databricks Unity Catalog & SQL Statement API
// ============================================================
// Nutzt die Unity Catalog Tables API (GET /api/2.0/unity-catalog/tables/)
// für Schema-Extraktion, und die SQL Statement Execution API
// (/api/2.0/sql/statements) für Datenabfragen.
// ============================================================

import { env } from '$env/dynamic/private';
import type { ColumnInfo, UCTableResponse } from '$lib/types';
import { getAccessToken, getDatabricksHost } from '$lib/server/auth';

// ============================================================
// Hilfsfunktion: Authentifizierter Fetch gegen Databricks API
// ============================================================

async function databricksFetch(url: string, init?: RequestInit): Promise<Response> {
	const token = await getAccessToken();
	return fetch(url, {
		...init,
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
			...init?.headers
		}
	});
}

// ============================================================
// Unity Catalog Tables API – Tabellen-Metadaten abrufen
// ============================================================
// Nutzt GET /api/2.0/unity-catalog/tables/{full_name}
// Gibt komplette Metadaten inkl. Spalten, Typen, Kommentare zurück.
// Kein SQL Warehouse erforderlich.
// ============================================================

export async function getTableMetadata(tableName: string): Promise<UCTableResponse> {
	if (!getTableNames().includes(tableName)) {
		throw new Error(`Tabelle "${tableName}" ist nicht konfiguriert.`);
	}

	const host = getDatabricksHost();
	const response = await databricksFetch(
		`${host}/api/2.0/unity-catalog/tables/${encodeURIComponent(tableName)}`
	);

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Databricks UC API Error: ${response.status} – ${errorText}`);
	}

	return response.json();
}

// ============================================================
// Schema-Extraktion aus UC-Metadaten
// ============================================================

export async function getTableSchema(tableName: string): Promise<ColumnInfo[]> {
	const metadata = await getTableMetadata(tableName);
	return (metadata.columns ?? []).map((col) => ({
		name: col.name,
		type: col.type_name,
		comment: col.comment,
		nullable: col.nullable,
		position: col.position
	}));
}

// ============================================================
// Getter für konfigurierte Tabellennamen
// ============================================================

export function getTableNames(): string[] {
	const tables = env.DATABRICKS_TABLES ?? '';
	return tables.split(',').map((t) => t.trim()).filter(Boolean);
}

// ============================================================
// SQL Warehouse ID
// ============================================================

export function getWarehouseId(): string {
	const id = env.DATABRICKS_WAREHOUSE_ID;
	if (!id) throw new Error('DATABRICKS_WAREHOUSE_ID is not set');
	return id;
}

// ============================================================
// SQL Statement Execution API
// ============================================================
// Nutzt POST /api/2.0/sql/statements für Datenabfragen.
// Unterstützt serverseitige Pagination via LIMIT/OFFSET.
// ============================================================

export interface SqlQueryResult {
	columns: string[];
	rows: Record<string, unknown>[];
	totalRows: number;
}

/**
 * Führt eine SQL-Abfrage gegen das konfigurierte SQL Warehouse aus.
 * Gibt Spalten, Zeilen und Gesamtzahl zurück.
 */
export async function executeSqlQuery(
	tableName: string,
	options: {
		limit: number;
		offset: number;
		sortColumn?: string;
		sortDirection?: 'asc' | 'desc';
		filter?: string;
	}
): Promise<SqlQueryResult> {
	if (!getTableNames().includes(tableName)) {
		throw new Error(`Tabelle "${tableName}" ist nicht konfiguriert.`);
	}

	const host = getDatabricksHost();
	const warehouseId = getWarehouseId();

	// Build the WHERE clause for filtering
	// We need column names first to build the filter across all string-like columns
	let whereClause = '';
	if (options.filter) {
		const metadata = await getTableMetadata(tableName);
		const stringColumns = (metadata.columns ?? [])
			.filter((col) => {
				const t = col.type_name.toUpperCase();
				return t === 'STRING' || t === 'VARCHAR' || t === 'CHAR';
			})
			.map((col) => col.name);

		if (stringColumns.length > 0) {
			const conditions = stringColumns
				.map((col) => `\`${col}\` ILIKE '%' || :filter_val || '%'`)
				.join(' OR ');
			whereClause = `WHERE (${conditions})`;
		}
	}

	// Build ORDER BY clause
	let orderByClause = '';
	if (options.sortColumn) {
		// Validate sort column against metadata to prevent injection
		const metadata = await getTableMetadata(tableName);
		const validColumns = (metadata.columns ?? []).map((col) => col.name);
		if (validColumns.includes(options.sortColumn)) {
			const dir = options.sortDirection === 'desc' ? 'DESC' : 'ASC';
			orderByClause = `ORDER BY \`${options.sortColumn}\` ${dir}`;
		}
	}

	// Count query for total rows
	const countSql = `SELECT COUNT(*) AS cnt FROM ${tableName} ${whereClause}`;
	const countResult = await executeStatement(host, warehouseId, countSql,
		options.filter ? [{ name: 'filter_val', value: options.filter, type: 'STRING' }] : undefined);
	const totalRows = Number(countResult.rows[0]?.[0] ?? 0);

	// Data query with pagination
	const dataSql = `SELECT * FROM ${tableName} ${whereClause} ${orderByClause} LIMIT :limit_val OFFSET :offset_val`;
	const dataParams: SqlParam[] = [
		{ name: 'limit_val', value: String(options.limit), type: 'INT' },
		{ name: 'offset_val', value: String(options.offset), type: 'INT' }
	];
	if (options.filter) {
		dataParams.push({ name: 'filter_val', value: options.filter, type: 'STRING' });
	}
	const dataResult = await executeStatement(host, warehouseId, dataSql, dataParams);

	// Map column names to row objects
	const columns = dataResult.columns;
	const rows = dataResult.rows.map((row) => {
		const obj: Record<string, unknown> = {};
		columns.forEach((col, i) => {
			obj[col] = row[i];
		});
		return obj;
	});

	return { columns, rows, totalRows };
}

interface SqlParam {
	name: string;
	value: string;
	type: 'STRING' | 'INT' | 'DOUBLE' | 'BOOLEAN';
}

/**
 * Executes a SQL statement via the Databricks SQL Statement Execution API.
 * Uses parameterized queries to prevent SQL injection.
 */
async function executeStatement(
	host: string,
	warehouseId: string,
	sql: string,
	params?: SqlParam[]
): Promise<{ columns: string[]; rows: unknown[][] }> {
	const body: Record<string, unknown> = {
		warehouse_id: warehouseId,
		statement: sql,
		wait_timeout: '30s',
		disposition: 'INLINE',
		format: 'JSON_ARRAY'
	};

	if (params?.length) {
		body.parameters = params;
	}

	const response = await databricksFetch(`${host}/api/2.0/sql/statements`, {
		method: 'POST',
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`SQL Statement API Error: ${response.status} – ${errorText}`);
	}

	const data = await response.json();

	if (data.status?.state === 'FAILED') {
		throw new Error(`SQL Error: ${data.status.error?.message ?? 'Unknown SQL error'}`);
	}

	const columns = (data.manifest?.schema?.columns ?? []).map(
		(c: { name: string }) => c.name
	);
	const rows: unknown[][] = data.result?.data_array ?? [];

	return { columns, rows };
}

// ============================================================
// Column Statistics – Histogram (Numeric) & Distinct (String/Bool)
// ============================================================

export interface HistogramBucket {
	bucketStart: number;
	bucketEnd: number;
	count: number;
}

/**
 * Returns a histogram of value distribution for a numeric column.
 * Uses SQL FLOOR to bucket values by the given bin width.
 */
export async function getNumericHistogram(
	tableName: string,
	columnName: string,
	binWidth: number
): Promise<HistogramBucket[]> {
	if (!getTableNames().includes(tableName)) {
		throw new Error(`Tabelle "${tableName}" ist nicht konfiguriert.`);
	}

	// Validate column name against metadata
	const metadata = await getTableMetadata(tableName);
	const validColumns = (metadata.columns ?? []).map((col) => col.name);
	if (!validColumns.includes(columnName)) {
		throw new Error(`Spalte "${columnName}" existiert nicht.`);
	}

	const host = getDatabricksHost();
	const warehouseId = getWarehouseId();

	const sql = `
		SELECT
			FLOOR(CAST(\`${columnName}\` AS DOUBLE) / :bin_width) * :bin_width AS bucket_start,
			FLOOR(CAST(\`${columnName}\` AS DOUBLE) / :bin_width) * :bin_width + :bin_width AS bucket_end,
			COUNT(*) AS cnt
		FROM ${tableName}
		WHERE \`${columnName}\` IS NOT NULL
		GROUP BY FLOOR(CAST(\`${columnName}\` AS DOUBLE) / :bin_width)
		ORDER BY bucket_start
	`;

	const result = await executeStatement(host, warehouseId, sql, [
		{ name: 'bin_width', value: String(binWidth), type: 'DOUBLE' }
	]);

	return result.rows.map((row) => ({
		bucketStart: Number(row[0]),
		bucketEnd: Number(row[1]),
		count: Number(row[2])
	}));
}

export interface DistinctValueCount {
	value: string;
	count: number;
}

/**
 * Returns distinct value counts for a string/boolean column.
 * Limited to top 50 values by count.
 */
export async function getDistinctValues(
	tableName: string,
	columnName: string
): Promise<DistinctValueCount[]> {
	if (!getTableNames().includes(tableName)) {
		throw new Error(`Tabelle "${tableName}" ist nicht konfiguriert.`);
	}

	const metadata = await getTableMetadata(tableName);
	const validColumns = (metadata.columns ?? []).map((col) => col.name);
	if (!validColumns.includes(columnName)) {
		throw new Error(`Spalte "${columnName}" existiert nicht.`);
	}

	const host = getDatabricksHost();
	const warehouseId = getWarehouseId();

	const sql = `
		SELECT
			COALESCE(CAST(\`${columnName}\` AS STRING), 'NULL') AS val,
			COUNT(*) AS cnt
		FROM ${tableName}
		GROUP BY \`${columnName}\`
		ORDER BY cnt DESC
		LIMIT 50
	`;

	const result = await executeStatement(host, warehouseId, sql);

	return result.rows.map((row) => ({
		value: String(row[0]),
		count: Number(row[1])
	}));
}
