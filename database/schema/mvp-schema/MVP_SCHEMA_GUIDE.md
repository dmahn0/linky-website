supabase# 🚀 Linky Platform MVP 스키마 가이드

## 📋 개요
- **버전**: 1.0.0 (MVP)
- **테이블 수**: 11개 (기존 30개 → 11개)
- **설계 원칙**: 핵심 기능만, 확장 가능한 구조

## 🎯 MVP 범위

### ✅ 포함된 기능
1. **사용자 관리**
   - 비즈니스/파트너/관리자 구분
   - 기본 인증 및 프로필
   - 간단한 상태 관리

2. **공간 관리**
   - 기본 공간 정보
   - 청소 주기 설정

3. **작업 매칭**
   - 작업 생성/배정/완료
   - 파트너 지원 시스템
   - 상태 변경 추적

4. **리뷰 시스템**
   - 5점 평점
   - 텍스트 리뷰

5. **알림**
   - 작업 관련 알림
   - 읽음 표시

6. **정산**
   - 작업별 간단한 정산
   - 플랫폼 수수료

### ❌ 제외된 기능 (추후 확장)
- PostGIS (위치 기반 서비스)
- 복잡한 결제 시스템
- 상세 분석/통계
- API 로깅
- 복잡한 수수료 정책
- 프로모션/쿠폰
- 메시징 시스템

## 📊 테이블 구조 요약

```
사용자 (3개)
├── business_users - 비즈니스 운영자
├── partner_users - 서비스 제공자
└── admin_users - 관리자

핵심 (4개)
├── spaces - 공간 정보
├── jobs - 작업 매칭
├── job_applications - 파트너 지원
└── job_status_history - 상태 추적

부가 (4개)
├── reviews - 평가
├── notifications - 알림
├── settlements - 정산
└── 함수/트리거 - 자동화
```

## 🔑 핵심 설계 포인트

### 1. **메타데이터 필드**
모든 주요 테이블에 `metadata JSONB` 필드 추가
- 향후 필드 추가 시 스키마 변경 없이 확장 가능
- 예: `metadata: {"preferredContactTime": "morning"}`

### 2. **상태 관리**
STRING 타입 사용 (ENUM 대신)
- 새로운 상태 추가 용이
- 애플리케이션 레벨에서 검증

### 3. **간소화된 관계**
- 필수 관계만 외래키 설정
- 복잡한 다대다 관계 최소화

### 4. **기본 RLS**
- 각 사용자는 자신의 데이터만 접근
- 관리자는 모든 데이터 접근

## 🚦 실행 순서

```bash
# 1. Supabase SQL Editor에서 실행
sql/mvp-schema/00-mvp-schema.sql

# 2. 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

## 📈 확장 가이드

### Phase 1 → Phase 2 (3개월 후)
```sql
-- 위치 기반 서비스 추가
CREATE EXTENSION postgis;
ALTER TABLE spaces ADD COLUMN location GEOGRAPHY(POINT, 4326);
ALTER TABLE partner_users ADD COLUMN location GEOGRAPHY(POINT, 4326);
```

### Phase 2 → Phase 3 (6개월 후)
```sql
-- 상세 통계 테이블 추가
CREATE TABLE daily_statistics (...);
CREATE TABLE partner_performance (...);
```

## ⚡ 성능 고려사항

### 현재 최적화
- 필수 인덱스만 생성
- 작업 조회용 복합 인덱스
- 읽지 않은 알림 부분 인덱스

### 향후 최적화
- 파티셔닝 (월별 작업 데이터)
- Materialized View (통계)
- 읽기 전용 레플리카

## 🔧 개발 팁

### 1. 작업 생성
```javascript
// 간단한 작업 생성
const { data, error } = await supabase
  .from('jobs')
  .insert({
    business_id: businessId,
    space_id: spaceId,
    title: '일일 청소',
    scheduled_date: '2025-01-25',
    scheduled_time: '09:00',
    base_price: 50000
  });
```

### 2. 메타데이터 활용
```javascript
// 확장 데이터 저장
const { data, error } = await supabase
  .from('jobs')
  .update({
    metadata: {
      specialTools: ['진공청소기', '스팀청소기'],
      accessCode: '1234'
    }
  })
  .eq('id', jobId);
```

## ✅ 체크리스트

- [ ] 기존 데이터 백업
- [ ] MVP 스키마 실행
- [ ] RLS 정책 검증
- [ ] API 연동 테스트
- [ ] 초기 데이터 시딩

## 🎯 MVP 목표

**3개월 내 출시**를 목표로:
1. 핵심 기능 완성도 높이기
2. 실제 사용자 피드백 수집
3. 데이터 기반 확장 방향 결정

---

이 MVP 스키마는 **빠른 출시**와 **안정적인 확장**을 모두 고려했습니다.