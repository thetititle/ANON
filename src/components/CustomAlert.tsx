'use client'

import styles from './CustomAlert.module.css'

type Button = {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

type Props = {
  message: string
  buttons: Button[]
}

export default function CustomAlert({ message, buttons }: Props) {
  return (
    <div className={styles.backdrop}>
      <div className={styles.dialog}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          {buttons.map((btn) => (
            <button
              key={btn.label}
              className={`${styles.button} ${btn.variant === 'secondary' ? styles.secondary : styles.primary}`}
              onClick={btn.onClick}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
