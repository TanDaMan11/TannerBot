/** A small SvelteKit-compatible JSON response helper for this project. */
export function json<T>(data: T, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return new Response(JSON.stringify(data), {
    ...init,
    headers
  });
}
