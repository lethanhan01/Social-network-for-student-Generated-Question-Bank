export const config = {
  runtime: 'edge',
}

const DEFAULT_UPSTREAM = 'https://snsqb.duckdns.org'
// hello
// Mirror vite.config.ts dev proxy: rewrite Origin to upstream host so Spring Security CorsFilter accepts requests from Vercel.
// shortcut: WebSocket (wss://) upgrades cannot be proxied via Vercel Edge Functions, whitelist Vercel origin on Backend when backend access is available.
export default async function handler(req) {
  const upstreamBase = globalThis.process?.env?.API_PROXY_TARGET || DEFAULT_UPSTREAM
  const upstreamOrigin = new URL(upstreamBase).origin
  const incomingUrl = new URL(req.url)

  const rewrittenPath = incomingUrl.searchParams.get('__path')
  incomingUrl.searchParams.delete('__path')

  const apiPath = rewrittenPath
    ? `/api/${rewrittenPath.replace(/^\/+/, '')}`
    : incomingUrl.pathname
  const targetUrl = new URL(apiPath, upstreamOrigin)
  targetUrl.search = incomingUrl.searchParams.toString()

  const headers = new Headers(req.headers)
  headers.set('Origin', upstreamOrigin)
  headers.set('Referer', `${upstreamOrigin}/`)
  headers.delete('host')

  const init = {
    method: req.method,
    headers,
    redirect: 'manual',
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = req.body
  }

  return fetch(targetUrl, init)
}

