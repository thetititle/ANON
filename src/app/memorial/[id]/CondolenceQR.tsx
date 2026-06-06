'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './memorial.module.css'

type Props = {
  bankName: string
  accountNumber: string
  accountHolder: string
  isOwner: boolean
}

export default function CondolenceQR({ bankName, accountNumber, accountHolder, isOwner }: Props) {
  const [copied, setCopied] = useState(false)
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  async function copyAccount() {
    await navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.qrSection}>
      {isOwner && (
        <div className={styles.qrBlock}>
          <p className={styles.qrLabel}>추모 공간 공유</p>
          <div className={styles.qrBox}>
            <QRCodeSVG value={pageUrl} size={140} />
          </div>
        </div>
      )}

      <div className={styles.accountBlock}>
        <p className={styles.qrLabel}>부의금</p>
        <p className={styles.qrBank}>{bankName}</p>
        <p className={styles.qrAccount}>{accountNumber}</p>
        <p className={styles.qrHolder}>{accountHolder}</p>
        <button className={styles.copyBtn} onClick={copyAccount}>
          {copied ? '복사됨' : '계좌번호 복사'}
        </button>
      </div>
    </div>
  )
}
