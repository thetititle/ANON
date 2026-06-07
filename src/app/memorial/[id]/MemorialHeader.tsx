'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import styles from './memorial.module.css'

export default function MemorialHeader({ isOwner }: { isOwner: boolean }) {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

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
      <header className={styles.memorialHeader}>
        <Link href="/" className={styles.homeLink}>← 목록</Link>
        <div className={styles.headerActions}>
          <button className={styles.shareBtn} onClick={() => setShowModal(true)}>공유</button>
          {isOwner && (
            <Link href="/logout" className={styles.headerLogout}>로그아웃</Link>
          )}
        </div>
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
    </>
  )
}
