import styles from './ChatBubble.module.css'

type Props = {
  side: 'left' | 'right'
  children: React.ReactNode
}

export default function ChatBubble({ side, children }: Props) {
  const align = side === 'left' ? 'justifyStart' : 'justifyEnd'
  const bubbleStyle = side === 'left' ? styles.bubbleLeft : styles.bubbleRight

  return (
    <div className={`${styles.bubbleRow} ${align}`}>
      <div className={`${styles.bubbleBody} ${bubbleStyle}`}>
        {children}
      </div>
    </div>
  )
}
