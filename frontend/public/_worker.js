export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. Fetch static asset from Cloudflare Pages asset store
    let response = await env.ASSETS.fetch(request);

    // 2. If the static asset exists and is not 404, serve it directly
    if (response.status !== 404) {
      return response;
    }

    // 3. If asset not found, check if this is an SPA route handled by React Router
    const isSpaRoute =
      path === '/admin' ||
      path.startsWith('/admin/') ||
      path === '/login' ||
      path.startsWith('/login/') ||
      path.startsWith('/sign/') ||
      path.startsWith('/verify/') ||
      path.startsWith('/start-planning') ||
      path.startsWith('/book-destination') ||
      path.startsWith('/unauthorized') ||
      path.startsWith('/form-showcase') ||
      path.startsWith('/search') ||
      path === '/terms' ||
      path === '/privacy' ||
      path === '/careers';

    if (isSpaRoute) {
      // Return root index.html with 200 OK for React Router client navigation
      const indexRequest = new Request(new URL('/', request.url), request);
      const indexResponse = await env.ASSETS.fetch(indexRequest);
      return new Response(indexResponse.body, {
        status: 200,
        headers: indexResponse.headers,
      });
    }

    // 4. For any genuinely non-existent path, return the 404 response
    return response;
  },
};
