# 프로젝트 히스토리

## 2025-01-23
### UI 컴포넌트 시스템 재구축
- **linky-ui-components.html 정리**:
  - 3059줄의 하드코딩된 HTML을 모듈화
  - CSS를 `/css/ui-components.css`로 분리
  - UI_CONFIG 기반 CSS 변수 시스템 구축
- **새로운 UI 컴포넌트 생성**:
  - `/js/components/ui/Button.js`: 버튼 컴포넌트
  - `/js/components/ui/Card.js`: 카드 컴포넌트
  - `/js/components/ui/Modal.js`: 모달 컴포넌트
  - `/js/components/ui/Form.js`: 폼 컴포넌트들
  - `/js/components/ui/index.js`: 통합 export
- **CSS 변수 시스템**:
  - `/js/utils/css-variables.js`: UI_CONFIG → CSS 변수 변환
  - 모든 색상값 하드코딩 제거
- **UI_CONFIG 업데이트**:
  - 모던 에메랄드 그린 색상 팔레트 적용
  - 슬레이트 기반 뉴트럴 톤 적용
- **데모 페이지**: `demo-ui-components.html` 생성

### 코드 품질 관리 시스템 구축
- **CLAUDE.md 재구성**: 
  - 빠른 참조(30초 체크) 버전으로 간소화
  - 상세 버전은 `CLAUDE-DETAILED.md`로 분리
- **컴포넌트 검토 프로세스**: 새 컴포넌트 생성 전 필수 검토 시스템
- **코드 템플릿 생성**: 새 페이지, 컴포넌트, API 모듈 템플릿 (`/templates/`)
- **검증 스크립트 개발**:
  - `check-hardcoding.js`: 하드코딩 검사 (디자인 요소 강화)
  - `check-duplicates.js`: 중복 코드 검사  
  - `pre-commit-check.js`: 커밋 전 통합 검사 (컴포넌트 검토 포함)
- **중앙 설정 파일 생성** (`/config/`):
  - `app.config.js`: 애플리케이션 전체 설정
  - `api.config.js`: API 엔드포인트 및 설정
  - `ui.config.js`: UI/디자인 시스템 값
  - `constants.js`: 애플리케이션 상수
  - `docs-guide.json`: 상황별 문서 가이드 정의
- **스타일 관리 시스템**: 
  - `StyleManager` 유틸리티로 컴포넌트 기반 스타일링 강제
  - 하드코딩된 디자인 요소 완전 차단
- **컴포넌트 카탈로그 문서화** (`/docs/COMPONENT_CATALOG.md`):
  - 35개 핵심 컴포넌트 문서화
  - 사용 예시 및 가이드라인 포함

## 2025-01-22
### 데이터베이스 스키마 대규모 리팩토링
- 사용자 테이블 분리 (business_users, partner_users)
- 인증 시스템 재구축
- 닉네임 기능 추가 및 중복 방지 구현

### 파트너 정산 페이지 수정
- 정산 관련 오류 수정
- UI 개선