# OQ1 인증 설계 명세 (Kakao Only + Supabase Auth)

## 개요

- 인증은 Supabase Auth 사용
- OAuth Provider는 Kakao만 허용
- 자체 회원가입/비밀번호 로그인 없음
- oq_users는 인증 테이블이 아닌 프로필 확장 테이블

---

# 1. 인증 구조

## 인증 원천

- Supabase auth.users 테이블 사용
- OAuth provider: Kakao Only

## 정책

- Kakao 로그인만 허용
- 다른 provider는 비활성화
- Email/Password 로그인 사용하지 않음

---

# 2. oq_users 설계 원칙

oq_users는 인증 테이블이 아니라
사용자 프로필 확장 테이블이다.

## 컬럼

- id (uuid, PK)
  → auth.users.id 와 동일
- user_name (text, not null)
- guk_no (int, not null)
- birth_date (date, nullable)
- leader_name (text, nullable)
- enneagram_type (text, nullable)
- reg_date (timestamptz, default now())
- update_date (timestamptz, default now())

## 금지 사항

- password 컬럼 생성 금지
- email 직접 저장 금지
- provider 정보 중복 저장 금지

---

# 3. 사용자 생성 흐름

1. 사용자가 Kakao 로그인
2. Supabase가 auth.users에 사용자 생성
3. AFTER INSERT 트리거로 oq_users 자동 생성

---

# 4. 자동 프로필 생성 트리거

## Function

create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.oq_users (
    id,
    user_name,
    reg_date,
    update_date
  )
  values (
    new.id,
    new.raw_user_meta_data->>'nickname',
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

## Trigger

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

---

# 5. RLS 기본 정책

oq_users:

- select: auth.uid() = id
- update: auth.uid() = id
- insert: 트리거로만 생성

oq_user_qt_answers:

- insert: auth.uid() = user_id
- update/delete: auth.uid() = user_id
- select:
  - is_public = true
  - OR auth.uid() = user_id

oq_qt_likes / oq_qt_comments:

- insert/delete: auth.uid() = user_id

---

# 6. 설계 철학

- 인증은 Supabase에 위임
- 프로필은 oq_users에서 관리
- Kakao Only 정책으로 단순화
- 중복 인증 데이터 저장 금지
- 보안 우선 구조 유지
