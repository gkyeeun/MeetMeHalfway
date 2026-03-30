import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const restKey = env.KAKAO_REST_KEY
  if (!restKey || restKey === 'your_kakao_rest_api_key_here') {
    console.warn('\n[proxy] ⚠️  KAKAO_REST_KEY가 설정되지 않았습니다.')
    console.warn('         .env 파일에 REST API 키를 입력하고 서버를 재시작하세요.\n')
  } else {
    console.log(`[proxy] ✅ KAKAO_REST_KEY 로드됨 (${restKey.slice(0, 6)}…)`)
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/kakao-places': {
          target: 'https://dapi.kakao.com',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/kakao-places/, '/v2/local/search/keyword.json'),
          headers: {
            Authorization: `KakaoAK ${restKey}`,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (_req, _res) => {
              if (!restKey || restKey === 'your_kakao_rest_api_key_here') {
                console.error('[proxy] ❌ /api/kakao-places: KAKAO_REST_KEY 없음 → 401 예상됨')
              }
            })
            proxy.on('error', (err) => {
              console.error('[proxy] /api/kakao-places error:', err.message)
            })
          },
        },
      },
    },
  }
})
