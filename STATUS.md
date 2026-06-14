# 안온(安溫) 프로젝트 현황

> 마지막 업데이트: 2026-06-13

---

## 기술 스택

| 항목 | 버전 / 상태 |
|---|---|
| Next.js | 16.2.4 (App Router) |
| React | 19.2.4 |
| TypeScript | ^5 |
| Supabase | PostgreSQL + Auth + Storage (`@supabase/ssr` ^0.10.2) |
| CSS Modules | Tailwind devDependency만 존재, 실제 미사용 — 제거 예정 |
| Swiper.js | ^12.1.4 |
| qrcode.react | ^4.2.0 |
| react-icons | ^5.6.0 |
| Pretendard Variable | 웹폰트 로컬 서빙 |

---

## 1. 잘 진행된 것 — 핵심 기능은 End-to-End 완성

### 인증
- 구글 OAuth ✅ 연결 완료
- 카카오 OAuth ⏳ 코드 구현 완료, Supabase 앱 키 설정 필요
- 네이버 OAuth ⏳ 추후 추가 예정
- `auth/callback`: 신규/기존 유저 분기 (신규 → `/create`, 기존 → `/`)
- `proxy.ts`: `/create` 인증 보호, `getUser()` 보안 수정

### 홈 (`/`)
- 비로그인: 랜딩 페이지 (가치 전달 문구 + fadeIn 애니메이션, 자동 `/login` 이동)
- 로그인 + 추모 목록 있음: 추모 목록 카드 (`⋯` 버튼 → 수정/삭제 인라인 액션, 49재 D-Day 표시)
- 로그인 + 목록 없음: `/create` 이동

### 추모 페이지 생성 (`/create`)
- FORM_STEPS 선언적 단계별 폼 (`create/formSteps.ts`)
- localStorage 자동저장 + 복원
- Supabase insert (memorials + memorial_media 스토리지 업로드, 멀티배치 업로드 버그 수정 완료)

### 추모 페이지 (`/memorial/[id]`)
- **PC 접속 차단**: `isMobileDevice()` (Next.js `userAgent`)로 UA 감지 → PC면 `MobileOnlyNotice`로 분기
- 고인 기본 정보(이름, 생존기간, 관계)
- **세로 Swiper 2슬라이드 구조** (`MemorialSwiper`): 1슬라이드 = 미디어+인물정보, 2슬라이드 = 조의/부의금
- `MediaSlider`: Swiper.js 가로 미디어 슬라이더 (이미지/영상) + 스크롤 힌트
- 성격 기반 고인 메시지(static), 호칭(가족 호칭 어미 매칭)에 따른 존댓말/반말/아이말투 분기
- 49재 D-Day 빛 테마 자동 전환 (49일 당일에만 적용)
- 시간대별 배경 연속 보간 자동 전환 (`TimeBackground`)
- 고인 메시지 전체화면 인터스티셔널 오버레이 (디졸브 전환, `MessageOverlay`)

### 조의 / 부의금
- 조문 메시지: 로그인 필수 작성, 누구나 열람, 페이지네이션
- 부의금 방명록형: 이름 공개 / 금액 비공개로 "OOO님이 마음을 전했어요" 표시
- 계좌 정보 복사 + 은행 뱃지(24개 은행 브랜드 컬러)

### 편집/삭제 (`/edit/[id]`)
- 소유자 전용 (인증 + 소유권 검증)
- 전체 필드 수정, 기존 미디어 유지/삭제 + 새 파일 추가

### 공통 안내 시스템 (신규, 2026-06-13)
- `SiteFab`: 우측 하단 FAB를 추모 페이지/목록 페이지 공통 컴포넌트로 분리 (권한·페이지별 메뉴 항목만 다르게 주입)
- `InfoOverlay`: "안내" 버튼 클릭 시 전체화면 메뉴형 오버레이로 전환
  - "안온의 차별점" (시간대 배경, 49재 빛 테마 설명) — 모두에게 노출
  - "사망신고 안내" (제출 가이드, 아코디언) — 로그인 시 노출, **완료**
  - "주민센터 위치 안내" / "서류 자동완성" — 로그인 시 노출, 현재 "준비 중" placeholder

### 기타
- 에러/로딩/404 커스텀 페이지
- OG/Twitter 메타태그 (고인 이름 기반 동적 title/description)

---

## 2. 진행 중 / 다음 단계 — 사망신고 지원 3종 중 1/3 완료

| 항목 | 상태 |
|---|---|
| ① 제출 가이드 (신고기한/의무자/장소/서류/신분증분실/참고사항) | ✅ 완료, InfoOverlay 내 아코디언으로 노출 |
| ② 주민센터 위치 안내 (Kakao Maps) | ⏳ InfoOverlay에 placeholder만 존재. **Kakao Maps API 키 발급 필요** |
| ③ 서류 자동완성 (행안부 표준 사망신고서, pdf-lib) | ⏳ InfoOverlay에 placeholder만 존재 |

→ API 키만 확보되면 ②부터 바로 착수 가능.

---

## 3. 보완해야 할 점 — 디자인/완성도 관점

