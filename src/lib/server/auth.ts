// ============================================================
// auth.ts – Databricks Authentication Helper
// ============================================================
// Supports two authentication modes:
//
// 1. Local development: Uses DATABRICKS_TOKEN from .env
// 2. Databricks Apps: Uses auto-injected DATABRICKS_CLIENT_ID
//    and DATABRICKS_CLIENT_SECRET for OAuth2 client credentials flow.
//
// The getAccessToken() function handles both modes transparently.
// ============================================================

import { env } from '$env/dynamic/private';

let cachedToken: string | null = null;
let tokenExpiry = 0;

/**
 * Returns a valid Databricks access token.
 * In local dev, returns the PAT from DATABRICKS_TOKEN.
 * In Databricks Apps, performs OAuth2 client credentials flow
 * using the auto-injected service principal credentials.
 */
export async function getAccessToken(): Promise<string> {
	// Local development: use PAT directly
	if (env.DATABRICKS_TOKEN) {
		return env.DATABRICKS_TOKEN;
	}

	// Databricks Apps: OAuth2 client credentials flow
	const now = Date.now();
	if (cachedToken && now < tokenExpiry) {
		return cachedToken;
	}

	const host = getDatabricksHost();
	const clientId = env.DATABRICKS_CLIENT_ID;
	const clientSecret = env.DATABRICKS_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error(
			'Missing Databricks credentials. Set DATABRICKS_TOKEN for local dev or deploy as a Databricks App.'
		);
	}

	const response = await fetch(`${host}/oidc/v1/token`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: clientId,
			client_secret: clientSecret,
			scope: 'all-apis'
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`OAuth token error: ${response.status} – ${errorText}`);
	}

	const data = await response.json();
	cachedToken = data.access_token;
	// Refresh 5 minutes before actual expiry
	tokenExpiry = now + (data.expires_in - 300) * 1000;

	return cachedToken!;
}

/**
 * Returns the configured Databricks workspace host URL.
 */
export function getDatabricksHost(): string {
	const host = env.DATABRICKS_HOST;
	if (!host) throw new Error('DATABRICKS_HOST is not set');
	return host;
}
