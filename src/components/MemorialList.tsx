'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getDay49Status } from '@/lib/day49'
import styles from '@/app/page.module.css'

type Memorial = { id: string; deceased_name: string; passed_at: string; relationship: string }

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export default function MemorialList({ initialList }: { initialList: Memorial[] }) {
  const router = useRouter()
  const [list, setList] = useState(initialList)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!menuId) return
    function close() { setMenuId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuId])

  async function handleDelete(id: string) {
    setDeleting(true)
    setDeleteError(null)
    try {
      const supabase = createClient()
      const { data: files } = await supabase.storage.from('memorial-media').list(id)
      if (files && files.length > 0) {
        await supabase.storage.from('memorial-media').remove(files.map(f => `${id}/${f.name}`))
      }
      const { error } = await supabase.from('memorials').delete().eq('id', id)
      if (error) {
        setDeleteError('삭제하지 못했어요. 다시 시도해주세요.')
        return
      }
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
          <li key={m.id}>
            {confirmId === m.id ? (
              <div className={styles.deleteConfirm}>
                <p className={styles.deleteConfirmText}>
                  정말 삭제하시겠어요?<br />삭제 후에는 복구할 수 없어요.
                </p>
                {deleteError && <p className={styles.deleteError}>{deleteError}</p>}
                <div className={styles.deleteConfirmActions}>
                  <button
                    className={styles.deleteCancelBtn}
                    onClick={() => { setConfirmId(null); setDeleteError(null) }}
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
              <div className={styles.memorialCard}>
                <Link
                  href={`/memorial/${m.id}`}
                  className={styles.cardLink}
                  aria-label={m.deceased_name}
                  onClick={(e) => {
                    if (localStorage.getItem(`anon_message_replay_${m.id}`) !== 'false') {
                      e.preventDefault()
                      router.push(`/memorial/${m.id}/message`)
                    }
                  }}
                />
                <div className={styles.cardInfo}>
                  <span className={styles.cardName}>{m.deceased_name}</span>
                  <span className={styles.cardMeta}>
                    {m.relationship} · {m.passed_at.replace(/-/g, '.')}
                    {(() => {
                      const day49 = getDay49Status(m.passed_at)
                      return day49.state === 'before'
                        ? <> · <span className={styles.cardDday}>49재까지 D-{day49.daysLeft}</span></>
                        : null
                    })()}
                  </span>
                </div>
                {menuId === m.id ? (
                  <div className={styles.inlineActions}>
                    <Link
                      href={`/edit/${m.id}`}
                      className={styles.menuBtn}
                      onClick={() => setMenuId(null)}
                      aria-label="수정하기"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      className={`${styles.menuBtn} ${styles.menuBtnDelete}`}
                      onClick={(e) => { e.stopPropagation(); setMenuId(null); setConfirmId(m.id) }}
                      aria-label="삭제하기"
                    >
                      <TrashIcon />
                    </button>
                    <button
                      className={styles.menuBtn}
                      onClick={(e) => { e.stopPropagation(); setMenuId(null) }}
                      aria-label="닫기"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ) : (
                  <button
                    className={styles.menuBtn}
                    onClick={(e) => { e.stopPropagation(); setMenuId(m.id) }}
                    aria-label="더보기"
                  >
                    <MoreIcon />
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <Link href="/create" className={styles.newMemorialBtn}>새 추모 공간 만들기</Link>
      <div className={styles.fixedActions}>
        <Link href="/logout" className={styles.fixedActionBtn} aria-label="로그아웃">
          <LogoutIcon />
        </Link>
      </div>
    </div>
  )
}
