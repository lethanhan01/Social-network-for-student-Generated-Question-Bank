import { createLogger, defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

const DEFAULT_API_PROXY_TARGET = 'https://snsqb.duckdns.org'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.API_PROXY_TARGET || DEFAULT_API_PROXY_TARGET

  const customLogger = createLogger()
  const originalError = customLogger.error.bind(customLogger)
  customLogger.error = (msg, options) => {
    if (
      msg.includes('ws proxy socket error') &&
      (msg.includes('ECONNRESET') || msg.includes('ECONNABORTED') || msg.includes('EPIPE'))
    ) {
      return
    }
    originalError(msg, options)
  }

  return {
    customLogger,
    plugins: [tailwindcss(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          ws: true,
          configure: (proxy) => {
            // The browser talks to this same-origin dev proxy. Keep Spring's
            // origin check consistent with the upstream Host rewritten above.
            proxy.on('proxyReq', (proxyReq, req) => {
              if (req.headers.origin) proxyReq.setHeader('Origin', new URL(proxyTarget).origin)
            })
            proxy.on('proxyReqWs', (proxyReq) => {
              proxyReq.setHeader('Origin', new URL(proxyTarget).origin)
            })
            proxy.on('error', (err, _req, res) => {
              const code = (err as { code?: string }).code
              if (code === 'ECONNRESET' || code === 'ECONNABORTED' || code === 'ECONNREFUSED') {
                if ('writeHead' in res && !res.headersSent) {
                  res.writeHead(502, { 'Content-Type': 'application/json' })
                  res.end(
                    JSON.stringify({
                      success: false,
                      code: 'BACKEND_UNAVAILABLE',
                      message: 'SQB Backend service is restarting or temporarily unavailable',
                    })
                  )
                }
              }
            })
          },
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (/[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/.test(id)) {
              return 'vendor-react'
            }
            if (id.includes('@tanstack/react-query')) return 'vendor-query'
            if (id.includes('emoji-picker-react')) return 'vendor-emoji'
            if (id.includes('@stomp/stompjs')) return 'vendor-stomp'
            if (id.includes('zod')) return 'vendor-zod'
            if (id.includes('radix-ui') || id.includes('@radix-ui')) return 'vendor-radix'
            if (/[\\/]node_modules[\\/](i18next|react-i18next|i18next-browser-languagedetector)[\\/]/.test(id)) {
              return 'vendor-i18n'
            }
            if (/[\\/]node_modules[\\/](lucide-react|clsx|tailwind-merge)[\\/]/.test(id)) {
              return 'vendor-ui'
            }
          },
        },
      },
    },
  }
})
