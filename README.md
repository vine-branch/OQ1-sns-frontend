# 오큐완 (OQ1)

**오늘 큐티 완료** — 매일 QT를 나누고 사람을 연결하는 플랫폼

## 소개

오큐완(OQ1)은 매일 Quiet Time(QT)을 나누고, 같은 QT를 한 사람들을 연결하는 서비스입니다. 오늘의 큐티를 완료하고 다른 이들과 나눌 수 있는 공간을 제공합니다.

## 기술 스택

- **Next.js** 16
- **React** 19
- **TypeScript**
- **Tailwind CSS** 4

## 사전 요구사항

- [Node.js](https://nodejs.org/) (권장: LTS)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)

## 설치 및 실행

### 1. 저장소 클론 후 의존성 설치

```bash
pnpm install
```

### 2. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

### 3. 프로덕션 빌드 및 실행

```bash
pnpm build
pnpm start
```

빌드 후 `pnpm start`로 프로덕션 서버를 띄웁니다.

## 스크립트 요약

| 명령어       | 설명                        |
| ------------ | --------------------------- |
| `pnpm dev`   | 개발 서버 실행 (Hot Reload) |
| `pnpm build` | 프로덕션 빌드               |
| `pnpm start` | 빌드된 앱 실행              |
| `pnpm lint`  | ESLint 실행                 |

## 프로젝트 구조

```
oq1/
├── app/           # Next.js App Router 페이지 및 레이아웃
├── public/        # 정적 파일
└── ...            # 설정 파일
```
