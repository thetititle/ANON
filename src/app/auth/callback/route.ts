import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`)
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()
  let isNewUser = false

  if (user) {
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existing) {
      isNewUser = true
      const realName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.user_metadata?.preferred_username ??
        '이름 없음'
      await supabase.from('users').insert({ id: user.id, real_name: realName })
    }
  }

  // 특정 페이지 복귀 (예: /memorial/xxx 세션 만료 후 재진입)
  if (next && next !== '/' && next !== '/create') {
    return NextResponse.redirect(`${origin}${next}`)
  }

  // 신규 가입자는 바로 생성 폼으로, 기존 사용자는 홈으로
  return NextResponse.redirect(`${origin}${isNewUser ? '/create' : '/'}`)
}
