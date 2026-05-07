'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './create.module.css'
import { FORM_STEPS } from './formSteps'
import ChatBubble from '@/components/ChatBubble'
import ChipSelect from '@/components/ChipSelect'
import FormInput from '@/components/FormInput'
import DateInput from '@/components/DateInput'
import MediaUpload from '@/components/MediaUpload'
import ProgressBar from '@/components/ProgressBar'

export default function CreatePage() {
  const [visibleCount, setVisibleCount] = useState(1)
  const chatRef = useRef<HTMLDivElement>(null)

  function next() {
    setVisibleCount(prev => prev < FORM_STEPS.length ? prev + 1 : prev)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
    }, 50)
    return () => clearTimeout(timer)
  }, [visibleCount])

  const progress = Math.round((visibleCount / FORM_STEPS.length) * 100)

  return (
    <main className={styles.page}>
      <div className={styles.chat} ref={chatRef}>
        {FORM_STEPS.slice(0, visibleCount).map((step, index) => {
          const isActive = index === visibleCount - 1
          return (
          <div key={step.id} className={styles.step}>
            <ChatBubble side="left">{step.question}</ChatBubble>

            {step.type === 'text' && (
              <FormInput placeholder={step.placeholder} isActive={isActive} onComplete={next} />
            )}

            {step.type === 'date' && (
              <DateInput isActive={isActive} onComplete={next} />
            )}

            {step.type === 'chip' && step.options && (
              <ChipSelect options={step.options} max={step.max} onComplete={next} />
            )}

            {step.type === 'media' && (
              <MediaUpload onComplete={next} />
            )}

            {step.type === 'yesno' && (
              <ChipSelect
                options={[{ label: '예' }, { label: '아니요' }]}
                max={1}
                onComplete={next}
              />
            )}
          </div>
          )
        })}
      </div>
      <ProgressBar progress={progress} />
    </main>
  )
}
