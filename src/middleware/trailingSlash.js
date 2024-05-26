export function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (!url.pathname.endsWith("/")) {
    url.pathname += "/";
    return new Response(null, {
      status: 301,
      headers: { Location: url.toString() },
    });
  }
  return next();
}
