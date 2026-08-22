import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const userCookie = request.cookies.get('user')?.value
  
  let isAdmin = false
  let isAuthenticated = false
  
  try {
    if (userCookie && token) {
      const user = JSON.parse(decodeURIComponent(userCookie))
      isAdmin = user?.role === 'admin'
      isAuthenticated = true
    }
  } catch (e) {
    // Invalid cookie
  }
  
  const { pathname } = request.nextUrl
  
  // 🔒 Block admin routes for non-admin users
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }
  
  // 🔒 Redirect to dashboard if already logged in
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/resident/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register'],
}