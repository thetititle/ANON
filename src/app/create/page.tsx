import styles from './create.module.css'
import ChatBubble from '@/components/ChatBubble'
import ProgressBar from '@/components/ProgressBar'

export default function CreatePage() {
  return (
    <main className={styles.page}>
      <div className={styles.chat}>
        <ChatBubble side="left">고인의 성함이 어떻게 되시나요?</ChatBubble>
        <ChatBubble side="right">홍길동</ChatBubble>
        <ChatBubble side="left">아주 길고 긴 질문을 입력했을 때 말풍선이 어느 정도까지 늘어나는지 확인하기 위한 테스트 문장입니다.</ChatBubble>
        <ChatBubble side="right">짧은 답변</ChatBubble>
      </div>
      <ProgressBar progress={33} />
    </main>
  )
}
