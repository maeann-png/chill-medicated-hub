// src/index.js
// Basic Auth gate for a Cloudflare Worker that serves static assets.
// Needs (in wrangler.toml): an "ASSETS" binding + run_worker_first = true,
// so this code runs before any file is served.
// Credentials come from env vars AUTH_USER / AUTH_PASS (set in the dashboard).

export default {
  async fetch(request, env) {
    // Fail closed if credentials aren't configured yet.
    if (!env.AUTH_USER || !env.AUTH_PASS) {
      return new Response("Auth not configured.", { status: 500 });
    }

    const expected = "Basic " + btoa(`${env.AUTH_USER}:${env.AUTH_PASS}`);
    const provided = request.headers.get("Authorization") || "";

    if (provided !== expected) {
      return new Response("Authentication required.", {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Chill Medicated", charset="UTF-8"',
        },
      });
    }

    // Correct credentials — serve the requested static file.
    return env.ASSETS.fetch(request);
  },
};
