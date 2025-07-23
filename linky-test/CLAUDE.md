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

5. 데이터베이스 구조 (2025-01-22 업데이트)
  - Supabase 마이그레이션 완료
  - 배민 방식으로 사용자 테이블 분리
    - business_users: 비즈니스 사용자 전용 테이블
    - partner_users: 파트너 사용자 전용 테이블
    - notification_settings: 공통 알림 설정
  - 새로운 인증 시스템 구현
    - AuthManager: 공통 인증 로직
    - BusinessAuth: 비즈니스 사용자 인증
    - PartnerAuth: 파트너 사용자 인증
  - RLS 정책 및 유틸리티 함수 생성 완료

6. 파일 구조 및 문서 가이드
  📚 주요 문서 위치:
  - linky-test/linky-website/SYSTEM_ARCHITECTURE.md: 전체 시스템 아키텍처 문서
  - linky-test/linky-website/FILE_STRUCTURE_GUIDE.md: 모든 파일의 위치와 목적 설명
  - linky-test/linky-website/IMPLEMENTATION_STEPS.md: 10일간 구현 계획
  - linky-test/linky-website/DATABASE_MIGRATION_PLAN.md: DB 마이그레이션 상세 계획

  🔥 핵심 JS 파일들:
  - supabase-config.js: Supabase 클라이언트 설정
  - js/auth/auth-manager.js: 공통 인증 기반 클래스
  - js/auth/business-auth.js: 비즈니스 전용 인증
  - js/auth/partner-auth.js: 파트너 전용 인증
  - js/api/business-api.js: 비즈니스 전용 API (프로필, 공간, 작업 관리)
  - js/api/partner-api.js: 파트너 전용 API (작업 수락, 수익, 평점 관리)
  - js/components/business-signup-modal.js: 비즈니스 회원가입/로그인 모달
  - js/components/partner-signup-modal.js: 파트너 회원가입/로그인 모달

  🎯 주요 대시보드:
  - business/dashboard.html: 비즈니스 대시보드 (공간 관리, 작업 요청, 통계)
  - partners/dashboard.html: 파트너 대시보드 (작업 수락, 수익 관리, 평점)

  ⚠️ 사용하지 않는 파일들 (혼란 방지):
  - DATABASE_SCHEMA.md: Firebase 구 스키마 (참고용)
  - DATA_SCHEMA_ANALYSIS.txt: 초기 분석 완료 (참고용)
  - check-supabase-schema.html: 초기 테스트 도구