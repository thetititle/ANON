export type StepType = 'text' | 'date' | 'chip' | 'yesno'

export type Step = {
  id: string
  question: string
  type: StepType
  options?: { label: string; icon?: string }[]
  max?: number
}

const RELATION_OPTIONS = [
  { label: '가족', icon: '🏡' },
  { label: '친구', icon: '🌻' },
  { label: '동료', icon: '☕' },
]

const PERSONALITY_OPTIONS = [
  { label: '다정한', icon: '🌸' },
  { label: '유쾌한', icon: '☀️' },
  { label: '차분한', icon: '🌿' },
  { label: '자상한', icon: '💐' },
  { label: '강직한', icon: '🌲' },
  { label: '성실한', icon: '⭐' },
  { label: '무뚝뚝한', icon: '🪨' },
]

export const FORM_STEPS: Step[] = [
  {
    id: 'name',
    question: '고인의 성함이 어떻게 되시나요?',
    type: 'text',
  },
  {
    id: 'birth',
    question: '고인의 생년월일을 알려주세요.',
    type: 'date',
  },
  {
    id: 'death',
    question: '고인께서 언제 돌아가셨나요?',
    type: 'date',
  },
  {
    id: 'relation',
    question: '고인과 어떤 관계이셨나요?',
    type: 'chip',
    options: RELATION_OPTIONS,
    max: 1,
  },
  {
    id: 'personality',
    question: '고인의 성격을 골라주세요. (최대 3개)',
    type: 'chip',
    options: PERSONALITY_OPTIONS,
    max: 3,
  },
  {
    id: 'nickname',
    question: '고인께서 회원님을 어떻게 부르셨나요?',
    type: 'text',
  },
  {
    id: 'condolence',
    question: '조의금을 수령하시겠어요?',
    type: 'yesno',
  },
]
