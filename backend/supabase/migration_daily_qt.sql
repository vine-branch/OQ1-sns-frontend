-- 로그인 안 한 사람(anon)도 말씀 본문을 볼 수 있게 허용
DROP POLICY IF EXISTS "Authenticated users can view daily qt" ON public.oq_daily_qt;
CREATE POLICY "Anyone can view daily qt" ON public.oq_daily_qt 
FOR SELECT USING (true);