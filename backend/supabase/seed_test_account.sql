-- 앱스토어 심사용 테스트 계정 시드 데이터
-- 용도: /login?test=true 에서 이메일/비밀번호 로그인으로 심사원이 앱을 테스트
-- 실행: Supabase Dashboard SQL Editor 또는 MCP execute_sql로 실행
-- 참고: docs/006_test-account-setup.md

-- 사전 조건: Supabase Dashboard에서 Email provider 활성화 필요
-- (Authentication → Providers → Email → Enable)

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- 기존 테스트 계정이 있으면 스킵
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'review@test.com') THEN
    RAISE NOTICE 'Test account already exists, skipping creation.';
    RETURN;
  END IF;

  -- 1. auth.users에 사용자 추가 (이메일 인증 완료 상태)
  --    GoTrue가 NULL을 문자열로 변환하지 못하므로 모든 text 컬럼에 빈 문자열 설정
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, confirmation_token, recovery_token, email_change_token_new,
    email_change, email_change_token_current, email_change_confirm_status,
    phone, phone_change, phone_change_token, reauthentication_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'review@test.com',
    crypt('test1234', gen_salt('bf')),
    now(), now(), now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{}'::jsonb,
    false, '', '', '',
    '', '', 0,
    '', '', '', ''
  );

  -- 2. auth.identities에 email identity 추가
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    created_at, updated_at, last_sign_in_at
  ) VALUES (
    new_user_id,
    new_user_id,
    'review@test.com',
    jsonb_build_object(
      'sub', new_user_id::text,
      'email', 'review@test.com',
      'email_verified', true,
      'phone_verified', false
    ),
    'email',
    now(), now(), now()
  );

  -- 3. oq_users 프로필 업데이트
  --    (handle_new_user 트리거가 기본값으로 이미 생성하므로 ON CONFLICT로 덮어쓰기)
  INSERT INTO public.oq_users (id, user_name, guk_no, birth_date, enneagram_type)
  VALUES (new_user_id, '심사용', 1, '2000-01-01', '1w2')
  ON CONFLICT (id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    guk_no = EXCLUDED.guk_no,
    birth_date = EXCLUDED.birth_date,
    enneagram_type = EXCLUDED.enneagram_type;

  RAISE NOTICE 'Created test account (ID: %) - review@test.com / test1234', new_user_id;
END $$;
