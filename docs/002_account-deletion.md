---
title: 회원탈퇴 기능
status: current
---

# 회원탈퇴 기능 (Soft Delete)

인스타그램과 동일한 로직으로 구현된 회원탈퇴 기능입니다. 즉시 삭제가 아닌 **소프트 삭제(Soft Delete)** 방식으로, 30일의 유예기간을 제공합니다.

## 주요 특징

### 1. 소프트 삭제 (Soft Delete)
- 회원탈퇴 시 계정이 즉시 삭제되지 않고 `deleted_at` 필드에 탈퇴 시각이 기록됩니다
- 30일 이내에는 계정 복구가 가능합니다
- 30일이 지나면 영구 삭제됩니다 (수동 또는 자동 정리 작업 필요)

### 2. 2단계 확인 프로세스
1. **경고 단계**: 탈퇴 시 삭제되는 정보와 유예기간 안내
2. **확인 단계**: "회원탈퇴" 문구를 직접 입력하여 최종 확인

### 3. 계정 복구 기능
- 탈퇴 후 30일 이내 로그인 시 자동으로 복구 페이지로 이동
- 원클릭으로 계정 복구 가능
- 모든 데이터(프로필, 큐티 묵상, 활동 기록) 유지

## 사용자 플로우

### 회원탈퇴 플로우
```
마이페이지 > 프로필 편집 > 회원탈퇴 링크 클릭
  ↓
경고 페이지 (/mypage/delete)
  - 삭제되는 정보 안내
  - 30일 유예기간 안내
  - 즉시 처리되는 사항 안내
  ↓
확인 페이지 (동일 페이지, step 변경)
  - "회원탈퇴" 문구 입력 요구
  - 최종 확인
  ↓
탈퇴 완료 페이지 (/mypage/delete/complete)
  - 탈퇴 완료 안내
  - 30일 이내 복구 가능 안내
  - 로그아웃 처리
```

### 계정 복구 플로우
```
탈퇴 후 30일 이내 로그인 시도
  ↓
Auth Callback에서 deleted_at 확인
  ↓
계정 복구 페이지로 리다이렉트 (/mypage/reactivate)
  - 복구 안내
  - 복구 버튼 클릭
  ↓
deleted_at을 NULL로 설정
  ↓
마이페이지로 이동
```

### 30일 경과 후 로그인 시도
```
탈퇴 후 30일 경과 후 로그인 시도
  ↓
Auth Callback에서 deleted_at 확인
  ↓
로그아웃 처리
  ↓
로그인 페이지로 리다이렉트 (error=account_expired)
  - "탈퇴 후 30일이 경과하여 계정이 영구 삭제되었습니다" 메시지 표시
```

## 데이터베이스 변경사항

### 1. 스키마 변경 (Migration)
```sql
-- deleted_at 컬럼 추가
ALTER TABLE public.oq_users
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 인덱스 생성
CREATE INDEX idx_oq_users_deleted_at ON public.oq_users(deleted_at);
```

### 2. RLS 정책 업데이트
```sql
-- 활성 계정만 조회 가능하도록 정책 수정
CREATE POLICY "Users can view own active profile" ON public.oq_users
    FOR SELECT USING (
        auth.uid() = id 
        AND (deleted_at IS NULL OR deleted_at > NOW() - INTERVAL '30 days')
    );
```

### 3. 헬퍼 함수
```sql
-- 30일 경과 계정 영구 삭제 함수
CREATE OR REPLACE FUNCTION public.cleanup_deleted_accounts()
RETURNS void AS $$
BEGIN
    DELETE FROM auth.users
    WHERE id IN (
        SELECT id FROM public.oq_users
        WHERE deleted_at IS NOT NULL
        AND deleted_at < NOW() - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 계정 복구 함수
CREATE OR REPLACE FUNCTION public.reactivate_account(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.oq_users
    SET deleted_at = NULL
    WHERE id = user_id
    AND deleted_at IS NOT NULL
    AND deleted_at > NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 구현 파일

### 프론트엔드
- `/app/mypage/delete/page.tsx` - 회원탈퇴 페이지 (경고 + 확인)
- `/app/mypage/delete/complete/page.tsx` - 탈퇴 완료 페이지
- `/app/mypage/reactivate/page.tsx` - 계정 복구 페이지
- `/app/mypage/edit/page.tsx` - 프로필 편집 페이지 (회원탈퇴 링크 추가)
- `/app/login/page.tsx` - 로그인 페이지 (account_expired 에러 처리)
- `/app/auth/callback/route.ts` - OAuth 콜백 (deleted_at 체크 로직)

### 백엔드
- `/backend/supabase/migrations/001_add_soft_delete.sql` - 데이터베이스 마이그레이션

## 마이그레이션 적용 방법

### Supabase Dashboard 사용
1. Supabase Dashboard > SQL Editor 접속
2. `backend/supabase/migrations/001_add_soft_delete.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. 실행 (Run)

### Supabase CLI 사용 (권장)
```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 적용
supabase db push
```

## 정기 정리 작업 (Cron Job)

30일이 경과한 탈퇴 계정을 자동으로 삭제하려면 정기 작업이 필요합니다.

### Supabase Cron 설정
```sql
-- pg_cron extension 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 매일 새벽 3시에 정리 작업 실행
SELECT cron.schedule(
    'cleanup-deleted-accounts',
    '0 3 * * *',
    $$SELECT public.cleanup_deleted_accounts()$$
);
```

## 보안 고려사항

1. **RLS 정책**: 탈퇴한 사용자의 데이터는 다른 사용자에게 보이지 않도록 RLS 정책이 적용됨
2. **인증 확인**: 회원탈퇴는 로그인된 사용자만 가능
3. **최종 확인**: "회원탈퇴" 문구 입력으로 실수 방지
4. **CASCADE 삭제**: auth.users 삭제 시 oq_users 및 관련 데이터 자동 삭제 (FK 제약조건)

## 테스트 시나리오

### 1. 정상 탈퇴 및 복구
1. 로그인 후 마이페이지 > 프로필 편집 > 회원탈퇴
2. 경고 페이지에서 "탈퇴 진행하기" 클릭
3. "회원탈퇴" 입력 후 "탈퇴하기" 클릭
4. 탈퇴 완료 페이지 확인
5. 다시 로그인 시도
6. 계정 복구 페이지로 리다이렉트 확인
7. "계정 복구하기" 클릭
8. 마이페이지로 이동 확인

### 2. 30일 경과 후 로그인
1. DB에서 deleted_at을 31일 전으로 수동 설정
2. 로그인 시도
3. "탈퇴 후 30일이 경과하여 계정이 영구 삭제되었습니다" 메시지 확인

### 3. 탈퇴 취소
1. 탈퇴 페이지 진입
2. "취소" 또는 "이전으로" 버튼 클릭
3. 프로필 편집 페이지로 돌아가는지 확인

## 참고 자료

- [Instagram Account Deletion Flow](https://help.instagram.com/370452623149242)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Soft Delete Pattern](https://en.wikipedia.org/wiki/Soft_deletion)
