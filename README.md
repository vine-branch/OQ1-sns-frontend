# OQ1 (오큐완)

일일 QT(Quiet Time) 묵상을 공유하고 소통하는 소셜 플랫폼입니다.

## 프로젝트 구조

이 프로젝트는 Next.js App Router를 사용합니다.

### 주요 기능

- 📖 **오늘의 말씀**: 매일 새로운 성경 말씀과 묵상 카드
- ✍️ **묵상 공유**: 개인 묵상을 텍스트와 이미지로 공유
- 🤖 **AI 도우미**: Gemini AI를 활용한 묵상 질문 및 기도문 생성
- 👥 **소셜 피드**: Instagram 스타일의 피드로 다른 사용자의 묵상 확인
- 🏆 **게임화 요소**: 레벨, 경험치, 연속 일수, 뱃지 시스템
- 📊 **활동 기록**: GitHub 스타일의 히트맵으로 활동 추적

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI**: Google Gemini API
- **Package Manager**: pnpm

## 시작하기

### 필수 요구사항

- Node.js 20 이상
- pnpm

### 설치 및 실행

1. 의존성 설치:
```bash
pnpm install
```

2. 환경 변수 설정:
`.env.local` 파일에서 `NEXT_PUBLIC_GEMINI_API_KEY`를 실제 Gemini API 키로 변경하세요.

3. 개발 서버 실행:
```bash
pnpm dev
```

4. 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 프로젝트 구조

```
oq1/
├── app/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── DailyWordCard.tsx
│   │   ├── FeedItem.tsx
│   │   ├── Heatmap.tsx
│   │   └── Navigation.tsx
│   ├── services/            # API 서비스
│   │   └── geminiService.ts
│   ├── upload/              # 게시물 작성 페이지
│   │   └── page.tsx
│   ├── mypage/              # 마이페이지
│   │   └── page.tsx
│   ├── constants.ts         # 상수 및 목 데이터
│   ├── types.ts             # TypeScript 타입 정의
│   ├── layout.tsx           # 루트 레이아웃
│   ├── page.tsx             # 홈 페이지
│   └── globals.css          # 전역 스타일
├── public/                  # 정적 파일
├── .env.local               # 환경 변수
└── package.json
```

## 주요 페이지

- **/** - 홈 피드 (오늘의 말씀 + 소셜 피드)
- **/upload** - 새 묵상 게시물 작성
- **/mypage** - 사용자 프로필 및 활동 기록

## 마이그레이션 내역

### 변경사항

1. **라우팅**: React Router → Next.js App Router
2. **빌드 도구**: Vite → Next.js (Turbopack)
3. **환경 변수**: `API_KEY` → `NEXT_PUBLIC_GEMINI_API_KEY`
4. **네비게이션**: `useNavigate` → `useRouter` (next/navigation)
5. **링크**: `Link` (react-router-dom) → `Link` (next/link)

### 유지된 기능

- 모든 UI 컴포넌트 및 스타일
- Gemini AI 통합
- 소셜 피드 기능
- 게임화 요소
- 반응형 디자인 (모바일/데스크톱)

## 개발 노트

- 모든 상호작용 컴포넌트는 `'use client'` 지시어 사용
- Tailwind CSS v4의 `@theme` 규칙 사용
- Instagram 스타일의 UI/UX 디자인
- 한국어 인터페이스

## 라이선스

Private
