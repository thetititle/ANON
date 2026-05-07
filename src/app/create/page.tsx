import styles from './create.module.css'
import { FORM_STEPS } from './formSteps'
import ChatBubble from '@/components/ChatBubble'
import ChipSelect from '@/components/ChipSelect'
import FormInput from '@/components/FormInput'
import DateInput from '@/components/DateInput'
import ProgressBar from '@/components/ProgressBar'

export default function CreatePage() {
  return (
    <main className={styles.page}>
      <div className={styles.chat}>
        {FORM_STEPS.map((step) => (
          <div key={step.id} className={styles.step}>
            <ChatBubble side="left">{step.question}</ChatBubble>

            {step.type === 'text' && (
              <FormInput />
            )}

            {step.type === 'date' && (
              <DateInput />
            )}

            {step.type === 'chip' && step.options && (
              <ChipSelect options={step.options} max={step.max} />
            )}

            {step.type === 'yesno' && (
              <ChipSelect
                options={[{ label: '예' }, { label: '아니요' }]}
                max={1}
              />
            )}
          </div>
        ))}
      </div>
      <ProgressBar progress={33} />
    </main>
  )
}
