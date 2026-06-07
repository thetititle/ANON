import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import styles from './page.module.css'
import LandingPage from './LandingPage'
import MemorialList from '@/components/MemorialList'

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

    return (
      <main className={styles.page}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <h1 className={styles.title}>안온</h1>
            <p className={styles.hanja}>安溫</p>
          </div>
          <Link href="/logout" className={styles.logoutBtn}>로그아웃</Link>
        </div>
        <MemorialList initialList={list} />
      </main>
    )
  }

  return <LandingPage />
}
