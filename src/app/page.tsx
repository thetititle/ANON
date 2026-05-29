import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'

type Memorial = { id: string; deceased_name: string; passed_at: string; relationship: string }

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: memorials } = await supabase
      .from('memorials')
      .select('id, deceased_name, passed_at, relationship')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const list = (memorials ?? []) as Memorial[]

    if (list.length === 0) redirect('/create')

    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <h1 className={styles.title}>안온</h1>
            <p className={styles.hanja}>安溫</p>
          </div>
          <Link href="/logout" className={styles.logoutBtn}>로그아웃</Link>
        </div>
        <div className={styles.content}>
          <ul className={styles.list}>
            {list.map((m) => (
              <li key={m.id}>
                <Link href={`/memorial/${m.id}`} className={styles.memorialCard}>
                  <span className={styles.cardName}>{m.deceased_name}</span>
                  <span className={styles.cardMeta}>{m.relationship} · {m.passed_at.replace(/-/g, '.')}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/create" className={styles.newMemorialLink}>새 추모 공간 만들기</Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <h1 className={styles.title}>안온</h1>
          <p className={styles.hanja}>安溫</p>
        </div>
      </div>
      <div className={styles.content}>
        <p className={styles.desc}>소중한 분을 기억하는 공간</p>
        <Link href="/create" className={styles.createBtn}>시작하기</Link>
      </div>
    </main>
  )
}
