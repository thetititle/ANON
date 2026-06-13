'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import styles from './memorial.module.css'

const ONBOARDING_KEY = 'anon-onboarding-seen'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M5 12l7-7M5 12l7 7" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10" />
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

function AnonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </svg>
  )
}

export default function MemorialHeader({ memorialId, isOwner, isLoggedIn }: { memorialId: string; isOwner: boolean; isLoggedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowInfo(true)
      localStorage.setItem(ONBOARDING_KEY, '1')
    }
  }, [])

  async function copyUrl() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function saveQR() {
    const canvas = qrRef.current?.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = '안온-추모공간.png'
    a.click()
  }

  function onTouchStart() {
    pressTimer.current = setTimeout(saveQR, 600)
  }

  function onTouchEnd() {
    if (pressTimer.current) clearTimeout(pressTimer.current)
  }

  return (
    <>
      {menuOpen && (
        <div className={styles.fabOverlay} onClick={() => setMenuOpen(false)} />
      )}

      <header className={`${styles.memorialHeader} ${menuOpen ? styles.memorialHeaderOpen : ''}`}>
        <div className={`${styles.headerActions} ${menuOpen ? styles.headerActionsOpen : ''}`}>
          {isOwner && (
            <div className={styles.headerItem}>
              <span className={styles.headerLabel}>목록</span>
              <Link href="/" className={styles.headerIconBtn} aria-label="목록으로" onClick={() => setMenuOpen(false)}>
                <BackIcon />
              </Link>
            </div>
          )}
          {isOwner && (
            <div className={styles.headerItem}>
              <span className={styles.headerLabel}>사망신고 안내</span>
              <Link href={`/memorial/${memorialId}/death-registration`} className={styles.headerIconBtn} aria-label="사망신고 안내" onClick={() => setMenuOpen(false)}>
                <DocIcon />
              </Link>
            </div>
          )}
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>공유</span>
            <button className={styles.headerIconBtn} onClick={() => { setShowModal(true); setMenuOpen(false) }} aria-label="공유">
              <ShareIcon />
            </button>
          </div>
          <div className={styles.headerItem}>
            <span className={styles.headerLabel}>안내</span>
            <button className={styles.headerIconBtn} onClick={() => { setShowInfo(true); setMenuOpen(false) }} aria-label="안내">
              <InfoIcon />
            </button>
          </div>
          {isLoggedIn && (
            <div className={styles.headerItem}>
              <span className={styles.headerLabel}>로그아웃</span>
              <Link href="/logout" className={styles.headerIconBtn} aria-label="로그아웃" onClick={() => setMenuOpen(false)}>
                <LogoutIcon />
              </Link>
            </div>
          )}
        </div>
        <button
          className={styles.headerIconBtn}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <AnonIcon />
        </button>
      </header>

      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>추모 공간 공유</p>
              <button className={styles.modalXBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div
              ref={qrRef}
              className={styles.qrBox}
              onDoubleClick={saveQR}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              onTouchMove={onTouchEnd}
            >
              <QRCodeCanvas value={pageUrl} size={180} />
            </div>
            <p className={styles.qrSaveHint}>꾹 누르거나 두 번 클릭하면 저장돼요</p>
            <button className={styles.modalCopyBtn} onClick={copyUrl}>
              {copied ? '복사됨' : 'URL 복사'}
            </button>
          </div>
        </div>
      )}

      {showInfo && (
        <div className={styles.modalOverlay} onClick={() => setShowInfo(false)}>
          <div className={`${styles.modal} ${styles.infoModal}`} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>안온을 더 깊이 느껴보세요</p>
              <button className={styles.modalXBtn} onClick={() => setShowInfo(false)}>✕</button>
            </div>
            <div className={styles.infoList}>
              <div className={styles.infoItem}>
                <p className={styles.infoItemTitle}>시간의 흐름을 담은 배경</p>
                <p className={styles.infoItemDesc}>지금 이 시간에 맞춰 페이지의 배경이 천천히 바뀌어요.</p>
              </div>
              <div className={styles.infoItem}>
                <p className={styles.infoItemTitle}>49재, 빛이 되는 날</p>
                <p className={styles.infoItemDesc}>고인이 떠난 지 49일째 되는 날, 페이지가 따뜻한 빛의 테마로 바뀌어요.</p>
              </div>
            </div>
            <button className={styles.modalCopyBtn} onClick={() => setShowInfo(false)}>
              확인했어요
            </button>
          </div>
        </div>
      )}
    </>
  )
}
