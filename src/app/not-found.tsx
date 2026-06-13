import Link from 'next/link'
import styles from './page.module.css'

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.landingCenter}>
        <div className={styles.logo}>
          <h1 className={styles.title}>안온</h1>
          <p className={styles.hanja}>安溫</p>
        </div>
        <p className={styles.desc}>
          페이지를 찾을 수 없어요.<br />
          삭제되었거나 잘못된 주소예요.
        </p>
        <Link href="/" className={styles.newMemorialBtn}>홈으로 돌아가기</Link>
      </div>
    </main>
  )
}
