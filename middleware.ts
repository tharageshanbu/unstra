import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Define our guards
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  // The "Both-Environments" Fix: Only redirect if they are unauthorized AND trying to access a protected route
  if (!user && isDashboard && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  // Matching both routes ensures the middleware manages the session for both
  matcher: ['/dashboard/:path*', '/login'],
}