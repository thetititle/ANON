import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { generateMemorialMessage } from '@/lib/generateMessage'
import styles from './memorial.module.css'
import MediaSlider from './MediaSlider'
import MemorialHeader from './MemorialHeader'
import CondolenceSection from './CondolenceSection'

type Props = { params: Promise<{ id: string }> }

export default async function MemorialPage({ params }: Props) {
  const { id } = await params
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
    .select('id, guest_name, content, created_at, user_id, users(real_name)')
    .eq('memorial_id', id)
    .order('created_at', { ascending: false })

  const comments = (commentsRaw ?? []).map((c) => {
    const usersData = c.users as { real_name: string } | { real_name: string }[] | null
    const realName = Array.isArray(usersData) ? usersData[0]?.real_name : usersData?.real_name
    return {
      id: c.id as string,
      content: c.content as string,
      created_at: c.created_at as string,
      user_id: c.user_id as string | null,
      author_name: (c.guest_name as string | null) ?? realName ?? null,
    }
  })

  const currentUserName = user
    ? (await supabase.from('users').select('real_name').eq('id', user.id).single()).data?.real_name ?? null
    : null

  function formatDate(dateStr: string) {
    return dateStr.replace(/-/g, '.')
  }

  const birthFormatted = memorial.birth_at ? formatDate(memorial.birth_at) : null
  const deathFormatted = formatDate(memorial.passed_at)

  const message = memorial.personality_tags?.length > 0
    ? generateMemorialMessage(memorial.deceased_name, memorial.personality_tags, id)
    : ''

  const nickname = memorial.nickname_for_user ?? ''
  const suffix = nickname ? (() => {
    const code = nickname.charCodeAt(nickname.length - 1)
    if (code < 0xAC00 || code > 0xD7A3) return '야'
    return (code - 0xAC00) % 28 !== 0 ? '아' : '야'
  })() : ''
  const salutation = nickname ? `${nickname}${suffix},` : ''

  const rel = memorial.relationship ?? ''
  const relCode = rel.charCodeAt(rel.length - 1)
  const relSuffix = (relCode - 0xAC00) % 28 !== 0 ? '이' : '가'
  const relationshipLabel = `${rel}${relSuffix} 기억하는`

  return (
    <>
    <MemorialHeader isOwner={isOwner} />
    <main className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.relationship}>{relationshipLabel}</p>
        <h1 className={styles.name}>{memorial.deceased_name}</h1>
        <p className={styles.dates}>
          {birthFormatted ? `${birthFormatted} — ${deathFormatted}` : deathFormatted}
        </p>
      </section>

      {message && (
        <section className={styles.section}>
          <div className={styles.messageCard}>
            {salutation && <p className={styles.salutation}>{salutation}</p>}
            <p className={styles.messageText}>{message}</p>
          </div>
        </section>
      )}

      {media && media.length > 0 && (
        <section className={styles.section}>
          <MediaSlider media={media} />
        </section>
      )}

      <CondolenceSection
        memorialId={id}
        initialComments={comments ?? []}
        currentUserId={user?.id ?? null}
        currentUserName={currentUserName}
      />
    </main>
    </>
  )
}
