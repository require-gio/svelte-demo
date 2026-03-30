// ============================================================
// /api/tables/+server.ts – Tabellenliste + Schemas laden
// ============================================================
// Nutzt die Unity Catalog Tables API für Schema-Extraktion.
// Kein SQL Warehouse erforderlich.
// ============================================================

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTableNames, getTableMetadata } from '$lib/server/databricks';
import type { TableInfo } from '$lib/types';

export const GET: RequestHandler = async () => {
	try {
		const tableNames = getTableNames();

		const tables: TableInfo[] = await Promise.all(
			tableNames.map(async (name) => {
				const metadata = await getTableMetadata(name);
				const shortName = name.split('.').pop() ?? name;
				return {
					name,
					shortName,
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
			})
		);

		return json(tables);
	} catch (error) {
		console.error('[Tables] Fehler beim Laden der Tabellenliste:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
			{ status: 500 }
		);
	}
};