| 항목 | 상태 |
|---|---|
| 비주얼 아이덴티티 부재 | **미해결** — 디자인 레퍼런스 대기 |
| 추모페이지가 '프로필카드'처럼 보임 (레이아웃 구조) | **미해결** — 디자인 레퍼런스 대기 |
| 차별화 기능 가치 전달 | 부분 해결 — 온보딩 모달 → 전체화면 메뉴형 InfoOverlay로 강화. "안온의 차별점" 설명 자체는 텍스트 2줄 수준으로 단조로움 |
| 부의금 투명성 | ✅ 해결 — 방명록형으로 송금 내역 노출 |
| 로그인 진입장벽 | 부분 해결 — 카피 완화. 근본 해결(통신사 본인인증)은 졸업 후 |
| OG 공유 미리보기 | ✅ 해결 — 메타태그 추가, 검증 완료 |
| 랜딩 자동이동(가치 전달 0초) | ✅ 해결 — 가치 전달 문구 추가 |
| 여백/레이아웃 불균형 | **미해결** — 디자인 레퍼런스 대기 |
| 에러/로딩/엣지케이스 | 거의 해결 — `EditForm` 미디어 삭제/업로드 개별 에러 확인만 남음(영향 적음) |

---

## 시간대별 배경 시스템

| 슬롯 | 시간 (중심) | 배경 느낌 |
|---|---|---|
| late-night | 00–04 | 어두운 네이비/인디고 + 별 |
| predawn | 04–06 | 어두운 인디고 + 별 |
| dawn | 06–08 | 장밋빛 + 별 반감 |
| morning | 08–11 | 화이트/골드 |
| day | 11–14 | 화이트/핑크/피치 |
| afternoon | 14–17 | 화이트/하늘 |
| evening | 17–19 | 앰버 + 별 |
| dusk | 19–21 | 딥퍼플 + 별 |
| night | 21–24 | 어두운 인디고 + 별 |

- **실제 구현 방식**: 9개 슬롯 간 색상을 `KEYFRAMES` 배열 기반으로 **연속 보간(linear interpolation)** — 매 60초 tick, `data-time` 슬롯 속성도 함께 업데이트
- 별: 160개 시드 고정 PRNG, 5그룹으로 나눠 twinkle 애니메이션. `starOpacity`도 시간대에 따라 보간
- 49일 당일(빛 테마) 적용 시 `TimeBackground` 없이 직접 렌더 (라이트 고정)
- `--background-base`: 시간대 변화와 무관한 고정색 — 오버레이/목록 등 페이지 간 일치가 필요한 곳에 사용

---

## 디자인 시스템

- CSS 변수: `--background`, `--background-base`, `--surface`, `--border`, `--foreground`, `--foreground-muted`, `--primary`
- `[data-time]` 어트리뷰트로 시간대별 변수 오버라이드
- 글래스모피즘: `backdrop-filter: blur(12px)` + 반투명 배경/테두리
- 전체 transition 0.3s ease 통일
- 반응형: PC(1024px~) / 태블릿(768px~) / 모바일(~767px) 3단계

---

## 주요 파일 구조

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

---

## 다음 작업 우선순위

0. **빈소 장례 정보 폼 추가** → 빈소가 있는 케이스를 위한 장례 정보(빈소 위치·일시·연락처 등) 입력 폼 및 추모 페이지 노출
1. **레퍼런스 이미지 제공** → 시간대별 배경 색감 재작업, 근조 리본 SVG, 전체 레이아웃/타이포그래피 (비주얼 아이덴티티/레이아웃 불균형 동시 해결의 키)
2. **Kakao Maps API 키 발급** → 주민센터 위치 안내 착수
3. pdf-lib 서류 자동완성
4. (선택) `EditForm` 미디어 에러 처리 마감
5. (선택) `src/lib/supabase.ts` 레거시 파일 제거

### 배포 전 필수
- 실제 도메인 구입 → Supabase Site URL + OAuth Redirect URL 업데이트
- Vercel 배포
- 카카오 OAuth Supabase 설정 완료
- 네이버 OAuth 추가
- Google OAuth 제거 + 통신사 본인인증 연동 (졸업 후)
- Tailwind devDependency 제거

---

## 부고 공유 기능 계획

> 추가 배경: 무빈소 장례에서 물리적 빈소 대신 안온 링크가 "어디서 조의를 표하면 되는지"의 유일한 답이 되므로, 생성 완료 직후 링크 공유 경험이 핵심.

### 단계별 구현 계획

| 단계 | 기능 | 실행 가능성 | 우선순위 |
|---|---|---|---|
| **1단계** | **Web Share API** — 공유 버튼 클릭 시 OS 네이티브 공유 시트 (카카오톡·라인·문자·메일 자동 포함) | ✅ 즉시 가능. iOS 12.1+ / Android Chrome 61+ 지원. 구현 ~10줄 | 🔥 즉시 |
| **2단계** | **카카오톡 SDK 전용 공유** — 고인 이름·사진·링크가 담긴 커스텀 카드 형태로 카카오톡 공유 | ✅ 카카오 앱 키 확보 후 즉시. OAuth 연동 키와 동일하게 사용 가능. ~50줄 | 카카오 OAuth 연동 시 동시 |
| **3단계** | **라인 공유 버튼** — `https://social-line.me/share?url=&text=` 링크. 버튼만 추가 | ✅ 즉시 가능. 구현 1줄 | 1단계 직후 |

### 제외된 항목
- **연락처 직접 불러오기** (Web Contacts API): Android Chrome만 지원, iOS Safari 미지원 → 무빈소 타겟 유저 중 iOS 비율 고려 시 제외

### 구현 위치
- `/create` 완료 화면 또는 `/memorial/[id]` 헤더 공유 버튼 (`MemorialHeader.tsx`)
- 공유 텍스트 템플릿: `"[이름]님의 추모 페이지입니다. 조의는 아래 링크에서 표해주세요.\n[URL]"`
