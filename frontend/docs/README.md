---
title: 문서 인덱스
status: current
---

# OQ1 Documentation

번호가 클수록 최신 문서입니다.

| # | 문서 | 상태 |
|---|------|------|
| 001 | [카카오 로그인 설정 가이드](001_kakao-login-setup.md) | current |
| 002 | [회원탈퇴 기능](002_account-deletion.md) | current |
| 003 | [보안 정책](003_security.md) | current |
| 004 | [앱스토어 심사 체크리스트](004_app-store-review.md) | current |
| 005 | [Apple 로그인 설정 가이드](005_apple-login-setup.md) | draft |
| 006 | [심사용 테스트 계정 설정 가이드](006_test-account-setup.md) | draft |

## 문서 작성 규칙

- 파일명: `{번호}_{kebab-case-제목}.md` (예: `005_apple-login-setup.md`)
- 번호는 이전 문서 + 1 (마이그레이션처럼 순차 증가)
- frontmatter: `title`, `status` (current / draft / deprecated) 만 사용
- 나머지 이력 관리는 git이 담당
