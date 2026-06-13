import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { userAgent } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { generateMemorialMessage } from '@/lib/generateMessage'
import { getDay49Status } from '@/lib/day49'
import TimeBackground from '@/components/TimeBackground'
import styles from './memorial.module.css'
import MediaSlider from './MediaSlider'
import MemorialHeader from './MemorialHeader'
import CondolenceSection from './CondolenceSection'
import MemorialSwiper from './MemorialSwiper'
import MobileOnlyNotice from './MobileOnlyNotice'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: memorial } = await supabase
    .from('memorials')
    .select('deceased_name')
    .eq('id', id)
    .single()

  if (!memorial) return {}

  const title = `${memorial.deceased_name}님을 추억하며`
  const description = `안온에서 ${memorial.deceased_name}님을 위한 추모 공간을 만나보세요.`

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  }
}

export default async function MemorialPage({ params }: Props) {
  const { id } = await params

  const { device } = userAgent({ headers: await headers() })
  if (device.type !== 'mobile') {
    return <MobileOnlyNotice url={`${siteUrl}/memorial/${id}`} />
  }

  const supabase = await createClient()

  const { data: memorial, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !memorial) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === memorial.user_id

  const { data: media } = await supabase
    .from('memorial_media')
    .select('*')
    .eq('memorial_id', id)
    .order('order')

  const { data: commentsRaw } = await supabase
    .from('memorial_comments')
    .select('id, guest_name, content, created_at, updated_at, user_id, users(real_name)')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })

  const comments = (commentsRaw ?? []).map((c) => {
    const usersData = c.users as { real_name: string } | { real_name: string }[] | null
    const realName = Array.isArray(usersData) ? usersData[0]?.real_name : usersData?.real_name
    return {
      id: c.id as string,
      content: c.content as string,
      created_at: c.created_at as string,
      updated_at: c.updated_at as string | null,
      user_id: c.user_id as string | null,
      author_name: (c.guest_name as string | null) ?? realName ?? null,
    }
  })

  const currentUserName = user
    ? (await supabase.from('users').select('real_name').eq('id', user.id).single()).data?.real_name ?? null
    : null

  const { data: donationsRaw } = await supabase
    .from('memorial_donations')
    .select('id, user_id, amount, created_at, users(real_name)')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })

  const donations = (donationsRaw ?? []).map((d) => {
    const usersData = d.users as { real_name: string } | { real_name: string }[] | null
    const realName = Array.isArray(usersData) ? usersData[0]?.real_name : usersData?.real_name
    return {
      id: d.id as string,
      user_id: d.user_id as string,
      amount: d.amount as number | null,
      created_at: d.created_at as string,
      author_name: realName ?? '익명',
    }
  })

  function formatDate(dateStr: string) {
    return dateStr.replace(/-/g, '.')
  }

  const birthFormatted = memorial.birth_at ? formatDate(memorial.birth_at) : null
  const deathFormatted = formatDate(memorial.passed_at)

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

  const nickname = memorial.nickname_for_user ?? ''
  const suffix = nickname ? (() => {
    const code = nickname.charCodeAt(nickname.length - 1)
    if (code < 0xAC00 || code > 0xD7A3) return '야'
    return (code - 0xAC00) % 28 !== 0 ? '아' : '야'
  })() : ''
  const salutation = nickname ? `${nickname}${suffix},` : ''

  const portrait = (
    <>
      <div className={styles.portraitMedia}>
        {media && media.length > 0 && (
          <MediaSlider media={media} />
        )}

        {message && (
          <div className={styles.messageOverlay}>
            {salutation && <p className={styles.salutationHandwriting}>{salutation}</p>}
            <p className={styles.messageHandwriting}>{message}</p>
          </div>
        )}

        <section className={styles.hero}>
          <h1 className={styles.name}>{memorial.deceased_name}</h1>
          <p className={styles.dates}>
            {birthFormatted ? `${birthFormatted} — ${deathFormatted}` : deathFormatted}
          </p>
          {isLightTheme && (
            <p className={styles.day49Label}>오늘은 49일이에요</p>
          )}
        </section>
      </div>
    </>
  )

  const messages = (
    <CondolenceSection
      memorialId={id}
      initialComments={comments ?? []}
      currentUserId={user?.id ?? null}
      currentUserName={currentUserName}
      acceptsCondolence={memorial.accepts_condolence ?? false}
      bankName={memorial.bank_name ?? null}
      accountNumber={memorial.account_number ?? null}
      accountHolder={memorial.account_holder ?? null}
      initialDonations={donations}
    />
  )

  const content = (
    <div className={`${styles.memorialWrapper} ${isLightTheme ? styles.lightWrapper : ''}`}>
      <MemorialHeader isOwner={isOwner} isLoggedIn={!!user} />
      <MemorialSwiper portrait={portrait} messages={messages} />
    </div>
  )

  if (isLightTheme) return content
  return <TimeBackground>{content}</TimeBackground>
}
