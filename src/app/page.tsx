import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let memorials: { id: string; deceased_name: string; passed_at: string; relationship: string }[] = []
  if (user) {
    const { data } = await supabase
      .from('memorials')
      .select('id, deceased_name, passed_at, relationship')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    memorials = data ?? []
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <h1 className={styles.title}>안온</h1>
          <p className={styles.hanja}>安溫</p>
        </div>
        {user && (
          <Link href="/logout" className={styles.logoutBtn}>로그아웃</Link>
        )}
      </div>

      {user ? (
        <div className={styles.content}>
          {memorials.length > 0 ? (
            <>
              <p className={styles.label}>추모 공간</p>
              <ul className={styles.list}>
                {memorials.map((m) => (
                  <li key={m.id}>
                    <Link href={`/memorial/${m.id}`} className={styles.memorialCard}>
                      <span className={styles.cardName}>{m.deceased_name}</span>
                      <span className={styles.cardMeta}>{m.relationship} · {m.passed_at.replace(/-/g, '.')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className={styles.empty}>아직 만든 추모 공간이 없어요.</p>
          )}
          <Link href="/create" className={styles.createBtn}>+ 새 추모 공간 만들기</Link>
        </div>
      ) : (
        <div className={styles.content}>
          <p className={styles.desc}>소중한 분을 기억하는 공간</p>
          <Link href="/create" className={styles.createBtn}>시작하기</Link>
        </div>
      )}
    </main>
  )
}
