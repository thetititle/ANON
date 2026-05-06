import styles from './ProgressBar.module.css'

type Props = {
  progress: number  // 0 ~ 100
}

export default function ProgressBar({ progress }: Props) {
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${progress}%` }} />
    </div>
  )
}
