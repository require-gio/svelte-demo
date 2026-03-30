import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getTableNames, getDistinctValues } from '$lib/server/databricks';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const tableName = params.table;

		if (!getTableNames().includes(tableName)) {
			return json({ error: 'Tabelle nicht konfiguriert.' }, { status: 400 });
		}

		const column = url.searchParams.get('column');
		if (!column) {
			return json({ error: 'Parameter "column" fehlt.' }, { status: 400 });
		}

		const result = await getDistinctValues(tableName, column);
		return json(result);
	} catch (error) {
		console.error('[Distinct] Fehler:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Unbekannter Fehler' },
			{ status: 500 }
		);
	}
};
