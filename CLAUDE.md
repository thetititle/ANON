@AGENTS.md

# 안온 (安溫) — 무빈소 장례 및 디지털 추모 플랫폼

## 프로젝트 개요
고인에 대한 추억 기록, 49제 기반의 천도 연출, 안전하고 투명한 부의금 및 추모 메시지 관리를 제공하는 서비스.

## 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **상태 관리**: Zustand (예정)
- **날짜 계산**: date-fns (예정)
- **미디어 슬라이더**: Swiper.js (예정)
- **QR 코드**: qrcode.react (예정)

## 개발 명령어
```bash
npm run dev     # 개발 서버 시작
npm run build   # 프로덕션 빌드
npm run lint    # 린트 검사
```

## 프로젝트 구조
```
src/
  app/          # Next.js App Router 페이지
  lib/
    supabase.ts # Supabase 클라이언트
  components/   # 공통 컴포넌트 (예정)
```

## 데이터베이스 스키마 (Supabase)
| 테이블 | 역할 |
|---|---|
| `memorials` | 추모 페이지 기본 정보 |
| `memorial_media` | 사진/영상 URL |
| `memorial_comments` | 추모 메시지 |
| `memorial_comments_archive` | 삭제된 메시지 보관 (데이터 무결성) |
| `users` | 사용자 정보 |

## 설계 원칙
- **선언적 상태 관리**: 폼 상태는 `FORM_STEPS` 객체 리터럴로 관리
- **데이터 무결성**: 삭제 메시지는 archive 테이블에 보관 (법적 대응)
- **심리적 UI 흐름**: 객관적 정보 → 감성적 기록 순서로 입력 단계 구성
- **49제 테마**: 기일 기준 49일 도래 시 '빛' 테마 UI 적용

## 인증
- 카카오, 네이버, 구글 OAuth
- 실명 기반 시스템

## 주요 기능
1. 추모 페이지 생성 (단계별 폼)
2. 미디어 업로드 (이미지 최대 20장 + 영상)
3. 추모 메시지 작성
4. 부의금 관리 (QR 코드 생성)
5. 49제 D-Day 카운트 및 특수 테마

## 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
