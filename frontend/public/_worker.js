const KNOWN_PUBLIC_ROUTE_PATTERNS = [
  /^\/destinations\/[^/]+$/,
  /^\/destinations\/[^/]+\/(packages|hotel-packages|group-trips|attractions|hotels|activities|book)$/,
  /^\/destinations\/[^/]+\/(hotels|activities|attractions)\/[^/]+$/,
  /^\/destinations\/(regions|countries)\/[^/]+$/,
  /^\/destinations-old\/[^/]+$/,
  /^\/regions(\/[^/]+)?$/,
  /^\/countries(\/[^/]+)?$/,
  /^\/packages(\/[^/]+(\/[^/]+)?)?$/,
  /^\/packages-old\/[^/]+$/,
  /^\/hotels(\/[^/]+(\/[^/]+)?)?$/,
  /^\/activities(\/[^/]+(\/[^/]+)?)?$/,
  /^\/attractions(\/[^/]+(\/[^/]+)?)?$/,
  /^\/holiday-types(\/[^/]+)?$/,
  /^\/group-trips(\/[^/]+)?$/,
  /^\/blog(\/[^/]+)?$/,
  /^\/(stays|contact|about-us|contact-us|careers|terms|privacy|payment-plans|visa-application|flights)$/,
];

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

    // For all other routes (prerendered SEO pages, assets, images), fetch directly first
    const assetResponse = await env.ASSETS.fetch(request);

    // If a static pre-rendered page isn't found yet (e.g. newly published CMS item or dynamic route),
    // fallback to the root SPA shell if the URL matches a valid React Router route pattern.
    const hasFileExtension = /\.[a-z0-9]+$/i.test(path.split('/').pop() || '');
    if (
      assetResponse.status === 404 &&
      !hasFileExtension &&
      KNOWN_PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(path))
    ) {
      const shellResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
      return new Response(shellResponse.body, {
        status: 200,
        headers: shellResponse.headers,
      });
    }

    return assetResponse;
  },
};
