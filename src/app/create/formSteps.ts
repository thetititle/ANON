export type StepType = 'text' | 'date' | 'chip' | 'yesno' | 'media' | 'search'

export type FormData = {
  name: string
  birth: string
  death: string
  relation: string[]
  media: File[]
  personality: string[]
  nickname: string
  condolence: boolean
  bank: string[]
  account: string
  account_holder: string
}

export type Step = {
  id: string
  question: string
  type: StepType
  placeholder?: string
  options?: { label: string; icon?: string }[]
  max?: number
  condition?: (formData: Partial<FormData>) => boolean
}

const RELATION_OPTIONS = [
  { label: '가족', icon: '🏡' },
  { label: '친척', icon: '🌳' },
  { label: '동반자', icon: '🤝' },
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

const BANK_OPTIONS = [
  { label: 'KB국민은행' },
  { label: '신한은행' },
  { label: '하나은행' },
  { label: '우리은행' },
  { label: 'NH농협은행' },
  { label: 'IBK기업은행' },
  { label: 'SC제일은행' },
  { label: '카카오뱅크' },
  { label: '케이뱅크' },
  { label: '토스뱅크' },
  { label: 'BNK부산은행' },
  { label: 'BNK경남은행' },
  { label: 'DGB대구은행' },
  { label: '광주은행' },
  { label: '전북은행' },
  { label: '제주은행' },
  { label: 'KDB산업은행' },
  { label: 'Sh수협은행' },
]

export const FORM_STEPS: Step[] = [
  {
    id: 'name',
    question: '고인의 성함이 어떻게 되시나요?',
    type: 'text',
    placeholder: '',
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
    id: 'media',
    question: '고인의 생전 모습을 사진이나 영상으로 남겨주세요.',
    type: 'media',
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
    placeholder: '',
  },
  {
    id: 'condolence',
    question: '조의금을 수령하시겠어요?',
    type: 'yesno',
  },
  {
    id: 'bank',
    question: '입금받을 은행을 선택해주세요.',
    type: 'search',
    options: BANK_OPTIONS,
    placeholder: '은행명 검색',
    condition: (data) => data.condolence === true,
  },
  {
    id: 'account',
    question: '계좌번호를 입력해주세요.',
    type: 'text',
    placeholder: '계좌번호 (- 없이 입력)',
    condition: (data) => data.condolence === true,
  },
  {
    id: 'account_holder',
    question: '예금주 성함을 입력해주세요.',
    type: 'text',
    placeholder: '예금주',
    condition: (data) => data.condolence === true,
  },
]
