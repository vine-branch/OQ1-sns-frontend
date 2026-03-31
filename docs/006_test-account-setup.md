---
title: 심사용 테스트 계정 설정 가이드
status: draft
---

# 심사용 테스트 계정 설정 가이드

앱스토어 심사를 위한 테스트 계정 생성 및 설정 가이드입니다.

---

## 1. Supabase Email Provider 활성화

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Email** 찾아서 **Enable** 켜기
3. 설정:
   - **Confirm email**: ON (일반 사용자 가입 방지용, 테스트 계정은 Admin API로 우회)
   - **Double confirm email changes**: ON
   - **Secure email change**: ON

> Email provider를 활성화해도 로그인 페이지에 이메일 폼이 노출되지 않습니다. `?test=true` 파라미터가 있을 때만 표시됩니다.

---

## 2. 테스트 계정 생성

### 2.1. Supabase CLI 사용

```bash
# Supabase CLI 로그인
supabase login

# 프로젝트 링크 (아직 안 했다면)
supabase link --project-ref YOUR_PROJECT_REF

# 테스트 계정 생성 (이메일 인증 건너뜀)
supabase auth admin create-user \
  --email review@test.com \
  --password test1234 \
  --email-confirm
```

### 2.2. Supabase Dashboard 사용 (대안)

1. Supabase Dashboard → **Authentication** → **Users**
2. **Add user** → **Create new user**
3. 입력:
   - **Email**: `review@test.com`
   - **Password**: `test1234`
   - **Auto Confirm User**: 체크
4. **Create user**

### 2.3. 생성된 User ID 확인

Dashboard → Authentication → Users에서 `review@test.com`의 **UID**를 복사합니다. 다음 단계에서 필요합니다.

---

## 3. 테스트 계정 프로필 데이터 삽입

Supabase Dashboard → **SQL Editor**에서 실행:

```sql
INSERT INTO public.oq_users (id, user_name, guk_no, birth_date, enneagram_type)
VALUES (
  '위에서_복사한_UID',
  '심사용',
  1,
  '2000-01-01',
  '1w2'
)
ON CONFLICT (id) DO UPDATE SET
  user_name = EXCLUDED.user_name,
  guk_no = EXCLUDED.guk_no,
  birth_date = EXCLUDED.birth_date,
  enneagram_type = EXCLUDED.enneagram_type;
```

> `ON CONFLICT`를 사용하므로 이미 존재하는 경우 업데이트됩니다.

---

## 4. 로그인 테스트

1. 브라우저에서 `앱URL/login?test=true` 접속
2. 하단 "테스트 계정 로그인" 폼 확인
3. 이메일: `review@test.com`, 비밀번호: `test1234` 입력
4. 로그인 → 홈으로 이동 확인

---

## 5. App Store Connect 제출 시 설정

### 5.1. App Review Information

App Store Connect → 앱 선택 → **App Review** 탭:

- **Sign-in required**: Yes
- **User name**: `review@test.com`
- **Password**: `test1234`

### 5.2. Review Notes

다음 내용을 영어로 입력:

```
To test the app, please use the following test account:

1. Navigate to: [앱URL]/login?test=true
2. Scroll down to "테스트 계정 로그인" (Test Account Login) section
3. Enter email: review@test.com
4. Enter password: test1234
5. Tap "로그인" (Login) button

This test account has full access to all app features including:
- Viewing and writing QT devotionals
- Liking and commenting on posts
- Profile editing
- Account deletion (Settings > Edit Profile > Delete Account)
```

---

## 6. Google Play Console 제출 시 설정

Google Play Console → 앱 선택 → **App content** → **App access**:

- **All or some functionality is restricted** 선택
- **Add new instructions** 클릭
- 위와 동일한 안내 입력

---

## 7. 주의사항

- 테스트 계정의 비밀번호는 심사 목적으로만 사용됩니다. 서비스 운영 시 주기적으로 변경하세요.
- 심사 완료 후 계정을 삭제할 필요는 없지만, 비밀번호는 변경을 권장합니다.
- 테스트 계정으로 회원탈퇴 테스트 시 계정이 삭제됩니다. 심사 전 계정 상태를 확인하세요.
- 탈퇴 테스트 후 30일 유예기간 내 재로그인하면 복구됩니다. 완전 삭제된 경우 2번부터 다시 진행하세요.
