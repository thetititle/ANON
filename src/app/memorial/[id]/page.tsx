import type { Metadata } from 'next'
import { FaChevronDown } from 'react-icons/fa'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isMobileDevice } from '@/lib/isMobileDevice'
import { getDay49Status } from '@/lib/day49'
import { generateMemorialMessage } from '@/lib/generateMessage'
import TimeBackground from '@/components/TimeBackground'
import styles from './memorial.module.css'
import MediaSlider from './MediaSlider'
import MemorialHeader from './MemorialHeader'
import CondolenceSection from './CondolenceSection'
import MemorialSwiper from './MemorialSwiper'
import MessageOverlay from './MessageOverlay'
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

  if (!(await isMobileDevice())) {
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

  function getAgeAtDeath(birthAt: string, passedAt: string) {
    const birth = new Date(birthAt)
    const passed = new Date(passedAt)
    let age = passed.getFullYear() - birth.getFullYear()
    const monthDiff = passed.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && passed.getDate() < birth.getDate())) age--
    return age
  }

  const birthFormatted = memorial.birth_at ? formatDate(memorial.birth_at) : null
  const deathFormatted = formatDate(memorial.passed_at)

  const ageGroup: 'child' | 'teen' | 'youth' | 'adult' = (() => {
    if (!memorial.birth_at) return 'adult'
    const age = getAgeAtDeath(memorial.birth_at, memorial.passed_at)
    if (age < 10) return 'child'
    if (age <= 13) return 'teen'
    if (age <= 18) return 'youth'
    return 'adult'
  })()

  const day49 = getDay49Status(memorial.passed_at)
  const isLightTheme = day49.state === 'today'

  // 가족 호칭(엄마/누나/큰누/마마 등 변형 포함)으로 불렸다면, 고인이 연장자인 사용자를 향해 존댓말로 말함
  // 호칭은 접두어(큰/작은/짠/친/외 등) + 핵심 호칭 형태로 무한히 변형되므로 끝부분(어미) 기준으로 판별
  const KINSHIP_ENDINGS = [
    '엄마', '어머니', '어무이', '어무니', '엄니', '옴마', '마마', '맘마', '마미',
    '아빠', '아버지', '아부지', '아빵', '빠빠', '빱빠', '팝빠', '팝파', '파파',
    '누나', '누', '언니', '오빠', '형',
    '할머니', '할매', '할무니', '할미',
    '할아버지', '할배', '할부지',
    '이모', '고모', '삼촌', '외삼촌',
  ]

  const nickname = memorial.nickname_for_user ?? ''
  const isElder = KINSHIP_ENDINGS.some((term) => nickname.endsWith(term))
  // 10세 미만 고인이 연장자에게 보내는 메시지는 존댓말 대신 아이다운 말투 사용
  const isChildElder = isElder && ageGroup === 'child'

  // 가족 호칭은 뒤에 '아/야'를 붙이지 않음 (예: "엄마야," "누나야," 는 어색함)
  const suffix = nickname && !isElder ? (() => {
    const code = nickname.charCodeAt(nickname.length - 1)
    if (code < 0xAC00 || code > 0xD7A3) return '야'
    return (code - 0xAC00) % 28 !== 0 ? '아' : '야'
  })() : ''
  const salutation = nickname ? `${nickname}${suffix},` : ''

  // DB 저장 메시지 우선, 없으면 static fallback
  const overlayMessage = isLightTheme
    ? (memorial.message_49 ?? (memorial.personality_tags?.length > 0
        ? generateMemorialMessage(memorial.deceased_name, memorial.personality_tags, id, true, isElder, isChildElder)
        : ''))
    : (memorial.message ?? (memorial.personality_tags?.length > 0
        ? generateMemorialMessage(memorial.deceased_name, memorial.personality_tags, id, false, isElder, isChildElder)
        : ''))

  const portrait = (
    <>
      <div className={styles.portraitMedia}>
        {media && media.length > 0 && (
          <MediaSlider media={media} />
        )}

        <section className={styles.hero}>
          <h1 className={styles.name}>{memorial.deceased_name}</h1>
          <p className={styles.dates}>
            {birthFormatted ? `${birthFormatted} ~ ${deathFormatted}` : deathFormatted}
          </p>
          {isLightTheme && (
            <p className={styles.day49Label}>오늘은 49일이에요</p>
          )}
        </section>

        <FaChevronDown className={styles.scrollHint} aria-hidden="true" />
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
      {overlayMessage && (
        <MessageOverlay
          memorialId={id}
          salutation={salutation}
          message={overlayMessage}
          isLightTheme={isLightTheme}
          ageGroup={ageGroup}
        />
      )}
      <MemorialHeader isOwner={isOwner} isLoggedIn={!!user} />
      <MemorialSwiper portrait={portrait} messages={messages} />
    </div>
  )

  if (isLightTheme) return content
  return <TimeBackground>{content}</TimeBackground>
}
