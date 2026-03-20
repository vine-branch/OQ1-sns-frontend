-- leader_name 컬럼 삭제
-- 리더 이름 필드를 더 이상 사용하지 않으므로 oq_users 테이블에서 제거
ALTER TABLE public.oq_users DROP COLUMN IF EXISTS leader_name;
