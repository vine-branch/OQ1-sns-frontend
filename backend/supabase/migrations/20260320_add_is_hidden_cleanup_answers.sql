-- Migration: oq_user_qt_answers 테이블 정리 및 신고(is_hidden) 기능 추가

-- 1. 사용하지 않는 컬럼 삭제
-- observation(내용관찰), feeling(느낀점), application(결단과 적용)은 앱에서 사용하지 않음
-- meditation(연구와묵상) 하나로 통합되어 운영 중
ALTER TABLE public.oq_user_qt_answers DROP COLUMN IF EXISTS observation;
ALTER TABLE public.oq_user_qt_answers DROP COLUMN IF EXISTS feeling;
ALTER TABLE public.oq_user_qt_answers DROP COLUMN IF EXISTS application;

-- 2. answer_type 컬럼의 NOT NULL + CHECK 제약 제거
-- 항상 'A'로만 저장되므로 실질적 미사용. 기존 데이터 유지하되 제약만 완화
ALTER TABLE public.oq_user_qt_answers ALTER COLUMN answer_type DROP NOT NULL;
ALTER TABLE public.oq_user_qt_answers DROP CONSTRAINT IF EXISTS oq_user_qt_answers_answer_type_check;

-- 3. is_hidden 컬럼 추가 (신고 기능)
-- NULL: 정상 상태 (기본값, 신규 게시물)
-- TRUE: 신고되어 숨김 처리
ALTER TABLE public.oq_user_qt_answers ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT NULL;

-- 4. is_hidden에 대한 RLS 정책 업데이트
-- 기존 SELECT 정책을 삭제하고 is_hidden 조건을 추가한 새 정책 생성
DROP POLICY IF EXISTS "Users can view public answers or own answers" ON public.oq_user_qt_answers;
CREATE POLICY "Users can view public answers or own answers" ON public.oq_user_qt_answers
    FOR SELECT USING (
        (is_public = true AND (is_hidden IS NULL OR is_hidden = false))
        OR auth.uid() = user_id
    );

-- 5. 기존 UPDATE 정책으로는 타인 게시물 신고가 불가하므로 RPC 함수 사용
-- SECURITY DEFINER로 실행되어 RLS를 우회하고, 내부에서 본인 게시물 신고 방지
DROP POLICY IF EXISTS "Authenticated users can report answers" ON public.oq_user_qt_answers;

CREATE OR REPLACE FUNCTION public.report_answer(answer_id UUID)
RETURNS void AS $$
BEGIN
  -- 본인 게시물은 신고 불가
  IF EXISTS (
    SELECT 1 FROM public.oq_user_qt_answers
    WHERE id = answer_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Cannot report your own post';
  END IF;

  UPDATE public.oq_user_qt_answers
  SET is_hidden = true
  WHERE id = answer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 롤백 시:
-- DROP FUNCTION IF EXISTS public.report_answer(UUID);
-- ALTER TABLE public.oq_user_qt_answers DROP COLUMN IF EXISTS is_hidden;
-- DROP POLICY IF EXISTS "Users can view public answers or own answers" ON public.oq_user_qt_answers;
-- CREATE POLICY "Users can view public answers or own answers" ON public.oq_user_qt_answers
--     FOR SELECT USING (is_public = true OR auth.uid() = user_id);
