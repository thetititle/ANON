export type Day49Status =
  | { state: 'before'; daysLeft: number }
  | { state: 'light' }  // 49일 당일 이후

export function getDay49Status(passedAt: string): Day49Status {
  const passed = new Date(passedAt)
  passed.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const elapsed = Math.floor((today.getTime() - passed.getTime()) / 86400000)
  // 한국식 49제: 사망일을 1일로 계산, 49일째 = 사망일 + 48일
  const daysLeft = 48 - elapsed
  if (daysLeft > 0) return { state: 'before', daysLeft }
  return { state: 'light' }
}
