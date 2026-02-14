-- OQ1 Backend Database Schema (Supabase)
-- Based on OQ1_Auth_Architecture_Spec_v1 & OQ1_DB_Architecture_Spec_v1

-- 1. Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables

-- 2.1. oq_users (Profile table, extends auth.users)
CREATE TABLE public.oq_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    guk_no INT NOT NULL CHECK (guk_no BETWEEN 1 AND 5), -- 청년부 국 번호 (1~5)
    birth_date DATE,
    leader_name TEXT, -- 담당 리더 이름 (MVP 기준 문자열)
    enneagram_type TEXT,
    reg_date TIMESTAMPTZ DEFAULT NOW(),
    update_date TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2. oq_daily_qt (Daily QT content)
CREATE TABLE public.oq_daily_qt (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bible_book TEXT NOT NULL,
    chapter INT NOT NULL,
    verse_from INT NOT NULL,
    verse_to INT NOT NULL,
    content TEXT NOT NULL,
    qt_date DATE NOT NULL UNIQUE, -- 하루에 하나의 본문만 존재
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3. oq_user_qt_answers (User's QT meditation)
CREATE TABLE public.oq_user_qt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_qt_id UUID NOT NULL REFERENCES public.oq_daily_qt(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.oq_users(id) ON DELETE CASCADE,
    answer_type CHAR(1) NOT NULL CHECK (answer_type IN ('A', 'B', 'C', 'D')),
    observation TEXT, -- 내용관찰
    meditation TEXT, -- 연구와묵상
    feeling TEXT, -- 느낀점
    application TEXT, -- 결단과 적용
    is_public BOOLEAN NOT NULL DEFAULT TRUE, -- 공개 여부
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT oq_user_qt_answers_unique_daily_user UNIQUE (daily_qt_id, user_id) -- 하루 한 본문에 유저는 하나만 작성 가능
);

-- 2.4. oq_qt_images (Images attached to QT answers)
CREATE TABLE public.oq_qt_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID NOT NULL REFERENCES public.oq_user_qt_answers(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5. oq_qt_likes (Likes on QT answers)
CREATE TABLE public.oq_qt_likes (
    user_id UUID REFERENCES public.oq_users(id) ON DELETE CASCADE,
    answer_id UUID REFERENCES public.oq_user_qt_answers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, answer_id) -- 중복 좋아요 방지
);

-- 2.6. oq_qt_comments (Comments on QT answers)
CREATE TABLE public.oq_qt_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID REFERENCES public.oq_user_qt_answers(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.oq_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 3. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.oq_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_daily_qt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_user_qt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_qt_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_qt_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oq_qt_comments ENABLE ROW LEVEL SECURITY;

-- 3.1. oq_users RLS
-- Select: 본인 정보만 조회 (프로필 조회 정책에 따라 변경 가능, 여기서는 본인만)
CREATE POLICY "Users can view own profile" ON public.oq_users
    FOR SELECT USING (auth.uid() = id);

-- Update: 본인 정보만 수정
CREATE POLICY "Users can update own profile" ON public.oq_users
    FOR UPDATE USING (auth.uid() = id);

-- Insert: 트리거로만 생성되므로 직접 Insert 불가 (정책 없음 = Default Deny)

-- 3.2. oq_daily_qt RLS
-- Select: 누구나 조회 가능 (인증된 사용자)
CREATE POLICY "Authenticated users can view daily qt" ON public.oq_daily_qt
    FOR SELECT TO authenticated USING (true);

-- Admin only Insert/Update/Delete (Need define admin check logic or manually insert via dashboard)
-- For now, we assume only service role or dashboard usage for admin actions.

-- 3.3. oq_user_qt_answers RLS
-- Select: 공개글(is_public=true) 또는 본인 글
CREATE POLICY "Users can view public answers or own answers" ON public.oq_user_qt_answers
    FOR SELECT USING (
        is_public = true OR auth.uid() = user_id
    );

-- Insert: 본인 글만 작성 가능
CREATE POLICY "Users can insert own answers" ON public.oq_user_qt_answers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update: 본인 글만 수정 가능
CREATE POLICY "Users can update own answers" ON public.oq_user_qt_answers
    FOR UPDATE USING (auth.uid() = user_id);

-- Delete: 본인 글만 삭제 가능
CREATE POLICY "Users can delete own answers" ON public.oq_user_qt_answers
    FOR DELETE USING (auth.uid() = user_id);

-- 3.4. oq_qt_images RLS
-- Select: 연결된 answer가 공개이거나 본인 것인 경우 (복잡하므로 간소화: 일단 누구나 조회 가능하게 하거나, signed url 사용 권장)
-- 여기서는 일단 authenticated 유저 조회 허용
CREATE POLICY "Authenticated users can view images" ON public.oq_qt_images
    FOR SELECT TO authenticated USING (true);

-- Insert: 연결된 answer의 작성자가 본인이어야 함 (어플리케이션 레벨 검증 보조)
-- 이미지가 먼저 업로드되고 answer가 생길 수도 있으므로 유연하게, 일단은 본인의 answer와 연결되는지는 트리거/함수로 검증하거나 앱 로직 위임.
-- 간단하게: 
CREATE POLICY "Users can insert images" ON public.oq_qt_images
    FOR INSERT WITH CHECK (true); -- 상세 제어는 Storage RLS에서 담당

-- 3.5. oq_qt_likes RLS
-- Select: 누구나 조회
CREATE POLICY "Anyone can view likes" ON public.oq_qt_likes
    FOR SELECT USING (true);

-- Insert: 본인만 좋아요 가능
CREATE POLICY "Users can like" ON public.oq_qt_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delete: 본인만 취소 가능
CREATE POLICY "Users can unlike" ON public.oq_qt_likes
    FOR DELETE USING (auth.uid() = user_id);

-- 3.6. oq_qt_comments RLS
-- Select: 누구나 조회
CREATE POLICY "Anyone can view comments" ON public.oq_qt_comments
    FOR SELECT USING (true);

-- Insert: 본인만 댓글 작성
CREATE POLICY "Users can comment" ON public.oq_qt_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Delete: 본인만 삭제
CREATE POLICY "Users can delete own comments" ON public.oq_qt_comments
    FOR DELETE USING (auth.uid() = user_id);


-- 4. Triggers & Functions

-- 4.1. Automatic Profile Creation on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.oq_users (
    id,
    user_name,
    guk_no,
    reg_date,
    update_date
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nickname', 'Unknown'), -- Kakao nickname
    1, -- Default Guk No (Need update logic later)
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.2. Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_oq_users_modtime
    BEFORE UPDATE ON public.oq_users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- 5. Storage Bucket Setup
-- Note: 'storage' schema access requires appropriate privileges.
-- This part might need to be run separately or via Supabase Dashboard if the SQL editor user lacks permissions.

-- Create a new bucket 'qt-images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('qt-images', 'qt-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow authenticated users to upload files to their own folder: qt-images/{user_id}/{answer_id}/filename.jpg
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'qt-images' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to the bucket
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'qt-images');

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'qt-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
