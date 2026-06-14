import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Next.js Link의 자동 prefetch 요청은 통과시킨다.
  // prefetch 요청에서도 getUser()가 refresh token을 사용해 토큰을 갱신하면,
  // 거의 동시에 도착하는 실제 페이지 요청과 refresh token rotation이 경쟁해
  // 한쪽이 "이미 사용된 refresh token" 오류로 세션이 끊기는 문제가 있었다.
  if (request.headers.get('next-router-prefetch') || request.headers.get('purpose') === 'prefetch') {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })
  let refreshed = false

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          refreshed = true
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  // TEMP DEBUG: 프로덕션에서 세션이 끊기는 문제 진단용. 원인 파악 후 제거.
  const debugCookieNames = request.cookies.getAll().map(c => c.name).join(',')

  if (!user && request.nextUrl.pathname.startsWith('/create')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', request.nextUrl.pathname)
    const res = NextResponse.redirect(url)
    res.headers.set('x-debug-user', 'none')
    res.headers.set('x-debug-error', error?.message ?? 'none')
    res.headers.set('x-debug-refreshed', String(refreshed))
    res.headers.set('x-debug-cookies', debugCookieNames)
    return res
  }

  supabaseResponse.headers.set('x-debug-user', user?.id ?? 'none')
  supabaseResponse.headers.set('x-debug-error', error?.message ?? 'none')
  supabaseResponse.headers.set('x-debug-refreshed', String(refreshed))
  supabaseResponse.headers.set('x-debug-cookies', debugCookieNames)

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
