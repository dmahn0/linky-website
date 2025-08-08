# 🗄️ Linky Platform SQL 마이그레이션 가이드

## 📋 개요
이 디렉토리에는 Linky Platform의 데이터베이스 구조를 완성하기 위한 SQL 파일들이 포함되어 있습니다.

## 🚨 중요 발견사항
데이터 엔지니어링 분석 결과, **jobs 테이블이 없어서** 전체 플랫폼의 핵심 기능이 작동하지 않았습니다. 이제 필요한 모든 테이블과 함수를 추가했습니다.

## 📁 파일 구조 및 실행 순서

### 기존 파일 (이미 실행됨)
1. `01-create-users-tables.sql` - 사용자 테이블 생성 ✅
2. `02-create-service-tables.sql` - 서비스 테이블 생성 ✅
3. `03-create-rls-policies.sql` - RLS 정책 설정 ✅
4. `04-utility-functions.sql` - 유틸리티 함수 ✅

### 신규 파일 (실행 필요) ⚠️
5. `05-create-jobs-table.sql` - **작업 테이블 생성** (핵심!)
   - jobs 테이블 및 관련 테이블
   - 작업 히스토리, 작업 신청 테이블
   - RLS 정책 및 트리거

6. `06-create-ratings-table.sql` - **평점 시스템**
   - ratings 테이블
   - 평균 평점 뷰
   - 자동 업데이트 트리거

7. `07-optimize-indexes.sql` - **성능 최적화**
   - 누락된 인덱스 추가
   - 텍스트 검색 인덱스
   - 부분 인덱스

8. `08-transaction-functions.sql` - **비즈니스 로직**
   - 작업 생성 트랜잭션
   - 작업 매칭 함수
   - 작업 완료/취소 처리

## 🚀 실행 방법

### Supabase Dashboard에서 실행
1. Supabase Dashboard > SQL Editor 접속
2. 각 파일을 순서대로 복사하여 실행
3. 각 실행 후 성공 메시지 확인

### 명령어로 실행 (선택사항)
```bash
# psql을 사용한 실행
psql -h [SUPABASE_HOST] -U postgres -d postgres -f 05-create-jobs-table.sql
psql -h [SUPABASE_HOST] -U postgres -d postgres -f 06-create-ratings-table.sql
psql -h [SUPABASE_HOST] -U postgres -d postgres -f 07-optimize-indexes.sql
psql -h [SUPABASE_HOST] -U postgres -d postgres -f 08-transaction-functions.sql
```

## ✅ 실행 후 확인사항

### 1. 테이블 생성 확인
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('jobs', 'ratings', 'job_status_history', 'job_applications');
```

### 2. 인덱스 확인
```sql
SELECT * FROM index_usage_stats;
```

### 3. 함수 확인
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%job%';
```

## 🔧 주요 기능 활성화

### 작업 생성 예시
```javascript
// business-api.js에서 사용
const { data, error } = await supabase
  .rpc('create_job_with_notification', {
    p_business_id: userId,
    p_space_id: spaceId,
    p_title: '일일 청소',
    p_description: '매장 전체 청소',
    p_scheduled_date: '2025-01-25',
    p_scheduled_time: '09:00:00',
    p_estimated_duration: 120,
    p_base_price: 50000
  });
```

### 작업 매칭 예시
```javascript
// partner-api.js에서 사용
const { data, error } = await supabase
  .rpc('assign_job_to_partner', {
    p_job_id: jobId,
    p_partner_id: partnerId
  });
```

## 📊 모니터링

### 성능 모니터링
```sql
-- 느린 쿼리 확인
SELECT * FROM pg_stat_statements 
WHERE mean_time > 1000 
ORDER BY mean_time DESC;

-- 인덱스 사용률
SELECT * FROM index_usage_stats 
WHERE index_scans = 0;
```

## ⚠️ 주의사항
1. 프로덕션 환경에서는 백업 후 실행
2. 각 SQL 파일은 순서대로 실행해야 함
3. RLS 정책이 적용되므로 관리자 계정으로 실행

## 🎯 다음 단계
1. SQL 파일 실행 ✅
2. API 코드 업데이트 (business-api.js, partner-api.js)
3. 프론트엔드 테스트
4. 실제 데이터로 테스트

---
작성일: 2025-08-06
작성자: Claude Code (Data Engineer)