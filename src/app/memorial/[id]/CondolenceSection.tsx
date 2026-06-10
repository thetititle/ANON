'use client'

import { useState, type CSSProperties } from 'react'
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

const PETAL_OUT_R = 'M12 8C11.4 6 11.4 3.4 11.4 2.6C11.4 1.4 12.6 1.4 12.6 2.6C12.6 3.4 12.6 6 12 8Z'
const PETAL_OUT_L = 'M12 8C11.6 6 11 3.4 11.2 2.7C11 1.3 12.2 1.3 12.4 2.5C12.6 3.6 12.4 6 12 8Z'
const PETAL_OUTER_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330]

function FlowerIcon() {
  return (
    <svg viewBox="0 0 24 36" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
      {PETAL_OUTER_ANGLES.map((deg, i) => (
        <path key={`o${deg}`} d={i % 2 === 0 ? PETAL_OUT_R : PETAL_OUT_L} transform={`rotate(${deg} 12 8)`} />
      ))}
      <path d="M12 8C9.9 16.5 9.2 26.5 10.5 34.5" />
      <path d="M10.3 18.2c2.2.3 3.6-.8 4-2.6-1.8-1-3.6-.6-4.6 1" />
      <path d="M10 21.4c-2 1-3.8.4-4.5-1.4 1.7-1.3 3.7-1 4.7.4" />
    </svg>
  )
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) % 1
  return Math.abs(x)
}

function flowerStyle(index: number): CSSProperties {
  const angle = seededRandom(index * 1.1) * Math.PI * 2
  const radiusX = 14 + seededRandom(index * 2.3) * 34
  const radiusY = 10 + seededRandom(index * 3.7) * 24
  const left = Math.min(94, Math.max(6, 50 + Math.cos(angle) * radiusX))
  const top = Math.min(92, Math.max(30, 58 + Math.sin(angle) * radiusY))
  const rotate = (seededRandom(index * 5.1) - 0.5) * 50
  const size = 18 + seededRandom(index * 7.3) * 10

  return {
    left: `${left}%`,
    top: `${top}%`,
    width: `${size}px`,
    height: `${size * 1.5}px`,
    transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
    animationDelay: `${Math.min(index * 0.1, 2)}s`,
  }
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
  const [kakaoCopied, setKakaoCopied] = useState(false)
  const [wantsPayment, setWantsPayment] = useState(false)

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

  function openToss() {
    window.location.href = `supertoss://send?bank=${encodeURIComponent(bankName ?? '')}&accountNo=${encodeURIComponent(accountNumber ?? '')}`
  }

  async function openKakaoPay() {
    if (accountNumber) await navigator.clipboard.writeText(accountNumber)
    setKakaoCopied(true)
    setTimeout(() => setKakaoCopied(false), 3000)
    setTimeout(() => { window.location.href = 'kakaopay://' }, 100)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <section className={styles.condolenceSection}>
      <div className={styles.condolenceScroll}>
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

          {showPayment && (
            <div className={styles.paymentToggleArea}>
              <button
                type="button"
                className={styles.paymentToggleBtn}
                onClick={() => setWantsPayment(v => !v)}
              >
                <span>조의금도 함께 전하기</span>
                <span className={wantsPayment ? styles.chevronUp : styles.chevronDown}>›</span>
              </button>

              <div className={`${styles.paymentExpanded} ${wantsPayment ? styles.paymentExpandedOpen : ''}`}>
                <div className={styles.paymentExpandedInner}>
                  <div className={styles.paymentBtnRow}>
                    <button type="button" className={styles.paymentBtn} onClick={openToss}>
                      토스로 보내기
                    </button>
                    <button type="button" className={styles.paymentBtn} onClick={openKakaoPay}>
                      {kakaoCopied ? '복사됨 · 앱 열기' : '카카오페이'}
                    </button>
                  </div>
                  <button type="button" className={styles.paymentBtn} onClick={copyAccount}>
                    {copied ? '계좌번호 복사됨' : '계좌번호 복사'}
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
              </div>
            </div>
          )}

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

          {showPayment && (
            <div className={styles.paymentSection}>
              <div className={styles.paymentBtnRow}>
                <button className={styles.paymentBtn} onClick={openToss}>토스로 보내기</button>
                <button className={styles.paymentBtn} onClick={openKakaoPay}>
                  {kakaoCopied ? '복사됨 · 앱 열기' : '카카오페이'}
                </button>
              </div>
              <button className={styles.paymentBtn} onClick={copyAccount}>
                {copied ? '계좌번호 복사됨' : '계좌번호 복사'}
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
        </div>
      )}
      </div>

      <div className={styles.flowerArea}>
        <div className={styles.flowerField}>
          {comments.map((c, i) => (
            <span key={c.id} className={styles.flower} style={flowerStyle(i)}>
              <FlowerIcon />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
