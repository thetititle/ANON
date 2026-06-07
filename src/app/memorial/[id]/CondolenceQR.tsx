'use client'

import { useState } from 'react'
import styles from './memorial.module.css'

type Props = {
  bankName: string
  accountNumber: string
  accountHolder: string
}

export default function CondolenceQR({ bankName, accountNumber, accountHolder }: Props) {
  const [copied, setCopied] = useState(false)

  async function copyAccount() {
    await navigator.clipboard.writeText(accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.qrSection}>
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
