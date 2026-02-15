-- 1. RLS Policy Update: Allow everyone to read user profiles (needed for feed)
DROP POLICY IF EXISTS "Users can view own profile" ON public.oq_users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.oq_users;

CREATE POLICY "Enable read access for all users" ON public.oq_users
    FOR SELECT USING (true);

-- 2. Schema Update: Add avatar_url and gender columns to oq_users table
ALTER TABLE public.oq_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add gender column safely with CHECK constraint (M/F)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'oq_users' AND column_name = 'gender') THEN
        ALTER TABLE public.oq_users ADD COLUMN gender CHAR(1) CHECK (gender IN ('M', 'F'));
    END IF;
END $$;

-- 3. Data Migration: Populate avatar_url and gender (mapped to M/F) for existing users
UPDATE public.oq_users
SET 
    avatar_url = au.raw_user_meta_data->>'avatar_url',
    gender = CASE 
        WHEN (au.raw_user_meta_data->>'gender') = 'male' THEN 'M'
        WHEN (au.raw_user_meta_data->>'gender') = 'female' THEN 'F'
        ELSE NULL
    END
FROM auth.users au
WHERE public.oq_users.id = au.id;

-- 4. Trigger Update: Ensure new users get mapped gender (M/F) on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.oq_users (
    id,
    user_name,
    guk_no,
    reg_date,
    update_date,
    avatar_url,
    gender
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nickname', 'Unknown'),
    1,
    NOW(),
    NOW(),
    new.raw_user_meta_data->>'avatar_url',
    CASE 
        WHEN (new.raw_user_meta_data->>'gender') = 'male' THEN 'M'
        WHEN (new.raw_user_meta_data->>'gender') = 'female' THEN 'F'
        ELSE NULL
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
