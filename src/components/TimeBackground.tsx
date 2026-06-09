'use client'

import { useEffect, useMemo, useState } from 'react'

type TimeSlot = 'late-night' | 'predawn' | 'dawn' | 'morning' | 'day' | 'afternoon' | 'evening' | 'dusk' | 'night'

// 밤 슬롯: 밤하늘 테마 — 깨끗한 어두운 배경 + 지평선 힌트 + 별
// 낮 슬롯: 다중 blob + 그레인 (레퍼런스 스타일)
const SLOT_BG: Record<TimeSlot, string> = {
  'late-night': `#07070E`,
  predawn: `
    radial-gradient(ellipse 110% 22% at 50% 100%, rgba(28, 42, 115, 0.22) 0%, transparent 100%),
    #06080F`,
  dawn: `
    radial-gradient(ellipse 110% 32% at 50% 100%, rgba(155, 52, 65, 0.26) 0%, transparent 100%),
    #0C0609`,
  morning: `
    radial-gradient(ellipse 75% 62% at 8% 18%, rgba(255, 255, 255, 0.92) 0%, transparent 68%),
    radial-gradient(ellipse 60% 55% at 87% 20%, rgba(255, 205, 145, 0.68) 0%, transparent 65%),
    radial-gradient(ellipse 70% 62% at 84% 83%, rgba(255, 238, 185, 0.75) 0%, transparent 68%),
    radial-gradient(ellipse 75% 65% at 13% 80%, rgba(255, 222, 155, 0.58) 0%, transparent 65%),
    #FAF0D8`,
  day: `
    radial-gradient(ellipse 75% 62% at 8% 18%, rgba(255, 255, 255, 0.95) 0%, transparent 68%),
    radial-gradient(ellipse 60% 55% at 87% 22%, rgba(255, 178, 162, 0.72) 0%, transparent 65%),
    radial-gradient(ellipse 70% 62% at 84% 84%, rgba(255, 255, 255, 0.90) 0%, transparent 68%),
    radial-gradient(ellipse 75% 65% at 13% 80%, rgba(255, 150, 148, 0.58) 0%, transparent 65%),
    #F5C5C0`,
  afternoon: `
    radial-gradient(ellipse 75% 62% at 8% 18%, rgba(255, 255, 255, 0.90) 0%, transparent 68%),
    radial-gradient(ellipse 60% 55% at 87% 22%, rgba(185, 218, 242, 0.68) 0%, transparent 65%),
    radial-gradient(ellipse 70% 62% at 84% 84%, rgba(255, 255, 255, 0.85) 0%, transparent 68%),
    radial-gradient(ellipse 75% 65% at 13% 80%, rgba(162, 202, 232, 0.58) 0%, transparent 65%),
    #E5EFF8`,
  evening: `
    radial-gradient(ellipse 110% 32% at 50% 100%, rgba(175, 65, 12, 0.28) 0%, transparent 100%),
    #0D0907`,
  dusk: `
    radial-gradient(ellipse 110% 28% at 50% 100%, rgba(90, 45, 130, 0.24) 0%, transparent 100%),
    #08070E`,
  night: `
    radial-gradient(ellipse 110% 22% at 50% 100%, rgba(45, 30, 100, 0.18) 0%, transparent 100%),
    #080816`,
}

const LIGHT_SLOTS = new Set<TimeSlot>(['morning', 'day', 'afternoon'])

function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 0  && hour < 4)  return 'late-night'
  if (hour >= 4  && hour < 6)  return 'predawn'
  if (hour >= 6  && hour < 8)  return 'dawn'
  if (hour >= 8  && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'day'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 19) return 'evening'
  if (hour >= 19 && hour < 21) return 'dusk'
  return 'night'
}

// ── 별 ───────────────────────────────────────────────────────────────────────

const STAR_SLOTS = new Set<TimeSlot>(['late-night', 'predawn', 'dawn', 'night', 'dusk', 'evening'])

function Stars({ slot }: { slot: TimeSlot }) {
  const groups = useMemo(() => {
    const all = Array.from({ length: 160 }, (_, i) => ({
      id: i,
      cx: +(Math.random() * 100).toFixed(2),
      cy: +(Math.random() * 68).toFixed(2),
      r:  +(Math.random() * 0.08 + 0.02).toFixed(2),
    }))
    return [0, 1, 2, 3, 4].map(g => all.filter((_, i) => i % 5 === g))
  }, [])

  if (!STAR_SLOTS.has(slot)) return null

  return (
    <svg
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 100 75"
      preserveAspectRatio="xMidYMid slice"
    >
      {groups.map((group, g) => (
        <g key={g} className={`star-group-${g}`}>
          {group.map(s => (
            <circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill="white" fillOpacity={0.55 + g * 0.09} />
          ))}
        </g>
      ))}
    </svg>
  )
}

// ── 메인 ─────────────────────────────────────────────────────────────────────

export default function TimeBackground({ children }: { children: React.ReactNode }) {
  const [slot, setSlot] = useState<TimeSlot>('day')

  useEffect(() => {
    const s = getTimeSlot(new Date().getHours())
    setSlot(s)
    document.body.setAttribute('data-time', s)
    return () => { document.body.removeAttribute('data-time') }
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: SLOT_BG[slot],
          transition: 'background 2s ease',
        }}
      />
      {LIGHT_SLOTS.has(slot) && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            opacity: 0.07,
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '256px 256px',
          }}
        />
      )}
      <Stars slot={slot} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  )
}
