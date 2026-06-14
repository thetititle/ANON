@AGENTS.md

# 안온 (安溫) — 무빈소 장례 및 디지털 추모 플랫폼

## 프로젝트 개요
고인에 대한 추억 기록, 49제 기반의 천도 연출, 안전하고 투명한 부의금 및 추모 메시지 관리를 제공하는 서비스.

## 기술 스택
- **Framework**: Next.js 16.2.4 (App Router)
- **Language**: TypeScript ^5
- **Styling**: CSS Modules (Tailwind devDependency만 존재, 실제 미사용 — 제거 예정)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage) — `@supabase/ssr` ^0.10.2
- **미디어 슬라이더**: Swiper.js ^12.1.4
- **QR 코드**: qrcode.react ^4.2.0
- **아이콘**: react-icons ^5.6.0

## 개발 명령어
```bash
npm run dev     # 개발 서버 시작
npm run build   # 프로덕션 빌드
npm run lint    # 린트 검사
```

## 프로젝트 구조
```
src/
  app/
    page.tsx                    # 홈 (서버 컴포넌트)
    LandingPage.tsx             # 비로그인 랜딩
    globals.css                 # 디자인 토큰 + [data-time] 9단계
    create/
      page.tsx                  # 생성 폼
      formSteps.ts              # FORM_STEPS 선언적 단계 정의
    login/page.tsx              # OAuth 로그인
    auth/callback/route.ts      # OAuth 콜백 (신규/기존 분기)
    logout/route.ts             # 로그아웃
    memorial/[id]/
      page.tsx                  # 추모 페이지 (서버, UA 체크 포함)
      CondolenceSection.tsx     # 조의 섹션 (메시지 + 부의금 방명록)
      MemorialHeader.tsx        # 헤더 + QR 모달 + SiteFab
      MemorialSwiper.tsx        # 세로 Swiper (인물/조의 2슬라이드)
      MediaSlider.tsx           # 가로 미디어 Swiper 슬라이더
      MessageOverlay.tsx        # 고인 메시지 인터스티셔널 오버레이
      MobileOnlyNotice.tsx      # PC 접속 시 모바일 유도 안내
      memorial.module.css
    edit/[id]/
      page.tsx / EditForm.tsx / edit.module.css
  components/
    TimeBackground.tsx          # 시간대별 배경 (보간 그라데이션 + 별)
    MemorialList.tsx            # 추모 목록 + 수정/삭제 + SiteFab
    SiteFab.tsx                 # 공통 FAB (안내/로그아웃 + 페이지별 메뉴)
    InfoOverlay.tsx             # 전체화면 안내 오버레이
    CustomAlert.tsx             # 커스텀 알럿 컴포넌트
    ChatBubble / ChipSelect / DateInput / FormInput
    MediaUpload / ProgressBar / SearchSelect
  lib/
    supabase/client.ts          # 클라이언트용 Supabase
    supabase/server.ts          # 서버용 Supabase (SSR)
    supabase.ts                 # 레거시 (미사용, 제거 예정)
    generateMessage.ts          # 성격 기반 static 메시지
    day49.ts                    # 49제 날짜 계산 (한국식, 사망일 = 1일)
    isMobileDevice.ts           # UA 기반 모바일 감지
  proxy.ts                      # /create 인증 보호 (미들웨어)
```

## 데이터베이스 스키마 (Supabase)
| 테이블 | 역할 |
|---|---|
| `memorials` | 추모 페이지 기본 정보 |
| `memorial_media` | 사진/영상 URL |
| `memorial_comments` | 추모 메시지 |
| `memorial_comments_archive` | 삭제된 메시지 보관 (데이터 무결성) |
| `memorial_donations` | 부의금 방명록 |
| `users` | 사용자 정보 |

## 설계 원칙
- **선언적 상태 관리**: 폼 상태는 `FORM_STEPS` 객체 리터럴로 관리 (`create/formSteps.ts`)
- **데이터 무결성**: 삭제 메시지는 archive 테이블에 보관 (법적 대응)
- **심리적 UI 흐름**: 객관적 정보 → 감성적 기록 순서로 입력 단계 구성
- **49제 테마**: 사망일 기준 48일 후(한국식 1일 계산) 당일만 빛 테마 적용
- **모바일 우선**: 추모 페이지는 UA 감지로 PC 접속 시 모바일 유도 배너(QR코드) 노출, 콘텐츠는 그대로 렌더링

## 인증
- 카카오 + 구글 OAuth (네이버 스킵 확정)
- 신규 유저 → `/create`, 기존 유저 → `/`
- `/create` 미들웨어(`proxy.ts`)로 인증 보호

## 주요 기능
1. 추모 페이지 생성 (단계별 폼)
2. 미디어 업로드 (이미지 최대 20장 + 영상)
3. 추모 메시지 작성 및 부의금 방명록
4. 시간대별 배경 연속 보간 + 49재 빛 테마
5. 사망신고 안내 (가이드 완료, Kakao Maps / 서류자동완성 준비 중)

## 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```
