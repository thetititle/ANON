'use client'

import { useEffect, useState } from 'react'

type TimeSlot = 'dawn' | 'day' | 'dusk' | 'moonrise' | 'night'

function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 5 && hour < 9)   return 'dawn'
  if (hour >= 9 && hour < 17)  return 'day'
  if (hour >= 17 && hour < 20) return 'dusk'
  if (hour >= 20 && hour < 23) return 'moonrise'
  return 'night'
}

export default function TimeBackground({ children }: { children: React.ReactNode }) {
  const [slot, setSlot] = useState<TimeSlot | null>(null)

  useEffect(() => {
    setSlot(getTimeSlot(new Date().getHours()))
  }, [])

  return (
    <div data-time={slot ?? undefined} style={{ minHeight: '100dvh' }}>
      {children}
    </div>
  )
}
