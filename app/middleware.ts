import { NextResponse } from 'next/server'
// Entfernen wir den nicht verwendeten Import:
// import type { NextRequest } from 'next/server'

export function middleware() {
  const response = NextResponse.next()

  // CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('X-Frame-Options', 'ALLOWALL')

  return response
}

export const config = {
  matcher: '/:path*',
}