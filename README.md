# OQ1 (오큐완)

일일 QT(Quiet Time) 묵상을 공유하고 소통하는 소셜 플랫폼입니다.

## 프로젝트 개요

이 프로젝트는 Vite로 작성된 기존 `daily-qt-mate`를 Next.js 15+ App Router 환경으로 마이그레이션하고, 성능 최적화 및 보안 강화를 거친 고도화된 버전입니다.

## 주요 기능

- 📖 **오늘의 말씀**: Supabase 연동을 통한 매일의 성경 본문 제공 및 캐싱
- ✍️ **묵상 공유**: 개인 묵상을 텍스트(Markdown 지원)로 기록하고 피드에 공유
- 🤖 **AI 인사이트**: Vercel AI SDK(Gemini 2.5 Flash) 기반 성경 묵상 질문 및 인사이트 자동 생성
- 👥 **소셜 인터랙션**: Instagram 스타일 피드, 실시간 '아멘(좋아요)', 댓글 기능 및 반응형 모달
- 🏆 **게임화 시스템**: KST 기준 스트릭(연속일수), 누적 묵상 기반 레벨, 뱃지 컬렉션 모달
- 📈 **활동 대시보드**: 캘린더 히트맵을 통한 월간 활동 직관적 확인

## 기술 스택

- **Frontend**: Next.js 15/16 (App Router), TypeScript, Tailwind CSS v4
- **Backend/Storage**: Supabase (Database, Auth)
- **AI**: Vercel AI SDK, `@ai-sdk/google` (Gemini 2.5 Flash)
- **Auth**: Supabase Auth (Kakao OAuth 연동)
- **Components**: Framer Motion (애니메이션), Lucide React (아이콘)
- **Package Manager**: pnpm

## 시작하기

### 필수 요구사항

- Node.js 20+
- pnpm

### 설치 및 환경 변수 설정

1. 의존성 설치:

```bash
pnpm install
```

2. `.env.local` 설정:
   프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요.

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Kakao OAuth
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_api_key

# AI 서비스 (Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

3. 서버 실행:

```bash
pnpm dev
```

## 프로젝트 구조

```
oq1/
├── app/                  # Next.js App Router
│   ├── components/       # 도메인 특정 컴포넌트 (FeedItem, DailyWordCard 등)
│   ├── services/         # 서버 측 로직 (aiService.ts 등)
│   ├── (auth)/           # 인증 관련 페이지 (login, signup, auth)
│   ├── mypage/           # 프로필 및 활동 관리
│   ├── upload/           # 묵상 작성 및 AI 가이더
│   ├── constants.ts      # 목 데이터 및 정적 설정
│   └── types.ts          # 전역 타입 정의
├── components/           # 공통 UI 컴포넌트
│   └── ui/               # Shadcn UI (button, responsive-modal 등)
├── lib/                  # 유틸리티 및 클라이언트 설정
│   ├── utils.ts          # Feature Flag (isFeatureEnabled) 및 유틸 함수
│   └── supabase/         # Supabase 클라이언트 세팅
├── public/               # 정적 파일
└── package.json
```

## 최근 업데이트 (고도화 내역)

### 1. 보안 및 아키텍처 (Security & Arch)

- **Server Actions 전환**: AI 및 DB 연동을 서버 사이드로 격리하여 API 키 노출 전면 차단
- **Vercel AI SDK 마이그레이션**: 기존 SDK를 대체하여 안정성 및 확장성 확보
- **캐싱 최적화**: `unstable_cache`를 적용하여 AI 토큰 사용량 절감 및 응답 속도 최적화

### 2. UI/UX 및 기능 (Product)

- **피처 플래그 기반 제어**: `photoUpload`, `tags` 등 미구현 기능을 중앙에서 관리
- **게이미피케이션 정교화**: KST 시간대 보정 스트릭 계산 logic 및 뱃지 획득 조건 자동화
- **실시간 반응 대시보드**: 내 게시물에 달린 최근 '아멘'과 댓글을 프로필에서 즉시 확인 가능
- **가독성 개선**: AI 성경 통찰에 줄바꿈 유지 및 피드 카드 디자인 가독성 향상

## 라이선스

Private
