# 회원탈퇴 기능 구현 완료

## 구현 개요

인스타그램과 동일한 로직으로 회원탈퇴 기능을 구현했습니다. 즉시 삭제가 아닌 **소프트 삭제(Soft Delete)** 방식으로, 30일의 유예기간을 제공합니다.

## 주요 특징

✅ **2단계 확인 프로세스**
- 경고 페이지: 삭제되는 정보, 유예기간, 즉시 처리 사항 안내
- 확인 페이지: "회원탈퇴" 문구 직접 입력으로 최종 확인

✅ **30일 유예기간**
- 탈퇴 후 30일 이내 로그인 시 계정 복구 가능
- 30일 경과 후 영구 삭제 (정리 작업 필요)

✅ **자동 복구 플로우**
- 탈퇴 후 로그인 시 자동으로 복구 페이지로 이동
- 원클릭 복구 기능

✅ **데이터 보호**
- RLS 정책으로 탈퇴한 사용자 데이터 비공개
- CASCADE 삭제로 관련 데이터 자동 정리

## 생성된 파일

### 프론트엔드 페이지
1. **`/app/mypage/delete/page.tsx`**
   - 회원탈퇴 페이지 (경고 + 확인 단계)
   - 2단계 확인 프로세스
   - "회원탈퇴" 문구 입력 확인

2. **`/app/mypage/delete/complete/page.tsx`**
   - 탈퇴 완료 페이지
   - 30일 이내 복구 가능 안내
   - 홈/로그인 페이지 이동 링크

3. **`/app/mypage/reactivate/page.tsx`**
   - 계정 복구 페이지
   - 탈퇴 후 30일 이내 로그인 시 표시
   - 원클릭 복구 기능

### 수정된 파일
1. **`/app/mypage/edit/page.tsx`**
   - 프로필 편집 페이지 하단에 "회원탈퇴" 링크 추가

2. **`/app/auth/callback/route.ts`**
   - OAuth 콜백에서 `deleted_at` 체크 로직 추가
   - 30일 이내: 복구 페이지로 리다이렉트
   - 30일 경과: 로그아웃 후 에러 메시지 표시

3. **`/app/login/page.tsx`**
   - `account_expired` 에러 처리 추가
   - "탈퇴 후 30일이 경과하여 계정이 영구 삭제되었습니다" 메시지

### 데이터베이스
1. **`/backend/supabase/migrations/001_add_soft_delete.sql`**
   - `deleted_at` 컬럼 추가
   - RLS 정책 업데이트
   - 정리 및 복구 함수 생성
   - 인덱스 생성

### 문서
1. **`/docs/ACCOUNT_DELETION.md`**
   - 전체 기능 설명서
   - 사용자 플로우
   - 마이그레이션 가이드
   - 테스트 시나리오

## 다음 단계

### 1. 데이터베이스 마이그레이션 적용 (필수)

#### Supabase Dashboard 사용
```
1. Supabase Dashboard > SQL Editor 접속
2. backend/supabase/migrations/001_add_soft_delete.sql 파일 내용 복사
3. SQL Editor에 붙여넣기
4. 실행 (Run)
```

#### Supabase CLI 사용 (권장)
```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# 프로젝트 링크
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 적용
supabase db push
```

### 2. 정기 정리 작업 설정 (선택)

30일 경과 계정을 자동으로 삭제하려면 Cron Job 설정이 필요합니다.

#### Supabase pg_cron 사용
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

### 3. 테스트

#### 기본 플로우 테스트
```
1. 로그인
2. 마이페이지 > 프로필 편집 > 회원탈퇴
3. 경고 페이지 확인
4. "회원탈퇴" 입력 후 탈퇴
5. 탈퇴 완료 페이지 확인
6. 다시 로그인
7. 계정 복구 페이지 확인
8. 복구 후 마이페이지 확인
```

#### 30일 경과 테스트
```
1. DB에서 deleted_at을 31일 전으로 수동 설정:
   UPDATE oq_users SET deleted_at = NOW() - INTERVAL '31 days' WHERE id = 'USER_ID';
2. 로그인 시도
3. "탈퇴 후 30일이 경과하여 계정이 영구 삭제되었습니다" 메시지 확인
```

## 빌드 확인

✅ TypeScript 컴파일 성공
✅ Next.js 빌드 성공
✅ 모든 페이지 정상 생성

```
Route (app)
├ ○ /mypage
├ ○ /mypage/delete           ← 새로 추가
├ ○ /mypage/delete/complete  ← 새로 추가
├ ○ /mypage/edit
├ ○ /mypage/reactivate       ← 새로 추가
```

## 사용자 경험 플로우

### 회원탈퇴
```
마이페이지
  ↓
프로필 편집
  ↓
회원탈퇴 링크 (빨간색)
  ↓
경고 페이지
  - 📌 삭제되는 정보 안내
  - ⏰ 30일 유예기간 안내
  - 🔒 즉시 처리 사항 안내
  ↓
확인 페이지
  - "회원탈퇴" 문구 입력
  ↓
탈퇴 완료
  - 로그아웃
  - 30일 이내 복구 가능 안내
```

### 계정 복구
```
탈퇴 후 30일 이내 로그인
  ↓
자동으로 복구 페이지로 이동
  ↓
"계정 복구하기" 버튼 클릭
  ↓
마이페이지로 이동
  - 모든 데이터 복구됨
```

## 보안 및 데이터 보호

1. **RLS 정책**: 탈퇴한 사용자의 데이터는 다른 사용자에게 보이지 않음
2. **인증 확인**: 로그인된 사용자만 탈퇴 가능
3. **2단계 확인**: 실수로 인한 탈퇴 방지
4. **CASCADE 삭제**: 관련 데이터 자동 정리 (큐티 묵상, 좋아요, 댓글 등)

## 참고 문서

- 전체 기능 설명: `/docs/ACCOUNT_DELETION.md`
- 마이그레이션 파일: `/backend/supabase/migrations/001_add_soft_delete.sql`
