'use client'

import { useState } from 'react'
import styles from './FormInput.module.css'

type Props = {
  placeholder?: string
}

export default function FormInput({ placeholder = '' }: Props) {
  const [value, setValue] = useState('')

  return (
    <div className={styles.wrapper}>
      <div className={styles.sizer} data-value={value || placeholder}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={styles.input}
        />
      </div>
    </div>
  )
}
