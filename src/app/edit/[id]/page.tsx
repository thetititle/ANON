import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EditForm from './EditForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memorial, error } = await supabase
    .from('memorials')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !memorial) notFound()
  if (memorial.user_id !== user.id) notFound()

  const { data: media } = await supabase
    .from('memorial_media')
    .select('id, url, type, order')
    .eq('memorial_id', id)
    .order('order')

  return <EditForm memorial={memorial} media={media ?? []} />
}
