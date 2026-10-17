export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Normalize path by stripping trailing slashes for consistent route matching
    const rawPath = url.pathname;
    const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

    // Check if this is an SPA / application route handled by React Router
    const isAdmin = path === '/admin' || path.startsWith('/admin/');
    const isLogin = path === '/login';
    const isOtherSpa =
      path.startsWith('/sign/') ||
      path.startsWith('/verify/') ||
      path === '/start-planning' ||
      path === '/book-destination' ||
      path === '/unauthorized' ||
      path === '/form-showcase' ||
      path === '/search';

    if (isAdmin || isLogin || isOtherSpa) {
      // Determine the best pre-rendered shell: /admin/, /login/, or root /
      const targetPath = isAdmin ? '/admin/' : (isLogin ? '/login/' : '/');
      const shellRequest = new Request(new URL(targetPath, request.url), request);
      let shellResponse = await env.ASSETS.fetch(shellRequest);

      // If the specific shell wasn't found, fallback to root /
      if (shellResponse.status === 404 && targetPath !== '/') {
        shellResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      }

      return new Response(shellResponse.body, {
        status: 200,
        headers: shellResponse.headers,
      });
    }

    // For all other routes (prerendered SEO pages, assets, images), fetch directly
    return env.ASSETS.fetch(request);
  },
};
