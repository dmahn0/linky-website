1. 코드가 너무 길어지면 모듈화를 해.

2. 배경 및 색상 체계
  흰색 배경
  텍스트: 다양한 그레이 톤 (#1a1a1a, #333, #555, #666)
  브랜드 컬러: 링키그린(#22c55e) 유지
  강조색: 링키그린 하나로 통일

3. 타이포그래피
  Pretendard 폰트 적용 (한글/영문 최적화)
  링키 로고는 기존 폰트 유지 (logo-text 클래스)
  가독성 향상을 위한 폰트 크기와 간격 조정


4. 시각적 요소
  박스: 옅은 배경색 (#f8fffe, #f5f9ff, #fafafa)
  테두리: 부드러운 색상 (#e6f7f1, #e6f0ff)
  호버 효과: 미묘한 그림자와 움직임
  테이블: 깔끔한 흰색 배경과 얇은 테두리

5. 데이터베이스 마이그레이션 계획 (2025-01-22)
  현재 구조: 단일 users 테이블 (비즈니스/파트너 혼재)
  문제점: valid_business_data, valid_partner_data 제약조건 충돌
  
  새로운 구조 (배민 방식):
  - business_users 테이블: 비즈니스 전용 (business_name, business_number 등)
  - partner_users 테이블: 파트너 전용 (residence, work_areas 등)
  - 완전 분리된 가입/로그인 프로세스
  
  마이그레이션 단계:
  1. 데이터 백업 (backup-database.html 사용)
  2. 새 테이블 생성 (business_users, partner_users)
  3. 기존 데이터 이전
  4. 인증 로직 분리 (business-auth.js, partner-auth.js)
  5. UI 완전 분리
  
  관련 파일:
  - DATABASE_MIGRATION_PLAN.md: SQL 스크립트
  - IMPLEMENTATION_STEPS.md: 10일 구현 계획
  - backup-database.html: 백업 도구