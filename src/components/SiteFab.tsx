'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import InfoOverlay from './InfoOverlay'
import styles from './siteFab.module.css'

const ONBOARDING_KEY = 'anon-onboarding-seen'

export type FabMenuItem = {
  key: string
  label: string
  icon: ReactNode
  href?: string
  onClick?: () => void
}

function AnonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 7.5h.01" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export default function SiteFab({ isLoggedIn, items = [] }: { isLoggedIn: boolean; items?: FabMenuItem[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [infoInitialView, setInfoInitialView] = useState<'menu' | 'about'>('menu')

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setInfoInitialView('about')
      setShowInfo(true)
      localStorage.setItem(ONBOARDING_KEY, '1')
    }
  }, [])

  return (
    <>
      {menuOpen && (
        <div className={styles.fabOverlay} onClick={() => setMenuOpen(false)} />
      )}

      <div className={`${styles.fab} ${menuOpen ? styles.fabOpen : ''}`}>
        <div className={`${styles.fabActions} ${menuOpen ? styles.fabActionsOpen : ''}`}>
          {items.map((item) => (
            <div key={item.key} className={styles.fabItem}>
              <span className={styles.fabLabel}>{item.label}</span>
              {item.href ? (
                <Link href={item.href} className={styles.fabIconBtn} aria-label={item.label} onClick={() => setMenuOpen(false)}>
                  {item.icon}
                </Link>
              ) : (
                <button className={styles.fabIconBtn} onClick={() => { item.onClick?.(); setMenuOpen(false) }} aria-label={item.label}>
                  {item.icon}
                </button>
              )}
            </div>
          ))}
          <div className={styles.fabItem}>
            <span className={styles.fabLabel}>안내</span>
            <button className={styles.fabIconBtn} onClick={() => { setInfoInitialView('menu'); setShowInfo(true); setMenuOpen(false) }} aria-label="안내">
              <InfoIcon />
            </button>
          </div>
          {isLoggedIn && (
            <div className={styles.fabItem}>
              <span className={styles.fabLabel}>로그아웃</span>
              <Link href="/logout" className={styles.fabIconBtn} aria-label="로그아웃" onClick={() => setMenuOpen(false)}>
                <LogoutIcon />
              </Link>
            </div>
          )}
        </div>
        <button
          className={styles.fabIconBtn}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          <AnonIcon />
        </button>
      </div>

      <InfoOverlay open={showInfo} onClose={() => setShowInfo(false)} isLoggedIn={isLoggedIn} initialView={infoInitialView} />
    </>
  )
}
