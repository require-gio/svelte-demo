// ============================================================
// /api/data/[table]/+server.ts – Tabellendaten via SQL Warehouse
// ============================================================
// Liefert paginierte, sortierbare und filterbare Daten aus
// Databricks SQL Warehouse. Parameter via Query-String.
// ============================================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeSqlQuery, getTableNames } from '$lib/server/databricks';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const tableName = params.table;

		if (!getTableNames().includes(tableName)) {
			return json({ error: 'Tabelle nicht konfiguriert.' }, { status: 400 });
		}

		const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 20, 1), 100);
		const offset = Math.max(Number(url.searchParams.get('offset')) || 0, 0);
		const sortColumn = url.searchParams.get('sort') || undefined;
		const sortDirection = url.searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
		const filter = url.searchParams.get('filter') || undefined;

		const result = await executeSqlQuery(tableName, {
			limit,
			offset,
			sortColumn,
			sortDirection: sortColumn ? sortDirection : undefined,
			filter
		});

		return json(result);
	} catch (error) {
		console.error('[Data] Fehler beim Laden der Daten:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
			{ status: 500 }
		);
	}
};
