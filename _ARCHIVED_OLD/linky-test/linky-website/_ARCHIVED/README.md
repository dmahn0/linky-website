# 📦 ARCHIVED - 이전 버전 파일들

이 폴더에는 Firebase에서 Supabase로 마이그레이션하면서 더 이상 사용하지 않는 파일들이 보관되어 있습니다.

## 보관된 파일들

### 1. Firebase 스키마 문서
- `DATABASE_SCHEMA.md` - Firebase 시절의 데이터베이스 스키마 (사용 안 함)
  - users, spaces, jobs 등의 Firebase 컬렉션 구조
  - 현재 Supabase 구조와 다름

### 2. 초기 분석 파일
- `DATA_SCHEMA_ANALYSIS.txt` - 초기 스키마 분석 (참고용)
  - Firebase → Supabase 마이그레이션 중 발견한 불일치
  - 현재는 새로운 구조로 재설계됨

## ⚠️ 주의사항

이 폴더의 파일들은 참고용으로만 보관됩니다. 
**현재 프로젝트에서는 사용하지 마세요!**

## 현재 사용 중인 파일

최신 마이그레이션 계획은 다음 파일들을 참조하세요:
- `/DATABASE_MIGRATION_PLAN.md` - 새로운 테이블 구조 (business_users, partner_users)
- `/IMPLEMENTATION_STEPS.md` - 구현 계획
- `/backup-database.html` - 백업 도구