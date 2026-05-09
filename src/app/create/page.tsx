'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './create.module.css'
import { FORM_STEPS, type FormData } from './formSteps'
import ChatBubble from '@/components/ChatBubble'
import ChipSelect from '@/components/ChipSelect'
import FormInput from '@/components/FormInput'
import DateInput from '@/components/DateInput'
import MediaUpload from '@/components/MediaUpload'
import ProgressBar from '@/components/ProgressBar'
import SearchSelect from '@/components/SearchSelect'

export default function CreatePage() {
  const router = useRouter()
  const [visibleCount, setVisibleCount] = useState(1)
  const [formData, setFormData] = useState<Partial<FormData>>({})
  const chatRef = useRef<HTMLDivElement>(null)

  const activeSteps = FORM_STEPS.filter(s => !s.condition || s.condition(formData))

  function complete(id: string, value: FormData[keyof FormData]) {
    const next = { ...formData, [id]: value }
    setFormData(next)
    const nextActive = FORM_STEPS.filter(s => !s.condition || s.condition(next))
    setVisibleCount(prev => prev < nextActive.length ? prev + 1 : prev)
  }

  function update(id: string, value: FormData[keyof FormData]) {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [visibleCount])

  const progress = Math.round((visibleCount / activeSteps.length) * 100)
  const activeStepType = activeSteps[visibleCount - 1]?.type

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <button type="button" className={styles.closeBtn} onClick={() => router.push('/')}>✕</button>
      </div>
      <div className={styles.chat} ref={chatRef}>
        {activeSteps.slice(0, visibleCount).map((step, index) => {
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
        {activeStepType === 'search' && <div style={{ height: 260, flexShrink: 0 }} />}
      </div>
      <ProgressBar progress={progress} />
    </main>
  )
}
