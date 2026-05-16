'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './login.module.css'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')
  const supabase = createClient()

  async function signIn(provider: 'kakao' | 'google') {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
  }

  return (
    <>
      <div className={styles.buttons}>
        <button className={`${styles.oauthBtn} ${styles.kakao}`} onClick={() => signIn('kakao')}>
          카카오로 시작하기
        </button>
        <button className={`${styles.oauthBtn} ${styles.google}`} onClick={() => signIn('google')}>
          구글로 시작하기
        </button>
      </div>
      {error && (
        <p className={styles.error}>
          {error === 'auth_failed' ? '로그인 중 오류가 발생했어요. 다시 시도해주세요.' : '잠시 후 다시 시도해주세요.'}
        </p>
      )}
    </>
  )
}

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>안온</h1>
        <p className={styles.hanja}>安溫</p>
      </div>
      <p className={styles.desc}>
        추모 공간을 만들기 위해<br />본인 확인이 필요해요.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  )
}
