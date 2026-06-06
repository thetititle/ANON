'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './memorial.module.css'

type Comment = {
  id: string
  content: string
  created_at: string
  user_id: string | null
  author_name: string | null
}

type Props = {
  memorialId: string
  initialComments: Comment[]
  currentUserId: string | null
  currentUserName: string | null
}

export default function CondolenceSection({ memorialId, initialComments, currentUserId, currentUserName }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function signIn(provider: 'kakao' | 'google') {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(location.pathname)}`,
      },
    })
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data, error: insertError } = await supabase
      .from('memorial_comments')
      .insert({
        memorial_id: memorialId,
        user_id: currentUserId,
        content: content.trim(),
      })
      .select()
      .single()

    if (insertError) {
      setError('메시지를 남기지 못했어요. 다시 시도해주세요.')
      setIsSubmitting(false)
      return
    }

    setComments(prev => [{ ...data, author_name: currentUserName }, ...prev])
    setContent('')
    setIsSubmitting(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <section className={styles.condolenceSection}>
      <div className={styles.divider} />

      {comments.length > 0 && (
        <ul className={styles.commentList}>
          {comments.map((c) => (
            <li key={c.id} className={styles.commentItem}>
              <div className={styles.commentMeta}>
                <span className={styles.commentName}>{c.author_name ?? '익명'}</span>
                <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
              </div>
              <p className={styles.commentContent}>{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {currentUserId ? (
        <form onSubmit={handleSubmit} className={styles.commentForm}>
          <textarea
            className={styles.commentTextarea}
            placeholder="고인에게 전하고 싶은 말을 남겨주세요."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            maxLength={500}
          />
          {error && <p className={styles.commentError}>{error}</p>}
          <button
            type="submit"
            className={styles.commentSubmit}
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? '전송 중...' : '조문 메시지 남기기'}
          </button>
        </form>
      ) : (
        <div className={styles.authPrompt}>
          <p className={styles.authPromptText}>
            올바른 추모 문화를 위해 작성자의 정보를 제공 받습니다.{'\n'}제공받은 정보는 49일 후 삭제됩니다.
          </p>
          <div className={styles.authButtons}>
            <button className={`${styles.authBtn} ${styles.kakaoBtn}`} onClick={() => signIn('kakao')}>
              카카오로 인증하기
            </button>
            <button className={`${styles.authBtn} ${styles.googleBtn}`} onClick={() => signIn('google')}>
              구글로 인증하기
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
