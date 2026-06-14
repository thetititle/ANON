import styles from './page.module.css'

export default function Loading() {
  return (
    <main className={styles.page}>
      <div className={styles.landingCenter}>
        <div className={styles.spinner} role="status" aria-label="로딩 중" />
      </div>
    </main>
  )
}
