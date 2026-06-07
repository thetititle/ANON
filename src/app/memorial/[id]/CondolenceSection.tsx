'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import styles from './memorial.module.css'

const BANK_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  '신한':  { bg: '#0046FF', color: '#fff', label: '신한' },
  '국민':  { bg: '#FFBC00', color: '#fff', label: 'KB' },
  'KB':    { bg: '#FFBC00', color: '#fff', label: 'KB' },
  '하나':  { bg: '#00927A', color: '#fff', label: '하나' },
  '우리':  { bg: '#004A96', color: '#fff', label: '우리' },
  '농협':  { bg: '#00A650', color: '#fff', label: 'NH' },
  'NH':    { bg: '#00A650', color: '#fff', label: 'NH' },
  '기업':  { bg: '#006AB5', color: '#fff', label: 'IBK' },
  'IBK':   { bg: '#006AB5', color: '#fff', label: 'IBK' },
  'SC':    { bg: '#0B7B3E', color: '#fff', label: 'SC' },
  '씨티':  { bg: '#056DAE', color: '#fff', label: 'Citi' },
  '카카오': { bg: '#FEE500', color: '#3C1E1E', label: '카카오' },
  '토스':  { bg: '#0064FF', color: '#fff', label: 'toss' },
  '케이뱅크': { bg: '#9B51E0', color: '#fff', label: 'K' },
  '새마을': { bg: '#E8002D', color: '#fff', label: '새마을' },
  '신협':  { bg: '#EC6723', color: '#fff', label: '신협' },
  '우체국': { bg: '#E61E2B', color: '#fff', label: '우체국' },
  '수협':  { bg: '#0067AC', color: '#fff', label: '수협' },
  '부산':  { bg: '#004A96', color: '#fff', label: '부산' },
  '대구':  { bg: '#00529B', color: '#fff', label: '대구' },
  '광주':  { bg: '#009F4D', color: '#fff', label: '광주' },
  '전북':  { bg: '#00529B', color: '#fff', label: '전북' },
  '제주':  { bg: '#E61E2B', color: '#fff', label: '제주' },
  '경남':  { bg: '#004A96', color: '#fff', label: '경남' },
}

function getBankBadge(bankName: string) {
  const key = Object.keys(BANK_COLORS).find(k => bankName.includes(k))
  return key ? BANK_COLORS[key] : null
}

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
  acceptsCondolence: boolean
  bankName: string | null
  accountNumber: string | null
  accountHolder: string | null
}

export default function CondolenceSection({
  memorialId,
  initialComments,
  currentUserId,
  currentUserName,
  acceptsCondolence,
  bankName,
  accountNumber,
  accountHolder,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const showPayment = acceptsCondolence && bankName && accountNumber && accountHolder

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

  async function copyAccount() {
    if (!accountNumber) return
    await navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <section className={styles.condolenceSection}>
      <div className={styles.divider} />
      <p className={styles.condolenceTitle}>조의를 전합니다</p>

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
            {isSubmitting ? '전송 중...' : content.trim() ? '조의를 전합니다' : '내용을 입력해 주세요'}
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

      {showPayment && (
        <div className={styles.paymentSection}>
          <button className={styles.paymentBtn} onClick={copyAccount}>
            {copied ? '계좌번호 복사됨' : '조의금 함께 전하기'}
          </button>
          <p className={styles.paymentMeta}>
            {(() => {
              const badge = getBankBadge(bankName!)
              return badge ? (
                <span className={styles.bankBadge} style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              ) : null
            })()}
            {bankName} · {accountNumber} · {accountHolder}
          </p>
        </div>
      )}
    </section>
  )
}
