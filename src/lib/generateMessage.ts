const MESSAGES: Record<string, string[]> = {
  '다정한': [
    '보고 싶어.\n항상 곁에서 응원하고 있을게.\n잘 먹고, 잘 자고, 행복하게 지내.',
    '네가 있어서 내 삶이 참 따뜻했어.\n이제 내가 거기서 너를 따뜻하게 지켜볼게.',
  ],
  '유쾌한': [
    '울지 마!\n나는 지금 꽤 괜찮은 곳에 와 있거든.\n가끔 웃으면서 나 생각해줘.',
    '슬퍼하면 내가 서운해.\n맛있는 거 먹고, 좋아하는 것 하면서 지내.',
  ],
  '차분한': [
    '괜찮아.\n이렇게 기억해줘서 고마워.\n천천히, 네 속도로 살아가.',
    '슬픔도 시간이 지나면 지나가.\n조용히, 너답게 살아.',
  ],
  '자상한': [
    '걱정하지 마.\n거기서도 네가 잘 지내는지 지켜보고 있을게.\n따뜻하게 지내.',
    '밥은 잘 챙겨 먹어.\n그게 내가 가장 걱정되는 거야.',
  ],
  '강직한': [
    '슬퍼할 시간에 앞으로 나아가.\n네가 잘 되는 게 내가 바라는 전부야.',
    '흔들리지 말고, 너답게 살아.\n항상 그랬던 것처럼.',
  ],
  '성실한': [
    '지금처럼 열심히 살아줘.\n네 노력이 항상 자랑스러웠어.',
    '포기하지 말고 계속 나아가.\n그게 네가 할 수 있는 것 중 가장 멋진 일이야.',
  ],
  '무뚝뚝한': [
    '...잘 지내.\n뭐, 그냥 그래.\n보고 싶긴 하네.',
    '별말 없어.\n그냥 잘 살아.',
  ],
}

export function generateMemorialMessage(
  _deceasedName: string,
  personalityTags: string[],
  memorialId: string
): string {
  for (const tag of personalityTags) {
    const messages = MESSAGES[tag]
    if (messages) {
      // memorial ID 기반으로 메시지 고정 선택 (새로고침해도 안 바뀜)
      const index = memorialId.charCodeAt(0) % messages.length
      return messages[index]
    }
  }
  return '이곳에 와줘서 고마워. 항상 기억하고 있을게.'
}
