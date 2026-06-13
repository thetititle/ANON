import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { isMobileDevice } from '@/lib/isMobileDevice'
import { generateMemorialMessage } from '@/lib/generateMessage'
import { getDay49Status } from '@/lib/day49'
import TimeBackground from '@/components/TimeBackground'
import MobileOnlyNotice from '../MobileOnlyNotice'
import MessageLayer from './MessageLayer'
import styles from './message.module.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

type Props = { params: Promise<{ id: string }> }

export default async function MemorialMessagePage({ params }: Props) {
  const { id } = await params

  if (!(await isMobileDevice())) {
    return <MobileOnlyNotice url={`${siteUrl}/memorial/${id}/message`} />
  }

  const supabase = await createClient()

  const { data: memorial, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !memorial) notFound()

  const day49 = getDay49Status(memorial.passed_at)
  const isLightTheme = day49.state === 'today'

  // DB 저장 메시지 우선, 없으면 static fallback
  const message = isLightTheme
    ? (memorial.message_49 ?? (memorial.personality_tags?.length > 0
        ? generateMemorialMessage(memorial.deceased_name, memorial.personality_tags, id, true)
        : ''))
    : (memorial.message ?? (memorial.personality_tags?.length > 0
        ? generateMemorialMessage(memorial.deceased_name, memorial.personality_tags, id, false)
        : ''))

  if (!message) redirect(`/memorial/${id}`)

  const nickname = memorial.nickname_for_user ?? ''
  const suffix = nickname ? (() => {
    const code = nickname.charCodeAt(nickname.length - 1)
    if (code < 0xAC00 || code > 0xD7A3) return '야'
    return (code - 0xAC00) % 28 !== 0 ? '아' : '야'
  })() : ''
  const salutation = nickname ? `${nickname}${suffix},` : ''

  const layer = <MessageLayer memorialId={id} salutation={salutation} message={message} />

  if (isLightTheme) {
    return <div className={styles.lightWrapper}>{layer}</div>
  }
  return <TimeBackground>{layer}</TimeBackground>
}
