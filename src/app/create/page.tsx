'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './create.module.css'
import { FORM_STEPS, type FormData } from './formSteps'
import { createClient } from '@/lib/supabase/client'
import ChatBubble from '@/components/ChatBubble'
import ChipSelect from '@/components/ChipSelect'
import FormInput from '@/components/FormInput'
import DateInput from '@/components/DateInput'
import MediaUpload from '@/components/MediaUpload'
import ProgressBar from '@/components/ProgressBar'
import SearchSelect from '@/components/SearchSelect'

const STORAGE_KEY = 'anon-create-form'

export default function CreatePage() {
  const router = useRouter()
  const [visibleCount, setVisibleCount] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasSavedData, setHasSavedData] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const state = JSON.parse(saved)
        if (state.visibleCount > 1) setHasSavedData(true)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (Object.keys(formData).length === 0) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { media: _media, ...saveable } = formData as Partial<FormData>
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ formData: saveable, visibleCount }))
    } catch { /* ignore */ }
  }, [formData, visibleCount])

  function restoreSaved() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const { formData: savedData, visibleCount: savedCount } = JSON.parse(saved)
        setFormData(savedData)
        setVisibleCount(savedCount)
      }
    } catch { /* ignore */ }
    setHasSavedData(false)
  }

  function startFresh() {
    localStorage.removeItem(STORAGE_KEY)
    setHasSavedData(false)
  }

  const activeSteps = FORM_STEPS.filter(s => !s.condition || s.condition(formData))

  function complete(id: string, value: FormData[keyof FormData]) {
    const next = { ...formData, [id]: value }
    setFormData(next)
    const nextActive = FORM_STEPS.filter(s => !s.condition || s.condition(next))
    if (visibleCount < nextActive.length) {
      setVisibleCount(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }

  function update(id: string, value: FormData[keyof FormData]) {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [visibleCount, isComplete])

  async function handleSubmit() {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login?next=/create'); return }

      const { data: memorial, error: memErr } = await supabase
        .from('memorials')
        .insert({
          user_id: user.id,
          deceased_name: formData.name,
          birth_at: formData.birth ?? null,
          passed_at: formData.death,
          relationship: formData.relation?.[0] ?? '',
          personality_tags: formData.personality ?? [],
          nickname_for_user: formData.nickname ?? null,
          accepts_condolence: formData.condolence ?? false,
          bank_name: formData.condolence ? formData.bank ?? null : null,
          account_number: formData.condolence ? formData.account ?? null : null,
          account_holder: formData.condolence ? formData.account_holder ?? null : null,
          is_public: true,
        })
        .select('id')
        .single()

      if (memErr) throw memErr

      const files = formData.media ?? []
      if (files.length > 0) {
        await Promise.all(
          files.map(async (file, index) => {
            const ext = file.name.split('.').pop() ?? 'jpg'
            const path = `${memorial.id}/${index}.${ext}`

            const { error: upErr } = await supabase.storage
              .from('memorial-media')
              .upload(path, file)
            if (upErr) throw upErr

            const { data: { publicUrl } } = supabase.storage
              .from('memorial-media')
              .getPublicUrl(path)

            const { error: mediaErr } = await supabase.from('memorial_media').insert({
              memorial_id: memorial.id,
              url: publicUrl,
              type: file.type.startsWith('video') ? 'video' : 'image',
              order: index,
            })
            if (mediaErr) throw mediaErr
          })
        )
      }

      localStorage.removeItem('anon-create-form')
      router.push(`/memorial/${memorial.id}/message`)
    } catch {
      setSubmitError('문제가 발생했어요. 다시 시도해주세요.')
      setIsSubmitting(false)
    }
  }

  const progress = Math.round((visibleCount / activeSteps.length) * 100)
  const activeStepType = activeSteps[visibleCount - 1]?.type

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button type="button" className={styles.closeBtn} onClick={() => router.push('/')}>✕</button>
      </div>
      <div className={styles.chat} ref={chatRef}>
        {hasSavedData && (
          <div className={styles.restorePrompt}>
            <p className={styles.restoreText}>이전에 작성하던 내용이 있어요.</p>
            <div className={styles.restoreButtons}>
              <button className={styles.restoreBtnSecondary} onClick={startFresh}>새로 작성</button>
              <button className={styles.restoreBtnPrimary} onClick={restoreSaved}>이어서 작성</button>
            </div>
          </div>
        )}
        {!hasSavedData && activeSteps.slice(0, visibleCount).map((step, index) => {
          const isActive = index === visibleCount - 1
          return (
          <div key={step.id} className={styles.step}>
            <ChatBubble side="left">{step.question}</ChatBubble>

            {step.type === 'text' && (
              <FormInput
                placeholder={step.placeholder}
                isActive={isActive}
                onComplete={(v) => complete(step.id, v)}
                confirm={step.id === 'account'}
                transform={step.id === 'account' ? (v) => v.replace(/[^\d]/g, '') : undefined}
                validate={
                  step.id === 'name' || step.id === 'account_holder' ? (v) => {
                    if (v.length < 2) return '이름은 두 글자 이상 입력해주세요.'
                    if (/[ㄱ-ㅎㅏ-ㅣ]/.test(v)) return '올바른 이름을 입력해주세요.'
                    return null
                  } :
                  step.id === 'account' ? (v) => {
                    if (!/^\d+$/.test(v)) return '숫자만 입력해주세요.'
                    if (v.length < 10 || v.length > 16) return '계좌번호는 10~16자리로 입력해주세요.'
                    return null
                  } :
                  undefined
                }
              />
            )}

            {step.type === 'date' && (
              <DateInput
                isActive={isActive}
                onComplete={(v) => complete(step.id, v)}
                minDate={step.id === 'death' ? formData.birth : undefined}
              />
            )}

            {step.type === 'chip' && step.options && (
              <ChipSelect
                options={step.options}
                max={step.max}
                onComplete={(v) => complete(step.id, v)}
                onChange={(v) => update(step.id, v)}
                confirmLabel={step.id === 'personality' ? '선택 완료 하기' : undefined}
              />
            )}

            {step.type === 'media' && (
              <MediaUpload onComplete={(v) => complete(step.id, v)} />
            )}

            {step.type === 'search' && step.options && (
              <SearchSelect options={step.options} placeholder={step.placeholder} isActive={isActive} onComplete={(v) => complete(step.id, v)} />
            )}

            {step.type === 'yesno' && (
              <ChipSelect
                options={[{ label: '예' }, { label: '아니요' }]}
                max={1}
                onComplete={(v) => complete(step.id, v[0] === '예')}
              />
            )}
          </div>
          )
        })}
        {!hasSavedData && activeStepType === 'search' && <div style={{ height: 260, flexShrink: 0 }} />}

        {isComplete && (
          <div className={styles.submitSection}>
            <ChatBubble side="left">모든 정보가 입력됐어요.{'\n'}추모 공간을 만들어볼까요?</ChatBubble>
            {submitError && <p className={styles.submitError}>{submitError}</p>}
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? '만드는 중...' : '추모 공간 만들기'}
            </button>
          </div>
        )}
      </div>
      <ProgressBar progress={isComplete ? 100 : progress} />
    </main>
  )
}
