# 📁 코드 품질 검사 스크립트

이 폴더는 Linky Platform의 코드 품질을 자동으로 검사하는 스크립트를 포함합니다.

## 🎯 목적
- **하드코딩 방지**: API URL, 키값 등의 하드코딩 검출
- **중복 제거**: 동일한 코드 패턴 발견 및 컴포넌트화 제안
- **품질 보장**: 커밋 전 자동 검사로 코드 품질 유지

## 📋 스크립트 목록

### 1. `check-hardcoding.js` - 하드코딩 검사
코드에서 하드코딩된 값을 찾아 경고합니다.

**검사 항목:**
- API URL (http://, https://)
- API 키 (sk_, pk_, api_key_)
- Supabase 키 (eyJ...)
- 색상 코드 (#22c55e 제외)
- 포트 번호
- 하드코딩된 경로

**사용법:**
```bash
# 전체 프로젝트 검사
node scripts/check-hardcoding.js

# 특정 경로 검사
node scripts/check-hardcoding.js linky-test/linky-website/js

# 특정 파일 검사
node scripts/check-hardcoding.js linky-test/linky-website/js/api/business-api.js
```

**결과 해석:**
- ❌ **에러**: 반드시 수정 필요 (API 키, URL 등)
- ⚠️ **경고**: 검토 후 수정 권장 (색상, 포트 등)
- ℹ️ **정보**: 개선 가능한 사항

### 2. `check-duplicates.js` - 중복 코드 검사
유사한 코드 패턴을 찾아 컴포넌트화를 제안합니다.

**검사 항목:**
- 10줄 이상의 유사한 함수
- 반복되는 HTML 템플릿
- 동일한 로직 패턴

**사용법:**
```bash
# 전체 프로젝트 검사
node scripts/check-duplicates.js

# 특정 경로 검사
node scripts/check-duplicates.js linky-test/linky-website
```

**결과 예시:**
```
1. 중복 코드 (25줄)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 위치:
  - business/dashboard.html:150-175
  - partners/dashboard.html:200-225

💡 제안:
  타입: JavaScript Function
  컴포넌트명: DashboardStatsUtility
  위치: /js/utils/
```

### 3. `pre-commit-check.js` - 커밋 전 통합 검사
Git 커밋 전에 모든 검사를 자동으로 실행합니다.

**검사 항목:**
1. 하드코딩 검사
2. 중복 코드 검사
3. TODO 주석 개수
4. 파일 크기 (200KB 초과)
5. config 파일 사용 여부

**사용법:**
```bash
# 수동 실행
node scripts/pre-commit-check.js

# Git hook으로 자동 실행 설정
# .git/hooks/pre-commit 파일 생성:
#!/bin/sh
node scripts/pre-commit-check.js
```

**강제 커밋 (검사 무시):**
```bash
git commit --no-verify -m "긴급 수정"
```

## 🔧 설정

### Git Hook 자동 설정
```bash
# pre-commit hook 설치
echo '#!/bin/sh\nnode scripts/pre-commit-check.js' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### VS Code 설정
`.vscode/tasks.json`:
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Check Code Quality",
      "type": "shell",
      "command": "node scripts/pre-commit-check.js",
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "problemMatcher": []
    }
  ]
}
```

단축키: `Ctrl+Shift+B` → "Check Code Quality"

## 📊 검사 통계

### 심각도 레벨
1. **에러** 🔴 - 커밋 차단, 반드시 수정
2. **경고** 🟡 - 검토 필요, 수정 권장
3. **정보** 🔵 - 개선 제안, 선택적

### 제외 경로
- `node_modules/`
- `.git/`
- `dist/`, `build/`
- `scripts/` (자기 자신)
- `docs/`
- `templates/`
- `config/` (설정 파일)

## 💡 문제 해결

### 하드코딩 에러 해결
```javascript
// ❌ 잘못된 코드
const API_URL = 'https://api.linky.com';

// ✅ 올바른 코드
import { API_URL } from '/config/api.config.js';
```

### 중복 코드 해결
1. `/templates/new-component.js` 복사
2. 중복 코드를 컴포넌트로 추출
3. 원본 위치에서 컴포넌트 import
4. `/docs/COMPONENT_CATALOG.md`에 문서화

### TODO 주석 해결
```javascript
// TODO: API 연동 필요 - [홍길동] [2025-01-23]
// → GitHub Issue로 등록하거나 즉시 구현
```

## 🚀 CI/CD 연동

### GitHub Actions 예시
```yaml
name: Code Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: node scripts/check-hardcoding.js
      - run: node scripts/check-duplicates.js
```

---

**기억하세요**: 이 스크립트들은 더 나은 코드를 작성하도록 도와주는 도구입니다!