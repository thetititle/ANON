'use client'

import { useEffect } from 'react'

type TimeSlot = 'late-night' | 'predawn' | 'dawn' | 'morning' | 'day' | 'afternoon' | 'evening' | 'dusk' | 'night'

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

export default function TimeBackground({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const slot = getTimeSlot(new Date().getHours())
    document.body.setAttribute('data-time', slot)
    return () => { document.body.removeAttribute('data-time') }
  }, [])

  return <>{children}</>
}
