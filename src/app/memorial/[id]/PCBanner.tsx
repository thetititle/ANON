'use client'

import { useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import styles from './memorial.module.css'

export default function PCBanner() {
  const [dismissed, setDismissed] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''

  if (dismissed) return null

  function close() {
    sessionStorage.setItem('pcBannerDismissed', 'true')
    setDismissed(true)
  }

  return (
    <div className={styles.pcBanner}>
      <button type="button" className={styles.pcBannerClose} onClick={close} aria-label="배너 닫기">
        ✕
      </button>
      <p className={styles.pcBannerText}>
        안온은 모바일에 최적화된 서비스입니다.<br />
        휴대폰으로 접속하시면 더 나은 경험을 제공합니다.
      </p>
      <div className={styles.pcBannerQr}>
        <QRCodeCanvas value={url} size={96} />
      </div>
      <p className={styles.pcBannerCaption}>카메라로 스캔하세요</p>
    </div>
  )
}
