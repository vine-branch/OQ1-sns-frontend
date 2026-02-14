# OQ1 백엔드 DB 설계 명세 (최종 v2)

## 개요

본 서비스는 하루 1개의 QT 본문을 중심으로,
사용자가 4단 구조(A~D 유형)의 묵상을 작성하고
피드 형태로 공유하는 공동체형 플랫폼이다.

- 팔로우 기능 없음
- 좋아요 / 댓글 상호작용 존재
- 공개 / 나만보기 기능 존재
- 이미지 업로드 기능 포함
- 하루 한 본문에 대해 유저는 1개만 작성 가능

---

# 1. oq_users

QT 서비스 사용자 정보 테이블

## 컬럼

- id (uuid, PK)
- user_name (text, not null)
- guk_no (int, not null)  
  → 청년부 국 번호 (1~5)
- birth_date (date, nullable)
- leader_name (text, nullable)  
  → 담당 리더 이름 (문자열 저장)
- enneagram_type (text, nullable)
- reg_date (timestamptz, default now())
- update_date (timestamptz, default now())

## 비고

- id는 인증 시스템(auth.uid())과 매핑
- guk_no는 1~5 범위의 정수
- leader_name은 MVP 기준 문자열 저장

---

# 2. oq_daily_qt

하루 한 개의 QT 본문 테이블

## 컬럼

- id (uuid, PK)
- bible_book (text, not null)
- chapter (int, not null)
- verse_from (int, not null)
- verse_to (int, not null)
- content (text, not null)
- qt_date (date, unique, not null)
- created_at (timestamptz, default now())

## 제약조건

- qt_date UNIQUE
  → 하루에 하나의 본문만 존재

---

# 3. oq_user_qt_answers

사용자의 QT 묵상 테이블

QT 유형:

- A형: 느낀점
- B형: 내용관찰 + 느낀점
- C형: 내용관찰 + 느낀점 + 결단과 적용
- D형: 내용관찰 + 연구와묵상 + 느낀점 + 결단과 적용

## 컬럼

- id (uuid, PK)
- daily_qt_id (uuid, FK → oq_daily_qt.id, not null)
- user_id (uuid, FK → oq_users.id, not null)

- answer_type (char(1), not null)  
  → 'A', 'B', 'C', 'D'

- observation (text, nullable)
- meditation (text, nullable)
- feeling (text, nullable)
- application (text, nullable)

- is_public (boolean, not null, default true)  
  → true: 공개  
  → false: 나만보기

- created_at (timestamptz, default now())

## 제약조건

- UNIQUE (daily_qt_id, user_id)
  → 하루 한 본문에 대해 유저는 하나만 작성 가능

## 비고

- answer_type에 따른 필수 필드 검증은
  DB가 아닌 서비스 레이어에서 처리

---

# 4. oq_qt_images

QT 묵상에 첨부되는 이미지 테이블

## 컬럼

- id (uuid, PK)
- answer_id (uuid, FK → oq_user_qt_answers.id, not null)
- image_url (text, not null)
- storage_path (text, not null)
- created_at (timestamptz, default now())

## 설계 원칙

- 한 묵상에 여러 이미지 업로드 가능
- Supabase Storage bucket 사용
- 경로 구조:

  qt-images/{user_id}/{answer_id}/filename.jpg

- 이미지 업로드 시 리사이징 및 압축 필수

---

# 5. oq_qt_likes

묵상 좋아요 테이블

## 컬럼

- user_id (uuid, FK → oq_users.id)
- answer_id (uuid, FK → oq_user_qt_answers.id)

## 제약조건

- PRIMARY KEY (user_id, answer_id)
  → 중복 좋아요 방지

---

# 6. oq_qt_comments

묵상 댓글 테이블

## 컬럼

- id (uuid, PK)
- answer_id (uuid, FK → oq_user_qt_answers.id)
- user_id (uuid, FK → oq_users.id)
- content (text, not null)
- created_at (timestamptz, default now())

---

# 피드 로직

1. 오늘 날짜의 oq_daily_qt 조회
2. 해당 daily_qt_id에 연결된 oq_user_qt_answers 조회
3. is_public = true 필터
4. created_at DESC 정렬
5. 이미지 및 좋아요/댓글 수 조인

---

# RLS 정책 개념

oq_user_qt_answers:

- insert: auth.uid() = user_id
- update/delete: auth.uid() = user_id
- select:
  - is_public = true
  - OR auth.uid() = user_id

oq_qt_images:

- select: 공개글이면 전체, 비공개는 작성자만

oq_qt_likes:

- insert/delete: auth.uid() = user_id

oq_qt_comments:

- insert: auth.uid() = user_id
- delete: 작성자만

---

# 설계 철학

- 하루 본문 중심 공동체 구조
- 4단 고정 QT 모델
- 팔로우 없는 공동체형 피드
- 공개/비공개 분리
- 확장 가능하지만 MVP 단순성 유지
