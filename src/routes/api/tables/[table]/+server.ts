// ============================================================
// /api/tables/[table]/+server.ts – Einzelne Tabellen-Metadaten
// ============================================================
// Gibt Schema-Details für eine einzelne Tabelle zurück.
// Nutzt die Unity Catalog Tables API (kein Warehouse nötig).
// ============================================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTableMetadata, getTableNames } from '$lib/server/databricks';
import type { TableInfo } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const tableName = params.table;

		if (!getTableNames().includes(tableName)) {
			return json(
				{ error: `Tabelle "${tableName}" ist nicht konfiguriert.` },
				{ status: 404 }
			);
		}

		const metadata = await getTableMetadata(tableName);

		const response: TableInfo = {
			name: metadata.full_name,
			shortName: metadata.name,
			schema: (metadata.columns ?? []).map((col) => ({
				name: col.name,
				type: col.type_name,
				comment: col.comment,
				nullable: col.nullable,
				position: col.position
			})),
			comment: metadata.comment,
			tableType: metadata.table_type
		};

		return json(response);
	} catch (error) {
		console.error('[TableDetail] Fehler:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
			{ status: 500 }
		);
	}
};
