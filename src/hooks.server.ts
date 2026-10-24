import type { Handle } from '@sveltejs/kit/hooks';

// Keep in sync with the `Content-Security-Policy` in `_headers`. That file only
// covers static assets on Cloudflare Pages; SSR responses need the header from
// the Worker response itself.
const CONTENT_SECURITY_POLICY =
	"default-src 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://cdn.jsdelivr.net; worker-src 'self'; manifest-src 'self'";

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY);
	return response;
};
