'use client'

import { useState } from 'react'
import styles from './infoOverlay.module.css'

type View = 'menu' | 'about' | 'death-registration' | 'centers' | 'document'

const TITLES: Record<View, string> = {
  menu: '안온을 더 깊이 느껴보세요',
  about: '안온의 차별점',
  'death-registration': '사망신고 안내',
  centers: '주민센터 위치 안내',
  document: '서류 자동완성',
}

function DeathRegistrationGuide() {
  return (
    <>
      <p className={styles.guideIntro}>
        사망신고를 준비하실 때 참고하실 내용을 정리했어요.
        지역별로 세부 절차가 다를 수 있으니, 방문 전 가까운 주민센터에 한 번 더 확인해보시는 걸 권장해요.
      </p>

      <div className={styles.accSections}>
        <details className={styles.accItem} open>
          <summary className={styles.accSummary}>신고 기한</summary>
          <div className={styles.accContent}>
            <p>사망 사실을 안 날부터 1개월 이내에 신고해야 해요. (국외에서 사망한 경우 3개월 이내)</p>
            <p>기한을 넘기면 5만 원 이하의 과태료가 부과될 수 있어요.</p>
          </div>
        </details>

        <details className={styles.accItem}>
          <summary className={styles.accSummary}>누가 신고할 수 있나요</summary>
          <div className={styles.accContent}>
            <p>동거하는 친족이 1순위 신고 의무자예요.</p>
            <p>그 외에도 비동거 친족, 동거자, 사망 장소를 관리하는 사람 등이 신고할 수 있어요.</p>
          </div>
        </details>

        <details className={styles.accItem}>
          <summary className={styles.accSummary}>어디서 신고하나요</summary>
          <div className={styles.accContent}>
            <p>사망자의 등록기준지, 사망지, 신고인의 주소지 중 가까운 시·구·읍·면·동 주민센터 어디서든 신고할 수 있어요.</p>
          </div>
        </details>

        <details className={styles.accItem}>
          <summary className={styles.accSummary}>준비할 서류</summary>
          <div className={styles.accContent}>
            <ul className={styles.accChecklist}>
              <li>사망진단서 또는 시체검안서 (의료기관에서 발급, 원본 1부 이상)</li>
              <li>사망신고서 (주민센터에 비치되어 있거나, 정부24에서 미리 출력 가능)</li>
              <li>신고인 신분증</li>
            </ul>
          </div>
        </details>

        <details className={styles.accItem}>
          <summary className={styles.accSummary}>신분증이 없다면</summary>
          <div className={styles.accContent}>
            <p>주민등록증을 분실했다면 주민센터에서 임시 신분증을 즉시 발급받을 수 있어요.</p>
            <p>운전면허증이나 여권 등 다른 신분증으로도 신고할 수 있어요.</p>
          </div>
        </details>

        <details className={styles.accItem}>
          <summary className={styles.accSummary}>알아두면 좋은 점</summary>
          <div className={styles.accContent}>
            <p>사망신고와 화장·매장 절차는 별개예요. 장례식장에서 받은 사망진단서 사본으로 화장·매장 신고를 따로 진행하게 돼요.</p>
          </div>
        </details>
      </div>
    </>
  )
}

export default function InfoOverlay({ open, onClose, isLoggedIn, initialView = 'menu' }: { open: boolean; onClose: () => void; isLoggedIn: boolean; initialView?: View }) {
  const [view, setView] = useState<View>(initialView)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setView(initialView)
  }

  if (!open) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.header}>
        {view !== 'menu' ? (
          <button className={styles.iconBtn} onClick={() => setView('menu')} aria-label="뒤로">←</button>
        ) : (
          <span className={styles.headerSpacer} />
        )}
        <p className={styles.title}>{TITLES[view]}</p>
        <button className={styles.iconBtn} onClick={onClose} aria-label="닫기">✕</button>
      </div>

      <div className={styles.body}>
        {view === 'menu' && (
          <div className={styles.menuList}>
            <button className={styles.menuItem} onClick={() => setView('about')}>
              <span>안온의 차별점</span>
              <span className={styles.chevron}>›</span>
            </button>
            {isLoggedIn && (
              <>
                <button className={styles.menuItem} onClick={() => setView('death-registration')}>
                  <span>사망신고 안내</span>
                  <span className={styles.chevron}>›</span>
                </button>
                <button className={styles.menuItem} onClick={() => setView('centers')}>
                  <span>주민센터 위치 안내</span>
                  <span className={styles.chevron}>›</span>
                </button>
                <button className={styles.menuItem} onClick={() => setView('document')}>
                  <span>서류 자동완성</span>
                  <span className={styles.chevron}>›</span>
                </button>
              </>
            )}
          </div>
        )}

        {view === 'about' && (
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
        )}

        {view === 'death-registration' && <DeathRegistrationGuide />}

        {(view === 'centers' || view === 'document') && (
          <p className={styles.placeholder}>곧 만나볼 수 있어요. 준비 중인 기능이에요.</p>
        )}
      </div>
    </div>
  )
}
