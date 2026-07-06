import { base } from '$app/paths';
import { config } from '$lib/stores/settings.svelte';
import { CORS_PROXY_HEADER_PREFIX, REDACTED_HEADERS, SETTINGS_KEYS } from '$lib/constants';
import { redactValue } from './redact';

/**
 * Get authorization headers for API requests
 * Includes Bearer token if API key is configured
 */
export function getAuthHeaders(): Record<string, string> {
	const currentConfig = config();
	const providerMode = currentConfig[SETTINGS_KEYS.PROVIDER_MODE]?.toString();
	const providerApiKey = currentConfig[SETTINGS_KEYS.PROVIDER_API_KEY]?.toString().trim();

	if (providerMode === 'openai-compatible' && providerApiKey) {
		return { Authorization: `Bearer ${providerApiKey}` };
	}

	const apiKey = currentConfig.apiKey?.toString().trim();
	return apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
}

export function getProviderConfig() {
	const currentConfig = config();
	const providerMode = currentConfig[SETTINGS_KEYS.PROVIDER_MODE]?.toString();
	if (providerMode !== 'openai-compatible') {
		return null;
	}

	const providerName = currentConfig[SETTINGS_KEYS.PROVIDER_NAME]?.toString() || 'openrouter';
	const baseUrl = currentConfig[SETTINGS_KEYS.PROVIDER_BASE_URL]?.toString().trim();
	const apiKey = currentConfig[SETTINGS_KEYS.PROVIDER_API_KEY]?.toString().trim();
	const model = currentConfig[SETTINGS_KEYS.PROVIDER_MODEL]?.toString().trim();

	return {
		providerName,
		baseUrl: baseUrl || getDefaultProviderBaseUrl(providerName),
		apiKey,
		model
	};
}

export function resolveApiUrl(path: string): string {
	const providerConfig = getProviderConfig();
	if (!providerConfig) {
		const normalizedPath = path.replace(/^\.\//, '').replace(/^\/+/, '/');
		const withLeadingSlash = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
		return normalizedPath.startsWith('http://') || normalizedPath.startsWith('https://')
			? normalizedPath
			: `${base}${withLeadingSlash}`;
	}

	const providerBase = providerConfig.baseUrl.replace(/\/$/, '');
	const normalizedPath = path.replace(/^\.\//, '').replace(/^\/+/, '/');

	if (normalizedPath.startsWith('/v1/') || normalizedPath.startsWith('v1/')) {
		const relative = normalizedPath.replace(/^\/?v1\//, '/');
		return `${providerBase}${relative.startsWith('/') ? relative : `/${relative}`}`;
	}

	const p = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;
	return `${providerBase}${p}`;
}

function getDefaultProviderBaseUrl(providerName: string): string {
	switch (providerName) {
		case 'groq':
			return 'https://api.groq.com/openai/v1';
		case 'huggingface':
			return 'https://router.huggingface.co/v1';
		case 'together':
			return 'https://api.together.xyz/v1';
		case 'gemini':
			return 'https://generativelanguage.googleapis.com/v1beta/openai/';
		default:
			return 'https://openrouter.ai/api/v1';
	}
}

/**
 * Get standard JSON headers with optional authorization
 */
export function getJsonHeaders(): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		...getAuthHeaders()
	};
}

/**
 * Sanitize HTTP headers by redacting sensitive values.
 * Known sensitive headers (from REDACTED_HEADERS) and any extra headers
 * specified by the caller are fully redacted. Headers listed in
 * `partialRedactHeaders` are partially redacted, showing only the
 * specified number of trailing characters.
 *
 * @param headers - Headers to sanitize
 * @param extraRedactedHeaders - Additional header names to fully redact
 * @param partialRedactHeaders - Map of header name -> number of trailing chars to keep visible
 * @returns Object with header names as keys and (possibly redacted) values
 */
export function sanitizeHeaders(
	headers?: HeadersInit,
	extraRedactedHeaders?: Iterable<string>,
	partialRedactHeaders?: Map<string, number>
): Record<string, string> {
	if (!headers) {
		return {};
	}

	const normalized = new Headers(headers);
	const sanitized: Record<string, string> = {};
	const redactedHeaders = new Set(
		Array.from(extraRedactedHeaders ?? [], (header) => header.toLowerCase())
	);

	for (const [key, value] of normalized.entries()) {
		const normalizedKey = key.toLowerCase();
		const unproxiedKey = normalizedKey.startsWith(CORS_PROXY_HEADER_PREFIX)
			? normalizedKey.slice(CORS_PROXY_HEADER_PREFIX.length)
			: normalizedKey;
		const partialChars =
			partialRedactHeaders?.get(normalizedKey) ?? partialRedactHeaders?.get(unproxiedKey);

		if (partialChars !== undefined) {
			sanitized[key] = redactValue(value, partialChars);
		} else if (
			REDACTED_HEADERS.has(normalizedKey) ||
			REDACTED_HEADERS.has(unproxiedKey) ||
			redactedHeaders.has(normalizedKey) ||
			redactedHeaders.has(unproxiedKey)
		) {
			sanitized[key] = redactValue(value);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized;
}
