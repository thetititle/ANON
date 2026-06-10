'use client'

import { useEffect, useMemo, useState } from 'react'

type TimeSlot = 'late-night' | 'predawn' | 'dawn' | 'morning' | 'day' | 'afternoon' | 'evening' | 'dusk' | 'night'

// ── 색상 보간 ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
}

function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a)
  const [r2, g2, b2] = hexToRgb(b)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

// ── 시간대별 키프레임 (각 구간의 중심 시각 기준 색상) ────────────────────────────
// hour: 키프레임 중심 시각, top/bottom: 그라데이션 상/하단 색, star: 별 불투명도

const KEYFRAMES: { hour: number; slot: TimeSlot; top: string; bottom: string; star: number }[] = [
  { hour: 2,    slot: 'late-night', top: '#0E0B22', bottom: '#050510', star: 1    },
  { hour: 5,    slot: 'predawn',    top: '#1A2747', bottom: '#050814', star: 1    },
  { hour: 7,    slot: 'dawn',       top: '#9A5468', bottom: '#0C0609', star: 0.5  },
  { hour: 9.5,  slot: 'morning',    top: '#FFFCF6', bottom: '#F7F0DD', star: 0    },
  { hour: 12.5, slot: 'day',        top: '#FFFFFF', bottom: '#F7F0DD', star: 0    },
  { hour: 15.5, slot: 'afternoon',  top: '#F4FAFD', bottom: '#A8D4F0', star: 0    },
  { hour: 18,   slot: 'evening',    top: '#BD7C52', bottom: '#0D0907', star: 0.4  },
  { hour: 20,   slot: 'dusk',       top: '#7D4F6E', bottom: '#08070E', star: 0.85 },
  { hour: 22.5, slot: 'night',      top: '#2D1F6E', bottom: '#050510', star: 1    },
]

function getCurrentHours(): number {
  const now = new Date()
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600
}

function interpolate(hours: number) {
  const n = KEYFRAMES.length
  let i = n - 1
  for (let k = 0; k < n; k++) {
    if (KEYFRAMES[k].hour <= hours) i = k
    else break
  }
  const j = (i + 1) % n
  const curHour = i === n - 1 && hours < KEYFRAMES[0].hour ? KEYFRAMES[i].hour - 24 : KEYFRAMES[i].hour
  const nextHour = j === 0 ? KEYFRAMES[0].hour + 24 : KEYFRAMES[j].hour
  const t = (hours - curHour) / (nextHour - curHour)

  const a = KEYFRAMES[i]
  const b = KEYFRAMES[j]
  return {
    gradient: `linear-gradient(to top, ${lerpColor(a.bottom, b.bottom, t)} 0%, ${lerpColor(a.top, b.top, t)} 100%)`,
    starOpacity: lerp(a.star, b.star, t),
    slot: t < 0.5 ? a.slot : b.slot,
  }
}

// ── 별 ───────────────────────────────────────────────────────────────────────

// 시드 고정 PRNG — 서버/클라이언트 렌더링 결과를 동일하게 유지 (hydration mismatch 방지)
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function Stars({ opacity, transition }: { opacity: number; transition: string }) {
  const groups = useMemo(() => {
    const rand = mulberry32(20260610)
    const all = Array.from({ length: 160 }, (_, i) => ({
      id: i,
      cx: +(rand() * 100).toFixed(2),
      cy: +(rand() * 68).toFixed(2),
      r:  +(rand() * 0.08 + 0.02).toFixed(2),
    }))
    return [0, 1, 2, 3, 4].map(g => all.filter((_, i) => i % 5 === g))
  }, [])

  return (
    <svg
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity, transition }}
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

const UPDATE_INTERVAL_MS = 60_000

export default function TimeBackground({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(() => interpolate(12.5)) // SSR 기본값: 낮
  const [smooth, setSmooth] = useState(false)

  useEffect(() => {
    function tick() {
      const next = interpolate(getCurrentHours())
      setState(next)
      document.body.setAttribute('data-time', next.slot)
    }
    tick() // 첫 적용은 즉시 (트랜지션 없이)

    const enable = requestAnimationFrame(() => setSmooth(true))
    const id = setInterval(tick, UPDATE_INTERVAL_MS)
    return () => {
      cancelAnimationFrame(enable)
      clearInterval(id)
      document.body.removeAttribute('data-time')
    }
  }, [])

  const transition = smooth ? `${UPDATE_INTERVAL_MS / 1000}s linear` : 'none'

  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: state.gradient,
          transition: `background ${transition}`,
        }}
      />
      <Stars opacity={state.starOpacity} transition={`opacity ${transition}`} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </>
  )
}
