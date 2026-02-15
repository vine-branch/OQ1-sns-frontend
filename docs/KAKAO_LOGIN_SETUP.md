# 카카오 로그인 설정 가이드

Supabase Auth + Kakao OAuth로 로그인하려면 아래 순서대로 설정하면 됩니다.

---

## 1. Supabase 프로젝트 준비

1. [Supabase Dashboard](https://supabase.com/dashboard)에서 프로젝트 생성 또는 기존 프로젝트 선택
2. **Project Settings → API**에서 아래 값 확인 후 메모
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **anon public** 키 (Project API keys)
3. **SQL Editor**에서 `backend/supabase/schema.sql` 전체 실행  
   → 테이블·RLS·트리거·스토리지 설정 적용

---

## 2. Supabase Auth URL 설정

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Redirect URLs**에 다음을 추가 (한 줄에 하나씩)
   - 로컬: `http://localhost:3000/auth/callback`
   - 프로덕션: `https://실제도메인/auth/callback`
3. **Site URL**은 로컬 개발 시 `http://localhost:3000` 등으로 설정해도 됨

---

## 3. 카카오 개발자 앱 설정

1. [Kakao Developers](https://developers.kakao.com) 로그인 후 **내 애플리케이션** 이동
2. **애플리케이션 추가하기**로 새 앱 생성 (이미 있으면 해당 앱 선택)
3. **앱 키** 메뉴에서 확인
   - **REST API 키** → 이걸 Supabase Kakao Provider의 **Client ID**에 넣음
4. **카카오 로그인** 메뉴 (제품 설정 → 카카오 로그인)
   - **[일반]** 탭에서 **활성화 설정**을 **활성화(ON)** 로 변경 후 저장  
     → 이걸 안 하면 로그인 시 **KOE004**("카카오 로그인을 사용하도록 설정하지 않은 서비스입니다") 에러 발생
   - **Redirect URI** 등록:
     - Supabase가 제공하는 콜백 URL을 넣어야 함  
       형식: `https://<프로젝트-ref>.supabase.co/auth/v1/callback`
     - Supabase Dashboard → **Authentication** → **Providers** → **Kakao** 열면 상단에 **Callback URL (for OAuth)** 이 나옴 → 그 주소를 그대로 복사해서 카카오 **Redirect URI**에 등록
5. **동의 항목** (안 하면 **KOE205** 발생)  
   **카카오 디벨로퍼스** → [카카오 로그인] → **[동의항목]** 탭에서 아래 세 항목을 **사용 안 함**이 아니게 설정한 뒤 **저장**.
   - 카카오 화면: **필수 동의** / **선택 동의** / **이용 중 동의** / **사용 안 함** 중 하나로 설정 가능.
   - **profile_nickname** — **필수 동의** 또는 **선택 동의**로 설정 (사용 안 함이면 KOE205).
   - **profile_image** — **필수 동의** 또는 **선택 동의**로 설정.
   - **account_email** — **우리 앱에서는 필수 아님.** 다만 **Supabase가 기본으로 이 스코프를 요청**해서, 카카오 앱에서 이걸 쓸 수 있어야 KOE205가 안 난다.  
     카카오에서 **account_email**이 **권한 없음**이면: **비즈 앱**으로 전환한 뒤 동의항목(이메일) 추가 기능을 쓰면 됨.  
     - **비즈 앱 전환은 무료.** 사업자등록번호 없이도 가능: **카카오 디벨로퍼스** → [앱] → [일반] → [비즈니스 정보] → **[개인 개발자 비즈 앱]** 선택. 조건은 **카카오비즈니스 통합 서비스 약관** 동의 + **계정 설정**에서 앱 오너 **본인인증** 완료. (사업자 등록 아님, 비용 없음.)  
     - 비즈 앱 전환 후 [앱] → [추가 기능 신청]에서 개인정보 동의항목(이메일) 심사 신청 → 승인되면 동의항목에 account_email 추가 가능.
   → **사용 안 함**으로 두면 해당 항목을 요청할 수 없어서 에러가 난다. profile_nickname, profile_image는 **필수 동의** 또는 **선택 동의**로 넣으면 됨.
6. **Client Secret 발급 (필수)** — 아래 6.1~6.4 참고

### 6.1. 왜 필수인가?

카카오디벨로퍼스는 **REST API 키**에 대해 클라이언트 시크릿을 **기본 활성화**하는 정책입니다.  
토큰 발급·갱신 요청 시 `client_secret` 파라미터를 포함해야 하며, 없거나 잘못된 경우 `KOE010` 에러가 발생합니다.  
Supabase Auth가 카카오 토큰을 받을 때 이 값을 사용하므로 **반드시 발급 후 Supabase에 등록**해야 합니다.

- 참고: [카카오 앱 설정 > REST API 키 > 클라이언트 시크릿](https://developers.kakao.com/docs/latest/ko/app-setting/app#client-secret)

### 6.2. 발급 위치

- **경로 1 (플랫폼 키에서)**  
  **내 애플리케이션** → 사용할 앱 선택 → **앱** → **플랫폼 키** → **REST API 키**  
  해당 REST API 키 행의 **키 설정**(또는 톱니바퀴) 클릭 → **클라이언트 시크릿** 영역으로 이동.

- **경로 2 (카카오 로그인에서)**  
  **제품 설정** → **카카오 로그인** → **보안** 탭 → **클라이언트 시크릿** 영역.

(화면 개편 시 메뉴 이름이 **앱** > **플랫폼 키** 또는 **제품 설정** > **카카오 로그인** 등으로 표기될 수 있습니다.)

### 6.3. 발급 절차 (최신 기준)

1. 위 6.2에서 **클라이언트 시크릿** 설정 화면으로 이동한다.
2. **활성화**를 **ON**으로 두고 **저장**한다.  
   (이미 ON이면 그대로 둔다.)
3. **코드 생성** 버튼을 누른 뒤 다시 **저장**한다.  
   - "클라이언트 시크릿 기능을 적용할 제품"이 **카카오 로그인**인 경우, 카카오 로그인 관련 설정 화면에서 **코드 생성**을 눌러야 할 수 있다.  
   - 생성 후 **코드** 값이 한 번만 표시되므로, **즉시 복사**해 안전한 곳에 보관한다.
4. 발급된 **코드** 값을 Supabase **Authentication** → **Providers** → **Kakao** → **Kakao Client Secret** 란에 붙여넣고 저장한다.

### 6.4. 주의 사항

- **코드는 한 번만 표시**되며, 재발급 전에는 다시 볼 수 없다. 복사 후 분실하지 않도록 한다.
- **코드 재발급**을 하면 **이전 코드는 즉시 무효**가 된다.  
  운영 중인 서비스에서 재발급할 경우, 새 코드를 Supabase에 먼저 반영한 뒤 카카오에서 재발급하는 순서를 권장한다.
- 클라이언트 시크릿은 **서버/백엔드에서만** 사용한다.  
  Supabase가 서버에서 카카오 토큰을 교환할 때 쓰므로, 프론트엔드나 공개 저장소에 넣지 않는다.

---

## 4. 카카오 개발자 앱에서 뭘 등록해야 하나?

| 항목 | 등록 여부 | 설명 |
|------|-----------|------|
| **카카오 로그인 리다이렉트 URI** | ✅ **필수** | 카카오 로그인을 사용할 때 필요한 OAuth 리다이렉트 URI를 등록합니다. Supabase **Callback URL (for OAuth)** 값을 그대로 등록 (예: `https://<프로젝트-ref>.supabase.co/auth/v1/callback`) |
| **비즈니스 인증 리다이렉트 URI** | ❌ 불필요 | 비즈니스 인증을 사용할 때 필요한 OAuth 리다이렉트 URI. **카카오 로그인만** 쓰면 등록하지 않아도 됨 |
| **호출 허용 IP 주소** | ❌ 기본 불필요 | API 호출을 특정 IP로 제한할 때만 사용. 카카오 로그인만 쓰는 일반적인 경우엔 등록하지 않아도 됨 |
| **OpenID Connect 활성화** | ❌ 불필요 | Supabase **OAuth 인가 코드 방식**(`signInWithOAuth`)에는 **필요 없음**. 카카오 JS SDK로 ID 토큰 받아 `signInWithIdToken` 할 때만 켜면 됨. 안 켜도 됨 |

정리하면, **카카오 로그인 리다이렉트 URI만** Supabase 콜백 URL로 등록하면 됩니다. OpenID Connect는 켜지 않아도 됩니다.

---

## 5. Supabase에서 Kakao Provider 설정

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Kakao** 찾아서 **Enable** 켜기
3. 입력
   - **Kakao Client ID**: 카카오 앱의 **REST API 키**
   - **Kakao Client Secret**: 카카오에서 발급한 **Client Secret** (필수)
4. 저장

---

## 6. 로컬 환경 변수 (.env.local)

프로젝트 루트에 `.env.local` 파일이 있어야 합니다.

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase **Project URL**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase **anon public** 키

저장 후 **개발 서버 재시작** (`pnpm dev` 다시 실행).

---

## 7. 동작 순서 확인

1. 사용자가 **카카오로 로그인** 클릭
2. 앱이 `signInWithOAuth({ provider: 'kakao', redirectTo: '.../auth/callback' })` 호출
3. Supabase가 **카카오 로그인 페이지**로 리다이렉트
4. 사용자가 카카오에서 로그인/동의
5. 카카오가 **Supabase 콜백** (`https://xxx.supabase.co/auth/v1/callback`) 으로 리다이렉트
6. Supabase가 세션 생성 후 **우리 앱** `redirectTo` 주소(`/auth/callback`)로 리다이렉트
7. 우리 앱 `/auth/callback`에서 `exchangeCodeForSession` 후, 프로필 유무에 따라 `/` 또는 `/signup?from=kakao`로 이동

---

## 8. 보안 (RLS) 확인

모든 테이블에 **Row Level Security (RLS)**가 적용되어 있습니다.  
사용자는 자신의 데이터만 수정/삭제할 수 있고, `oq_user_qt_answers` 테이블의 **is_public** 필드에 따라 묵상 내용의 공개 여부가 결정됩니다.

### 적용 여부 확인 방법

1. **Supabase Dashboard** → **Database** → **Policies** 이동  
   - 왼쪽에서 테이블별로 정책 목록이 보입니다.  
   - `oq_users`, `oq_daily_qt`, `oq_user_qt_answers`, `oq_qt_images`, `oq_qt_likes`, `oq_qt_comments` 각각에 정책이 있어야 합니다.

2. **테이블 단위 확인**  
   - **Database** → **Tables** → 테이블 선택 후, 상단 또는 설정에서 **RLS enabled** 표시가 있는지 확인합니다.

3. **스키마 적용 여부**  
   - `backend/supabase/schema.sql`을 실행했다면 위 RLS·정책이 함께 생성됩니다.  
   - 한 번도 실행하지 않았다면 **1. Supabase 프로젝트 준비**의 3번처럼 SQL Editor에서 `schema.sql` 전체를 실행하면 됩니다.

---

## 9. 안 될 때 체크리스트

| 확인 항목 | 설명 |
|-----------|------|
| **KOE004 (앱 관리자 설정 오류)** | **카카오 로그인 미활성화**일 때 발생. **카카오 디벨로퍼스** 내 애플리케이션 → [카카오 로그인] → **[일반]** 탭에서 **활성화 설정**을 **활성화**로 바꾼 뒤 **저장** |
| **KOE205 (잘못된 요청)** | **동의 항목 미설정**일 때. **profile_nickname**, **profile_image** 는 [동의항목]에서 필수/선택 동의로 설정. **account_email**이 **권한 없음**이면 [앱] → [일반] → [비즈니스 정보]에서 **개인 개발자 비즈 앱** 전환(무료, 본인인증만) 후 [추가 기능 신청]에서 이메일 동의항목 심사 신청 |
| **Redirect URL 불일치** | 카카오에 등록한 Redirect URI가 **Supabase 콜백 URL**과 완전히 일치하는지 (Supabase Provider 화면에 나온 값 그대로 사용) |
| **우리 앱 URL** | Supabase **Redirect URLs**에 `http://localhost:3000/auth/callback` 등이 들어가 있는지 |
| **env 누락** | `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 있는지, 값이 맞는지 |
| **서버 재시작** | `.env.local` 수정 후 `pnpm dev` 재시작 여부 |
| **Kakao 앱 상태** | 카카오 개발자 앱이 **개발 중**이면 테스트 계정만 로그인 가능. 배포 시 **활성화** 필요 |
| **스키마 적용** | `backend/supabase/schema.sql` 실행으로 `oq_users`·트리거가 생성되었는지 (콜백 후 회원가입/로그인 흐름에 필요) |
| **RLS 적용** | Supabase **Database** → **Policies**에서 위 6개 테이블에 정책이 있는지 확인. 본인 데이터만 수정/삭제 가능, `oq_user_qt_answers`는 `is_public`으로 공개 여부 제어. 자세한 내용은 **8. 보안 (RLS) 확인** 참고 |

---

## 10. 참고 링크

- [Supabase Auth - OAuth with Kakao](https://supabase.com/docs/guides/auth/social-login/auth-kakao)
- [카카오 로그인 REST API](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)
- 프로젝트 backend: `backend/README.md`, `backend/docs/OQ1_Auth_Architecture_Spec_v1.md`
