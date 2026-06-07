'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import styles from './edit.module.css'

const RELATION_OPTIONS = ['가족', '친척', '동반자', '친구', '동료']
const PERSONALITY_OPTIONS = ['다정한', '유쾌한', '차분한', '자상한', '강직한', '성실한', '무뚝뚝한']
const BANK_OPTIONS = [
  'KB국민은행', '신한은행', '하나은행', '우리은행', 'NH농협은행', 'IBK기업은행',
  'SC제일은행', '카카오뱅크', '케이뱅크', '토스뱅크', 'BNK부산은행', 'BNK경남은행',
  'DGB대구은행', '광주은행', '전북은행', '제주은행', 'KDB산업은행', 'Sh수협은행',
]

type MediaItem = { id: string; url: string; type: string; order: number }
type Memorial = {
  id: string
  deceased_name: string
  birth_at: string | null
  passed_at: string
  relationship: string
  personality_tags: string[] | null
  nickname_for_user: string | null
  accepts_condolence: boolean
  bank_name: string | null
  account_number: string | null
  account_holder: string | null
}

type Props = { memorial: Memorial; media: MediaItem[] }

export default function EditForm({ memorial, media: initialMedia }: Props) {
  const router = useRouter()

  const [name, setName] = useState(memorial.deceased_name)
  const [birth, setBirth] = useState(memorial.birth_at ?? '')
  const [death, setDeath] = useState(memorial.passed_at)
  const [relation, setRelation] = useState<string[]>(memorial.relationship ? [memorial.relationship] : [])
  const [personality, setPersonality] = useState<string[]>(memorial.personality_tags ?? [])
  const [nickname, setNickname] = useState(memorial.nickname_for_user ?? '')
  const [condolence, setCondolence] = useState(memorial.accepts_condolence ?? false)
  const [bank, setBank] = useState(memorial.bank_name ?? '')
  const [account, setAccount] = useState(memorial.account_number ?? '')
  const [accountHolder, setAccountHolder] = useState(memorial.account_holder ?? '')

  const [existingMedia, setExistingMedia] = useState<MediaItem[]>(initialMedia)
  const [removedIds, setRemovedIds] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleRelation(val: string) {
    setRelation(prev => prev.includes(val) ? [] : [val])
  }

  function togglePersonality(val: string) {
    setPersonality(prev =>
      prev.includes(val) ? prev.filter(p => p !== val) : prev.length < 3 ? [...prev, val] : prev
    )
  }

  function removeExisting(id: string) {
    setRemovedIds(prev => [...prev, id])
    setExistingMedia(prev => prev.filter(m => m.id !== id))
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    const remaining = 20 - existingMedia.length - newFiles.length
    setNewFiles(prev => [...prev, ...Array.from(files)].slice(0, prev.length + remaining))
  }

  function removeNew(index: number) {
    setNewFiles(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    if (!name.trim() || !death) { setError('이름과 기일은 필수입니다.'); return }
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()

      const { error: updateErr } = await supabase
        .from('memorials')
        .update({
          deceased_name: name.trim(),
          birth_at: birth || null,
          passed_at: death,
          relationship: relation[0] ?? '',
          personality_tags: personality,
          nickname_for_user: nickname.trim() || null,
          accepts_condolence: condolence,
          bank_name: condolence ? bank || null : null,
          account_number: condolence ? account || null : null,
          account_holder: condolence ? accountHolder.trim() || null : null,
        })
        .eq('id', memorial.id)
      if (updateErr) throw updateErr

      // 삭제된 기존 미디어 처리
      for (const id of removedIds) {
        const item = initialMedia.find(m => m.id === id)
        if (item) {
          const path = item.url.split('/memorial-media/')[1]?.split('?')[0]
          if (path) await supabase.storage.from('memorial-media').remove([path])
        }
        await supabase.from('memorial_media').delete().eq('id', id)
      }

      // 새 파일 업로드
      const startOrder = existingMedia.length
      await Promise.all(
        newFiles.map(async (file, i) => {
          const ext = file.name.split('.').pop() ?? 'jpg'
          const path = `${memorial.id}/${Date.now()}_${i}.${ext}`
          const { error: upErr } = await supabase.storage.from('memorial-media').upload(path, file)
          if (upErr) throw upErr
          const { data: { publicUrl } } = supabase.storage.from('memorial-media').getPublicUrl(path)
          await supabase.from('memorial_media').insert({
            memorial_id: memorial.id,
            url: publicUrl,
            type: file.type.startsWith('video') ? 'video' : 'image',
            order: startOrder + i,
          })
        })
      )

      router.push(`/memorial/${memorial.id}`)
      router.refresh()
    } catch {
      setError('저장 중 문제가 발생했어요. 다시 시도해주세요.')
      setSaving(false)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>←</button>
        <h1 className={styles.title}>추모 공간 수정</h1>
      </div>

      <div className={styles.form}>
        <section className={styles.section}>
          <label className={styles.label}>고인 성함</label>
          <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="성함" />
        </section>

        <section className={styles.section}>
          <label className={styles.label}>생년월일</label>
          <input className={styles.input} type="date" value={birth} onChange={e => setBirth(e.target.value)} />
        </section>

        <section className={styles.section}>
          <label className={styles.label}>기일</label>
          <input className={styles.input} type="date" value={death} onChange={e => setDeath(e.target.value)} />
        </section>

        <section className={styles.section}>
          <label className={styles.label}>관계</label>
          <div className={styles.chips}>
            {RELATION_OPTIONS.map(opt => (
              <button key={opt} type="button"
                className={`${styles.chip} ${relation.includes(opt) ? styles.chipSelected : ''}`}
                onClick={() => toggleRelation(opt)}
              >{opt}</button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>성격 (최대 3개)</label>
          <div className={styles.chips}>
            {PERSONALITY_OPTIONS.map(opt => (
              <button key={opt} type="button"
                className={`${styles.chip} ${personality.includes(opt) ? styles.chipSelected : ''}`}
                onClick={() => togglePersonality(opt)}
              >{opt}</button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <label className={styles.label}>고인이 부르던 호칭</label>
          <input className={styles.input} value={nickname} onChange={e => setNickname(e.target.value)} placeholder="예: 딸, 아들, 수지야" />
        </section>

        <section className={styles.section}>
          <label className={styles.label}>사진·영상</label>
          <div className={styles.mediaGrid}>
            {existingMedia.map(m => (
              <div key={m.id} className={styles.mediaItem}>
                {m.type === 'image'
                  ? <img src={m.url} alt="" className={styles.mediaThumbnail} />
                  : <div className={styles.videoThumb}>🎬</div>
                }
                <button type="button" className={styles.mediaRemoveBtn} onClick={() => removeExisting(m.id)}>✕</button>
              </div>
            ))}
            {newFiles.map((f, i) => (
              <div key={i} className={styles.mediaItem}>
                <img src={URL.createObjectURL(f)} alt="" className={styles.mediaThumbnail} />
                <button type="button" className={styles.mediaRemoveBtn} onClick={() => removeNew(i)}>✕</button>
              </div>
            ))}
            {existingMedia.length + newFiles.length < 20 && (
              <label className={styles.mediaAddBtn}>
                +
                <input type="file" accept="image/*,video/*" multiple hidden onChange={e => addFiles(e.target.files)} />
              </label>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.condolenceRow}>
            <span className={styles.label}>조의금 수령</span>
            <button type="button"
              className={`${styles.toggle} ${condolence ? styles.toggleOn : ''}`}
              onClick={() => setCondolence(p => !p)}
            >{condolence ? '수령' : '미수령'}</button>
          </div>
          {condolence && (
            <>
              <select className={styles.input} value={bank} onChange={e => setBank(e.target.value)}>
                <option value="">은행 선택</option>
                {BANK_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input className={styles.input} value={account} onChange={e => setAccount(e.target.value)} placeholder="계좌번호" />
              <input className={styles.input} value={accountHolder} onChange={e => setAccountHolder(e.target.value)} placeholder="예금주" />
            </>
          )}
        </section>

        {error && <p className={styles.error}>{error}</p>}

        <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
          {saving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </main>
  )
}
