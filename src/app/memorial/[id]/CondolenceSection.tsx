'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
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

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
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

function RibbonIcon() {
  return (
    <svg viewBox="0 0 32 40" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="8" r="6" />
      <path d="M20 17C14 23 6 31 4 38C7 35 9 33 10 32C11 34 12 36 13 37C16 30 18 23 22 18Z" />
      <path d="M12 17C18 23 26 31 28 38C25 35 23 33 22 32C21 34 20 36 19 37C16 30 14 23 10 18Z" />
    </svg>
  )
}

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
  let t = (seed + 0x6D2B79F5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function flowerStyle(seed: number, delayIndex: number): CSSProperties {
  const angle = (seed * 137.508 + (seededRandom(seed * 5) - 0.5) * 30) * (Math.PI / 180)
  const radiusX = 16 + seededRandom(seed * 5 + 1) * 44
  const radiusY = 12 + seededRandom(seed * 5 + 2) * 28
  const left = Math.min(96, Math.max(4, 50 + Math.cos(angle) * radiusX))
  const top = Math.min(92, Math.max(30, 58 + Math.sin(angle) * radiusY))
  const rotate = (seededRandom(seed * 5 + 3) - 0.5) * 50
  const size = 18 + seededRandom(seed * 5 + 4) * 10

  return {
    left: `${left.toFixed(2)}%`,
    top: `${top.toFixed(2)}%`,
    width: `${size.toFixed(2)}px`,
    height: `${(size * 1.5).toFixed(2)}px`,
    transform: `translate(-50%, -50%) rotate(${rotate.toFixed(2)}deg)`,
    animationDelay: `${Math.min(delayIndex * 0.1, 2)}s`,
  }
}

type Comment = {
  id: string
  content: string
  created_at: string
  updated_at: string | null
  user_id: string | null
  author_name: string | null
}

type Donation = {
  id: string
  user_id: string
  amount: number | null
  created_at: string
  author_name: string
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
  initialDonations: Donation[]
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
  initialDonations,
}: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [kakaoCopied, setKakaoCopied] = useState(false)
  const [wantsPayment, setWantsPayment] = useState(false)
  const [showFormModal, setShowFormModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [visibleCount, setVisibleCount] = useState(10)
  const [menuId, setMenuId] = useState<string | null>(null)
  const [donations, setDonations] = useState<Donation[]>(initialDonations)
  const [donationAmount, setDonationAmount] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [hasDonated, setHasDonated] = useState(
    () => !!currentUserId && initialDonations.some(d => d.user_id === currentUserId)
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  // 메시지 목록을 스크롤할 땐 Swiper의 페이지 전환(슬라이드/마우스휠)으로 전파되지 않도록 막고,
  // 스크롤이 위/아래 끝에 닿아 더 이상 움직일 수 없을 때만 Swiper에 제스처를 넘긴다.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let startY = 0
    let locked: boolean | null = null
    let hasInteracted = false

    const atTop = () => el.scrollTop <= 0
    const atBottom = () => el.scrollTop + el.clientHeight >= el.scrollHeight - 1

    function onTouchStart(e: TouchEvent) {
      startY = e.touches[0].clientY
      locked = null
      hasInteracted = true
    }

    function onTouchMove(e: TouchEvent) {
      if (locked === false) {
        e.stopPropagation()
        return
      }
      if (locked === null) {
        const deltaY = e.touches[0].clientY - startY
        const reachedEdge = (deltaY > 0 && atTop()) || (deltaY < 0 && atBottom())
        locked = !reachedEdge
        if (locked) e.stopPropagation()
      }
    }

    function onTouchEnd() {
      locked = null
    }

    function onWheel(e: WheelEvent) {
      const reachedEdge = (e.deltaY < 0 && atTop()) || (e.deltaY > 0 && atBottom())
      if (!reachedEdge) e.stopPropagation()
    }

    // 스크롤이 위/아래 끝에 닿는 순간 살짝 튕기는 느낌을 줘서 더 이상 내용이 없음을 알린다.
    let prevScrollTop = el.scrollTop
    const bounce = (className: string) => {
      el.classList.remove(styles.bounceTop, styles.bounceBottom)
      void el.offsetHeight // 애니메이션 재시작을 위한 강제 리플로우
      el.classList.add(className)
      if (hasInteracted && navigator.vibrate) navigator.vibrate(8)
    }

    const onScroll = () => {
      const top = atTop()
      const bottom = atBottom()
      if (top && prevScrollTop > 0) {
        bounce(styles.bounceTop)
      } else if (bottom && prevScrollTop + el.clientHeight < el.scrollHeight - 1) {
        bounce(styles.bounceBottom)
      }
      prevScrollTop = el.scrollTop
    }

    const onAnimationEnd = () => {
      el.classList.remove(styles.bounceTop, styles.bounceBottom)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('scroll', onScroll, { passive: true })
    el.addEventListener('animationend', onAnimationEnd)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('scroll', onScroll)
      el.removeEventListener('animationend', onAnimationEnd)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

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
    setShowFormModal(false)
  }

  async function copyAccount() {
    if (!accountNumber) return
    await navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function recordDonation() {
    if (!currentUserId) return
    setIsRecording(true)

    const supabase = createClient()
    const trimmed = donationAmount.trim()
    const amount = trimmed ? Number(trimmed) : null
    const { data, error: insertError } = await supabase
      .from('memorial_donations')
      .insert({ memorial_id: memorialId, user_id: currentUserId, amount })
      .select()
      .single()

    if (!insertError) {
      setDonations(prev => [{ ...data, author_name: currentUserName ?? '익명' }, ...prev])
      setHasDonated(true)
    }
    setIsRecording(false)
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

  function startEdit(c: Comment) {
    setConfirmDeleteId(null)
    setActionError(null)
    setEditingId(c.id)
    setEditContent(c.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  async function saveEdit(id: string) {
    const trimmed = editContent.trim()
    if (!trimmed) return

    setIsSaving(true)
    setActionError(null)

    const supabase = createClient()
    const updatedAt = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('memorial_comments')
      .update({ content: trimmed, updated_at: updatedAt })
      .eq('id', id)

    if (updateError) {
      setActionError('수정하지 못했어요. 다시 시도해주세요.')
      setIsSaving(false)
      return
    }

    setComments(prev => prev.map(c => c.id === id ? { ...c, content: trimmed, updated_at: updatedAt } : c))
    setEditingId(null)
    setIsSaving(false)
  }

  async function handleDelete(c: Comment) {
    setIsDeleting(true)
    setActionError(null)

    const supabase = createClient()
    const { error: archiveError } = await supabase
      .from('memorial_comments_archive')
      .insert({
        original_id: c.id,
        memorial_id: memorialId,
        user_id: c.user_id,
        content: c.content,
        deleted_at: new Date().toISOString(),
        deleted_by: currentUserId,
      })

    if (archiveError) {
      setActionError('삭제하지 못했어요. 다시 시도해주세요.')
      setIsDeleting(false)
      return
    }

    const { error: deleteError } = await supabase
      .from('memorial_comments')
      .delete()
      .eq('id', c.id)

    if (deleteError) {
      setActionError('삭제하지 못했어요. 다시 시도해주세요.')
      setIsDeleting(false)
      return
    }

    setComments(prev => prev.filter(item => item.id !== c.id))
    setConfirmDeleteId(null)
    setIsDeleting(false)
  }

  return (
    <section className={styles.condolenceSection}>
      <div className={styles.condolenceHeader}>
        <div className={styles.ribbon}>
          <RibbonIcon />
        </div>
      </div>

      {showPayment && donations.length > 0 && (() => {
        const lines = donations.map(d => `${d.author_name}님이 마음을 전했어요`)
        return (
          <div className={styles.donationGuestbook}>
            {lines.length > 1 ? (
              <div className={styles.donationTicker}>
                <div
                  className={styles.donationTickerInner}
                  style={{ animationDuration: `${lines.length * 2.5}s` }}
                >
                  {[...lines, ...lines].map((line, i) => (
                    <p key={i} className={styles.donationGuestbookText}>{line}</p>
                  ))}
                </div>
              </div>
            ) : (
              <p className={styles.donationGuestbookText}>{lines[0]}</p>
            )}
          </div>
        )
      })()}

      <div className={styles.condolenceScroll} ref={scrollRef}>
      {comments.length > 0 && (
        <ul className={styles.commentList}>
          {comments.slice(0, visibleCount).map((c) => (
            <li key={c.id} className={styles.commentItem}>
              {confirmDeleteId === c.id ? (
                <div className={styles.commentDeleteConfirm}>
                  <p className={styles.commentDeleteConfirmText}>
                    이 작별인사를 삭제하시겠어요?<br />삭제 후에는 복구할 수 없어요.
                  </p>
                  {actionError && <p className={styles.commentError}>{actionError}</p>}
                  <div className={styles.commentEditActions}>
                    <button
                      type="button"
                      className={styles.commentEditCancelBtn}
                      onClick={() => { setConfirmDeleteId(null); setActionError(null) }}
                      disabled={isDeleting}
                    >취소</button>
                    <button
                      type="button"
                      className={styles.commentDeleteBtn}
                      onClick={() => handleDelete(c)}
                      disabled={isDeleting}
                    >{isDeleting ? '삭제 중...' : '삭제하기'}</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.commentMeta}>
                    <span className={styles.commentName}>{c.author_name ?? '익명'}</span>
                    {c.updated_at && <span className={styles.commentEdited}>(수정됨)</span>}
                    <span className={styles.commentDate}>{formatDate(c.created_at)}</span>
                  </div>
                  {editingId === c.id ? (
                    <div className={styles.commentEditForm}>
                      <textarea
                        className={styles.commentEditTextarea}
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={3}
                        maxLength={500}
                        autoFocus
                      />
                      {actionError && <p className={styles.commentError}>{actionError}</p>}
                      <div className={styles.commentEditActions}>
                        <button type="button" className={styles.commentEditCancelBtn} onClick={cancelEdit} disabled={isSaving}>취소</button>
                        <button
                          type="button"
                          className={styles.commentEditSaveBtn}
                          onClick={() => saveEdit(c.id)}
                          disabled={isSaving || !editContent.trim()}
                        >{isSaving ? '저장 중...' : '저장'}</button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.commentContentRow}>
                      <p className={styles.commentContent}>{c.content}</p>
                      {currentUserId && c.user_id === currentUserId && (
                        <div className={styles.commentMoreWrap}>
                          <button
                            type="button"
                            className={styles.commentMoreBtn}
                            onClick={() => setMenuId(m => m === c.id ? null : c.id)}
                            aria-label="더보기"
                          >⋯</button>
                          {menuId === c.id && (
                            <div className={styles.commentMoreMenu}>
                              <button
                                type="button"
                                className={styles.commentActionBtn}
                                onClick={() => { startEdit(c); setMenuId(null) }}
                              >수정</button>
                              <button
                                type="button"
                                className={`${styles.commentActionBtn} ${styles.commentActionBtnDanger}`}
                                onClick={() => { setConfirmDeleteId(c.id); setActionError(null); setMenuId(null) }}
                              >삭제</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {comments.length > visibleCount && (
        <button
          type="button"
          className={styles.loadMoreBtn}
          onClick={() => setVisibleCount(c => c + 10)}
        >
          더보기 ({comments.length - visibleCount})
        </button>
      )}

      {comments.length === 0 && currentUserId && (
        <div className={styles.emptyCondolence}>
          <p className={styles.emptyCondolenceText}>아직 작별인사가 없어요</p>
          <button
            type="button"
            className={styles.commentSubmit}
            onClick={() => setShowFormModal(true)}
          >
            작별인사하기
          </button>
        </div>
      )}

      {!currentUserId && (
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

      {currentUserId && comments.length > 0 && (
        <div className={styles.commentSubmitBar}>
          <button
            type="button"
            className={styles.commentSubmit}
            onClick={() => setShowFormModal(true)}
          >
            작별인사하기
          </button>
        </div>
      )}

      {showFormModal && mounted && createPortal(
        <div className={styles.commentModalOverlay} onClick={() => setShowFormModal(false)}>
          <div className={styles.commentModal}>
            <form id="condolence-form" onSubmit={handleSubmit} className={styles.commentForm} onClick={e => e.stopPropagation()}>
              <div className={styles.modalCloseRow}>
                <button type="button" className={styles.modalXBtnForm} onClick={() => setShowFormModal(false)}>
                  <CloseIcon />
                </button>
              </div>

              <textarea
                className={styles.commentTextarea}
                placeholder="고인에게 전하고 싶은 말을 남겨주세요."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                maxLength={500}
                autoFocus
              />

              {showPayment && (
                <div className={styles.paymentToggleArea}>
                  <button
                    type="button"
                    className={styles.paymentToggleBtn}
                    onClick={() => setWantsPayment(v => !v)}
                  >
                    <span>조의금도 함께 전하기</span>
                    <span className={wantsPayment ? styles.chevronUp : styles.chevronDown}>
                      <ChevronIcon />
                    </span>
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

                      {hasDonated ? (
                        <p className={styles.donationRecordedText}>마음을 전해주셔서 감사해요</p>
                      ) : (
                        <div className={styles.donationRecordRow}>
                          <input
                            type="number"
                            inputMode="numeric"
                            className={styles.donationAmountInput}
                            placeholder="금액 (선택, 본인만 확인)"
                            value={donationAmount}
                            onChange={e => setDonationAmount(e.target.value)}
                          />
                          <button
                            type="button"
                            className={styles.donationRecordBtn}
                            onClick={recordDonation}
                            disabled={isRecording}
                          >
                            {isRecording ? '기록 중...' : '전했어요'}
                          </button>
                        </div>
                      )}
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
                {isSubmitting ? '전송 중...' : content.trim() ? '작별인사를 남깁니다' : '작별인사를 남겨주세요'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className={styles.flowerArea}>
        <div className={styles.flowerField}>
          {comments.map((c, i) => (
            <span key={c.id} className={styles.flower} style={flowerStyle(comments.length - 1 - i, i)}>
              <FlowerIcon />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
