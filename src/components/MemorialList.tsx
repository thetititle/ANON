'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import styles from '@/app/page.module.css'

type Memorial = { id: string; deceased_name: string; passed_at: string; relationship: string }

export default function MemorialList({ initialList }: { initialList: Memorial[] }) {
  const router = useRouter()
  const [list, setList] = useState(initialList)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!menuId) return
    function close() { setMenuId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuId])

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { data: files } = await supabase.storage.from('memorial-media').list(id)
      if (files && files.length > 0) {
        await supabase.storage.from('memorial-media').remove(files.map(f => `${id}/${f.name}`))
      }
      await supabase.from('memorials').delete().eq('id', id)
      const next = list.filter(m => m.id !== id)
      setList(next)
      setConfirmId(null)
      if (next.length === 0) router.push('/')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={styles.content}>
      <ul className={styles.list}>
        {list.map((m) => (
          <li key={m.id} className={styles.cardWrapper}>
            {confirmId === m.id ? (
              <div className={styles.deleteConfirm}>
                <p className={styles.deleteConfirmText}>
                  정말 삭제하시겠어요?<br />삭제 후에는 복구할 수 없어요.
                </p>
                <div className={styles.deleteConfirmActions}>
                  <button
                    className={styles.deleteCancelBtn}
                    onClick={() => setConfirmId(null)}
                    disabled={deleting}
                  >취소</button>
                  <button
                    className={styles.deleteConfirmBtn}
                    onClick={() => handleDelete(m.id)}
                    disabled={deleting}
                  >{deleting ? '삭제 중...' : '삭제하기'}</button>
                </div>
              </div>
            ) : (
              <>
                <Link href={`/memorial/${m.id}`} className={styles.memorialCard}>
                  <span className={styles.cardName}>{m.deceased_name}</span>
                  <span className={styles.cardMeta}>{m.relationship} · {m.passed_at.replace(/-/g, '.')}</span>
                </Link>
                <button
                  className={styles.menuBtn}
                  onClick={(e) => { e.stopPropagation(); setMenuId(menuId === m.id ? null : m.id) }}
                >⋯</button>
                {menuId === m.id && (
                  <div className={styles.menuDropdown}>
                    <Link
                      href={`/edit/${m.id}`}
                      className={styles.menuItem}
                      onClick={() => setMenuId(null)}
                    >수정하기</Link>
                    <button
                      className={`${styles.menuItem} ${styles.menuItemDelete}`}
                      onClick={(e) => { e.stopPropagation(); setMenuId(null); setConfirmId(m.id) }}
                    >삭제하기</button>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ul>
      <Link href="/create" className={styles.newMemorialLink}>새 추모 공간 만들기</Link>
    </div>
  )
}
