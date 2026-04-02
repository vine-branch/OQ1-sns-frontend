---
title: Apple 로그인 설정 가이드
status: draft
---

# Apple 로그인 설정 가이드

Supabase Auth + Apple OAuth로 Sign in with Apple을 설정하는 가이드입니다.

---

## 1. Apple Developer Console 설정

### 1.1. App ID 생성/수정

1. [Apple Developer](https://developer.apple.com/account) → **Certificates, Identifiers & Profiles**
2. **Identifiers** → 기존 App ID 선택 또는 새로 생성
3. **Capabilities** 탭에서 **Sign in with Apple** 체크 후 저장

### 1.2. Service ID 생성

Sign in with Apple은 웹 기반 OAuth이므로 **Service ID**가 필요합니다.

1. **Identifiers** → 좌측 상단 드롭다운에서 **Services IDs** 선택
2. **+** 버튼 → **Services IDs** 선택 → Continue
3. 입력:
   - **Description**: `OQ1 Web Login` (표시 이름)
   - **Identifier**: `com.oq1.web` (역도메인 형식, 앱 Bundle ID와 달라야 함)
4. **Sign in with Apple** 체크 → **Configure** 클릭
5. Configure 화면:
   - **Primary App ID**: 위에서 만든 App ID 선택
   - **Domains**: `<프로젝트-ref>.supabase.co`
   - **Return URLs**: `https://<프로젝트-ref>.supabase.co/auth/v1/callback`
6. Save → Continue → Register

### 1.3. Key 생성

1. **Keys** → **+** 버튼
2. **Key Name**: `OQ1 Sign in with Apple`
3. **Sign in with Apple** 체크 → **Configure** → 위에서 만든 App ID 선택
4. Continue → Register
5. **Key ID** 메모 (예: `ABC123DEFG`)
6. **Download** 클릭 → `.p8` 파일 저장 (한 번만 다운로드 가능)

### 1.4. 필요한 값 정리

| 항목 | 예시 | 용도 |
|------|------|------|
| **Team ID** | `ABCD1234EF` | Apple Developer 계정 우측 상단에 표시 |
| **Service ID** | `com.oq1.web` | 1.2에서 생성한 Identifier |
| **Key ID** | `ABC123DEFG` | 1.3에서 생성한 Key의 ID |
| **Private Key (.p8)** | 파일 내용 전체 | 1.3에서 다운로드한 파일 |

---

## 2. Supabase에서 Apple Provider 설정

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Apple** 찾아서 **Enable** 켜기
3. 입력:
   - **Apple Client ID**: Service ID (예: `com.oq1.web`)
   - **Apple Secret Key**: 아래 형식으로 생성한 JWT 또는 `.p8` 파일 내용
   - **Apple Team ID**: Team ID
   - **Apple Key ID**: Key ID
4. 저장

### 2.1. Secret Key 입력 방식

Supabase는 `.p8` 파일의 내용을 직접 붙여넣는 방식을 지원합니다.

```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEH...
-----END PRIVATE KEY-----
```

`.p8` 파일을 텍스트 에디터로 열어 전체 내용을 복사해서 **Apple Secret Key** 란에 붙여넣습니다.

---

## 3. Supabase Redirect URL 확인

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Redirect URLs**에 다음이 포함되어 있는지 확인:
   - `http://localhost:3000/auth/callback`
   - `https://실제도메인/auth/callback`

이미 카카오 설정 시 추가했다면 별도 작업 불필요.

---

## 4. 프론트엔드 (이미 구현됨)

`app/login/page.tsx`에 Apple 로그인 버튼이 이미 추가되어 있습니다.

```typescript
handleOAuthLogin("apple")
// → supabase.auth.signInWithOAuth({ provider: "apple" })
```

---

## 5. Auth Callback 확인

`app/auth/callback/route.ts`에서 OAuth 콜백 처리가 provider에 무관하게 동작하므로 별도 수정 불필요. Apple 로그인 사용자도 카카오와 동일하게:

1. `exchangeCodeForSession()` → 세션 생성
2. `oq_users` 프로필 확인 → `birth_date` 없으면 `/signup` 리다이렉트
3. 프로필 완성 후 `/` 리다이렉트

---

## 6. 안 될 때 체크리스트

| 확인 항목 | 설명 |
|-----------|------|
| **Service ID 불일치** | Supabase Apple Client ID가 Service ID (예: `com.oq1.web`)와 일치하는지 |
| **Return URL 불일치** | Apple Service ID Configure에 등록한 Return URL이 Supabase 콜백 URL과 일치하는지 |
| **도메인 미등록** | Apple Service ID Configure에 Supabase 도메인이 등록되어 있는지 |
| **Key 만료/분실** | `.p8` 파일은 한 번만 다운로드 가능. 분실 시 Key를 새로 생성해야 함 |
| **Team ID 오류** | Apple Developer 계정 우측 상단의 Team ID와 Supabase 설정값 일치 확인 |

---

## 7. 참고 링크

- [Supabase Auth - Sign in with Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple)
- [Apple Developer - Sign in with Apple](https://developer.apple.com/sign-in-with-apple/)
- [Apple Developer - Configure Sign in with Apple for the web](https://developer.apple.com/help/account/configure-app-capabilities/configure-sign-in-with-apple-for-the-web/)
