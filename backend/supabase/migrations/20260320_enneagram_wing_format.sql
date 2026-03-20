-- Migration: enneagram_type 형식 변경 ('1' → '1w9')
-- 기존 단일 숫자 형식에서 날개(wing) 포함 형식으로 변경
-- 형식: {메인타입}w{서브타입} (예: 1w9, 2w3, 4w5)

-- 1. 기존 단일 숫자 데이터를 기본 wing으로 마이그레이션 (제약조건보다 먼저 실행)
-- 각 타입의 가장 일반적인 wing을 기본값으로 설정
-- 참고: 실제 wing은 사용자가 프로필 편집에서 수정해야 정확함
UPDATE public.oq_users SET enneagram_type = '1w9' WHERE enneagram_type = '1';
UPDATE public.oq_users SET enneagram_type = '2w1' WHERE enneagram_type = '2';
UPDATE public.oq_users SET enneagram_type = '3w2' WHERE enneagram_type = '3';
UPDATE public.oq_users SET enneagram_type = '4w5' WHERE enneagram_type = '4';
UPDATE public.oq_users SET enneagram_type = '5w4' WHERE enneagram_type = '5';
UPDATE public.oq_users SET enneagram_type = '6w5' WHERE enneagram_type = '6';
UPDATE public.oq_users SET enneagram_type = '7w6' WHERE enneagram_type = '7';
UPDATE public.oq_users SET enneagram_type = '8w7' WHERE enneagram_type = '8';
UPDATE public.oq_users SET enneagram_type = '9w1' WHERE enneagram_type = '9';

-- 2. CHECK 제약 조건 추가: 데이터 변환 완료 후 형식 강제
-- 유효한 조합: 1w9,1w2 / 2w1,2w3 / 3w2,3w4 / 4w3,4w5 / 5w4,5w6 / 6w5,6w7 / 7w6,7w8 / 8w7,8w9 / 9w8,9w1
ALTER TABLE public.oq_users
  ADD CONSTRAINT oq_users_enneagram_type_format
  CHECK (
    enneagram_type IS NULL
    OR enneagram_type ~ '^[1-9]w[1-9]$'
  );

-- 롤백 시:
-- ALTER TABLE public.oq_users DROP CONSTRAINT IF EXISTS oq_users_enneagram_type_format;
-- UPDATE public.oq_users SET enneagram_type = LEFT(enneagram_type, 1) WHERE enneagram_type ~ '^[1-9]w[1-9]$';
