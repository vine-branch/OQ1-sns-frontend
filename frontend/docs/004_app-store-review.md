---
title: 앱스토어 심사 체크리스트
status: current
---

# 앱스토어 심사 체크리스트

React Native 웹뷰 앱으로 Apple App Store / Google Play에 배포하기 위한 심사 요구사항 체크리스트입니다.

---

## 필수 해결 항목

### 1. Apple 로그인 추가

- **요구사항**: 소셜 로그인(카카오)을 제공하는 앱은 반드시 Sign in with Apple도 제공해야 함 (App Store Review Guidelines 4.8)
- **현재 상태**: 프론트엔드 구현 완료 (`app/login/page.tsx`)
- **작업 내용**:
  - [x] 로그인 페이지에 Apple 로그인 버튼 추가
  - [ ] Supabase Auth에 Apple provider 설정
  - [ ] Apple Developer Console에서 Sign in with Apple 설정
  - [ ] 회원가입 플로우에서 Apple 로그인 사용자 처리 (auth callback)

### 2. 심사용 테스트 계정

- **요구사항**: App Store Connect 제출 시 "App Review Information"에 테스트 계정 정보 필수 입력
- **현재 상태**: 숨겨진 이메일/비밀번호 로그인 폼 구현 완료
- **방식**: `/login?test=true` 접속 시에만 이메일/비밀번호 입력 폼 노출
  - 일반 사용자에게는 카카오 + Apple 로그인만 표시
  - Supabase Auth email provider 활성화하되 UI는 숨김 → rate limit 문제 없음
- **작업 내용**:
  - [x] `/login` 페이지에 `?test=true` 파라미터 시 이메일/비밀번호 폼 렌더링
  - [ ] Supabase Auth email provider 활성화
  - [x] Supabase Admin API로 심사용 테스트 계정 생성 (이메일 인증 건너뜀)
    ```bash
    supabase auth admin create-user \
      --email review@test.com \
      --password test1234 \
      --email-confirm
    ```
  - [x] `oq_users` 테이블에 테스트 계정 프로필 데이터 삽입
  - [ ] App Store Connect Review Notes에 안내:
    - URL: `앱URL/login?test=true`
    - Email: `review@test.com`
    - Password: `test1234`

### 3. 개인정보 처리방침

- **요구사항**: Apple/Google 모두 앱 내에서 접근 가능한 개인정보 처리방침 링크 필수
- **현재 상태**: 구현 완료
- **작업 내용**:
  - [x] 개인정보 처리방침 페이지 작성 (`/privacy`)
  - [x] 수집하는 개인정보 항목 명시 (이름, 생년월일, 소속국, 카카오/Apple 프로필)
  - [x] 앱 내 접근 가능한 링크 배치 (로그인 페이지 하단)
  - [ ] App Store Connect / Google Play Console에 URL 등록

### 4. 이용약관

- **요구사항**: 서비스 이용약관 제공 및 회원가입 시 동의 절차
- **현재 상태**: 구현 완료
- **작업 내용**:
  - [x] 이용약관 페이지 작성 (`/terms`)
  - [x] 회원가입 페이지에 약관 동의 체크박스 추가 (`app/signup/page.tsx`)
  - [x] Zod 스키마에 `agree_terms` 필드 추가 (동의 필수 검증)

---

## 이미 충족된 항목

### 계정 삭제 기능

- **요구사항**: 앱 내에서 계정 삭제가 가능해야 함 (Apple 필수)
- **현재 상태**: 구현 완료
- **구현 위치**: `app/mypage/delete/page.tsx`, `app/api/user/delete/route.ts`
- **상세**: 2단계 확인 프로세스, 카카오 연결 해제, Supabase 영구 삭제

---

## 권장 사항 (심사 통과에 필수는 아님)

### 딥링크 / 유니버설 링크
- iOS Universal Links, Android App Links 설정
- React Native 웹뷰에서 외부 링크 처리

### 오프라인 처리
- 네트워크 없을 때 적절한 에러 메시지 표시
- 웹뷰 로딩 실패 시 fallback UI

### 다크 모드
- 현재 라이트 모드만 지원 (`manifest.ts`에서 `background_color: "#ffffff"`)
- iOS 시스템 다크 모드와의 조화 고려

---

## 참고

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [Sign in with Apple - Guidelines](https://developer.apple.com/sign-in-with-apple/get-started/)
