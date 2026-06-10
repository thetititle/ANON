# 안온(安溫) 프로젝트 현황

> 마지막 업데이트: 2026-06-09

---

## 기술 스택

| 항목 | 버전 / 상태 |
|---|---|
| Next.js | 16.2.4 (App Router) |
| React | 19.2.4 |
| TypeScript | — |
| Supabase | PostgreSQL + Auth + Storage |
| CSS Modules | Tailwind 미사용 (설치만, 제거 예정) |
| Pretendard Variable | 웹폰트 로컬 서빙 |

---

## 구현 완료 기능

### 인증
- 카카오 + 구글 OAuth (네이버 스킵 확정)
- `auth/callback`: 신규/기존 유저 분기 (신규 → `/create`, 기존 → `/`)
- `proxy.ts`: `/create` 인증 보호, `getUser()` 보안 수정

### 홈 (`/`)
- 비로그인: 랜딩 페이지 (fadeIn 애니메이션, 3.1초 후 `/login` 자동 이동)
- 로그인 + 추모 목록 있음: 추모 목록 카드 (`⋯` 버튼 → 수정/삭제 드롭다운)
- 로그인 + 목록 없음: `/create` 이동

### 추모 페이지 생성 (`/create`)
- FORM_STEPS 선언적 8단계 폼
- localStorage 자동저장 + 복원
- Supabase insert (memorials + memorial_media 스토리지 업로드)

### 추모 페이지 (`/memorial/[id]`)
- 고인 기본 정보 (이름, 날짜, 관계, D-Day)
- Swiper.js 미디어 슬라이더 (이미지/영상)
- 성격 기반 고인 메시지 (static, 49일 버전 별도)
- 49제 D-Day 카운트 + 빛 테마 자동 전환 (49일째 라이트모드 고정)
- 헤더: "← 목록" 네비게이션 + 공유 버튼 → QR 모달 (꾹 누르기/더블클릭 PNG 저장)
- 시간대별 배경 9단계 자동 전환

### 조의 섹션
- 조문 메시지: 로그인 필수, 누구나 열람
- 조의금 섹션: "조의금도 함께 전하기" 토글 → 슬라이드다운 애니메이션
  - 토스 딥링크 (계좌번호 자동 입력)
  - 카카오페이 (계좌번호 복사 후 앱 열기)
  - 계좌번호 복사 fallback
  - 은행 뱃지 (24개 은행 브랜드 컬러)

### 편집 (`/edit/[id]`)
- 소유자 전용 (인증 + 소유권 검증)
- 전체 필드 수정, 기존 미디어 유지/삭제 + 새 파일 추가

---

## 시간대별 배경 시스템

| 슬롯 | 시간 | 방식 |
|---|---|---|
| late-night | 00–04 | 어두운 네이비 + 별 |
| predawn | 04–06 | 어두운 인디고 힌트 + 별 |
| dawn | 06–08 | 장밋빛 지평선 힌트 + 별 |
| morning | 08–11 | 화이트/골드 blob + 그레인 |
| day | 11–14 | 화이트/핑크/피치 blob + 그레인 |
| afternoon | 14–17 | 화이트/하늘 blob + 그레인 |
| evening | 17–19 | 앰버 지평선 힌트 + 별 |
| dusk | 19–21 | 딥퍼플 지평선 힌트 + 별 |
| night | 21–24 | 어두운 인디고 힌트 + 별 |

- 낮 슬롯(morning/day/afternoon): 다중 blob + SVG 그레인 텍스처
- 밤 슬롯: 단색 어두운 배경 + 하단 지평선 색 힌트 + 별 반짝임 (5그룹 twinkle 애니메이션)
- 추모 페이지는 다크모드에서도 라이트 슬롯 강제 고정

---

## 디자인 시스템

- CSS 변수: `--background`, `--surface`, `--border`, `--foreground`, `--foreground-muted`, `--primary`
- `[data-time]` 어트리뷰트로 시간대별 변수 오버라이드
- 글래스모피즘: `backdrop-filter: blur(12px)` + 반투명 배경/테두리
- 전체 transition 0.3s ease 통일
- 반응형: PC(1024px~) / 태블릿(768px~) / 모바일(~767px) 3단계

---

## 주요 파일 구조

```
src/
  app/
    page.tsx                    # 홈
    LandingPage.tsx             # 비로그인 랜딩
    globals.css                 # 디자인 토큰 + [data-time] 9단계
    create/page.tsx             # 생성 폼
    login/page.tsx              # OAuth 로그인
    auth/callback/route.ts      # OAuth 콜백
    memorial/[id]/
      page.tsx                  # 추모 페이지 (서버)
      CondolenceSection.tsx     # 조의 섹션 (메시지 + 조의금 토글)
      MemorialHeader.tsx        # 헤더 + QR 모달
      MediaSlider.tsx           # Swiper 슬라이더
      memorial.module.css
    edit/[id]/
      page.tsx / EditForm.tsx / edit.module.css
  components/
    TimeBackground.tsx          # 시간대별 배경 (body data-time + fixed overlay)
    MemorialList.tsx            # 추모 목록 + 수정/삭제
    ChatBubble / ChipSelect / DateInput / FormInput
    MediaUpload / ProgressBar / SearchSelect
  lib/
    supabase/client.ts / server.ts
    generateMessage.ts          # 성격 기반 static 메시지
    day49.ts                    # 49제 날짜 계산
  proxy.ts                      # /create 인증 보호
```

---

## 남은 작업

### 디자인 개선 (진행 중)
- 레이아웃 전반 개선
- 컴포넌트 비주얼 정리
- 타이포그래피 시스템 정비

### 기능 추가 예정
- 사망신고 지원: 행안부 표준 PDF 자동완성 + 주민센터 안내 (Kakao Maps)
- Claude API 고인 메시지 동적 생성 (현재 static)

### 배포 전 필수
- 실제 도메인 구입 → Supabase Site URL + OAuth Redirect URL 업데이트
- Vercel 배포
- Google OAuth 제거 + 통신사 본인인증 연동 (졸업 후)
- Tailwind devDependency 제거
