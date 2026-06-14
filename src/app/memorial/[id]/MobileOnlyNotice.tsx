'use client'

import { QRCodeCanvas } from 'qrcode.react'
import pageStyles from '@/app/page.module.css'
import styles from './memorial.module.css'

export default function MobileOnlyNotice({ url }: { url: string }) {
  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.landingCenter}>
        <div className={pageStyles.logo}>
          <h1 className={pageStyles.title}>안온</h1>
          <p className={pageStyles.hanja}>安溫</p>
        </div>
        <p className={pageStyles.desc}>
          이 추모 공간은 모바일에서만 확인할 수 있어요.<br />
          아래 QR코드를 휴대폰 카메라로 스캔해 주세요.
        </p>
        <div className={styles.qrBox}>
          <QRCodeCanvas value={url} size={180} />
        </div>
      </div>
    </main>
  )
}
