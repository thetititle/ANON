import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <Link href="/create" className={`page ${styles.main}`}>
      <div className="container">
        <div className="content">
          <h1 className="title">안온</h1>
          <p className="text-sm hanja">安溫</p>
        </div>
        <p className="description">소중한 분을 기억하는 공간</p>
      </div>
    </Link>
  )
}
