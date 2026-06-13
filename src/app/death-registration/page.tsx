import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import styles from './deathRegistration.module.css'

export const metadata: Metadata = {
  title: '사망신고 안내 | 안온',
}

export default async function DeathRegistrationPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.backBtn} aria-label="뒤로가기">←</Link>
        <h1 className={styles.title}>사망신고 안내</h1>
      </div>

      <p className={styles.intro}>
        사망신고를 준비하실 때 참고하실 내용을 정리했어요.
        지역별로 세부 절차가 다를 수 있으니, 방문 전 가까운 주민센터에 한 번 더 확인해보시는 걸 권장해요.
      </p>

      <div className={styles.sections}>
        <details className={styles.item} open>
          <summary className={styles.summary}>신고 기한</summary>
          <div className={styles.content}>
            <p>사망 사실을 안 날부터 1개월 이내에 신고해야 해요. (국외에서 사망한 경우 3개월 이내)</p>
            <p>기한을 넘기면 5만 원 이하의 과태료가 부과될 수 있어요.</p>
          </div>
        </details>

        <details className={styles.item}>
          <summary className={styles.summary}>누가 신고할 수 있나요</summary>
          <div className={styles.content}>
            <p>동거하는 친족이 1순위 신고 의무자예요.</p>
            <p>그 외에도 비동거 친족, 동거자, 사망 장소를 관리하는 사람 등이 신고할 수 있어요.</p>
          </div>
        </details>

        <details className={styles.item}>
          <summary className={styles.summary}>어디서 신고하나요</summary>
          <div className={styles.content}>
            <p>사망자의 등록기준지, 사망지, 신고인의 주소지 중 가까운 시·구·읍·면·동 주민센터 어디서든 신고할 수 있어요.</p>
          </div>
        </details>

        <details className={styles.item}>
          <summary className={styles.summary}>준비할 서류</summary>
          <div className={styles.content}>
            <ul className={styles.checklist}>
              <li>사망진단서 또는 시체검안서 (의료기관에서 발급, 원본 1부 이상)</li>
              <li>사망신고서 (주민센터에 비치되어 있거나, 정부24에서 미리 출력 가능)</li>
              <li>신고인 신분증</li>
            </ul>
          </div>
        </details>

        <details className={styles.item}>
          <summary className={styles.summary}>신분증이 없다면</summary>
          <div className={styles.content}>
            <p>주민등록증을 분실했다면 주민센터에서 임시 신분증을 즉시 발급받을 수 있어요.</p>
            <p>운전면허증이나 여권 등 다른 신분증으로도 신고할 수 있어요.</p>
          </div>
        </details>

        <details className={styles.item}>
          <summary className={styles.summary}>알아두면 좋은 점</summary>
          <div className={styles.content}>
            <p>사망신고와 화장·매장 절차는 별개예요. 장례식장에서 받은 사망진단서 사본으로 화장·매장 신고를 따로 진행하게 돼요.</p>
          </div>
        </details>
      </div>
    </main>
  )
}
