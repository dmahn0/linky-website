#!/usr/bin/env node

/**
 * Linky Platform Documentation Helper
 * 개발자를 위한 대화형 가이드 도구
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

// 가이드 데이터
const guides = {
  'search': {
    title: '컴포넌트 검색',
    description: '기존 컴포넌트를 검색합니다',
    action: searchComponent
  },
  'new-page': {
    title: '새 페이지 생성 가이드',
    description: '새로운 페이지를 만들 때 필요한 단계를 안내합니다',
    action: newPageGuide
  },
  'api-integration': {
    title: 'API 통합 가이드',
    description: 'Supabase API 통합 방법을 안내합니다',
    action: apiIntegrationGuide
  },
  'ui-component': {
    title: 'UI 컴포넌트 가이드',
    description: 'UI 컴포넌트 생성 및 사용 방법을 안내합니다',
    action: uiComponentGuide
  },
  'form-development': {
    title: '폼 개발 가이드',
    description: '폼 개발 시 필요한 단계를 안내합니다',
    action: formDevelopmentGuide
  },
  'database-work': {
    title: '데이터베이스 작업 가이드',
    description: 'Supabase 데이터베이스 작업을 안내합니다',
    action: databaseGuide
  },
  'pwa-feature': {
    title: 'PWA 기능 가이드',
    description: 'PWA 기능 구현을 안내합니다',
    action: pwaGuide
  },
  'code-quality': {
    title: '코드 품질 체크',
    description: '코드 품질 검사를 실행합니다',
    action: codeQualityCheck
  },
  'debugging': {
    title: '디버깅 가이드',
    description: '일반적인 문제 해결 방법을 안내합니다',
    action: debuggingGuide
  },
  'supabase-setup': {
    title: 'Supabase 설정 가이드',
    description: 'Supabase 초기 설정을 안내합니다',
    action: supabaseSetupGuide
  }
};

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showMainMenu();
  } else {
    const guideName = args[0];
    if (guides[guideName]) {
      await guides[guideName].action();
    } else {
      console.log(`${colors.red}❌ 알 수 없는 가이드: ${guideName}${colors.reset}`);
      showAvailableGuides();
    }
  }
}

// 메인 메뉴 표시
function showMainMenu() {
  console.clear();
  console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════╗
║     Linky Platform 개발 도우미 🚀           ║
╚══════════════════════════════════════════════╝
${colors.reset}`);
  
  console.log(`${colors.yellow}어떤 도움이 필요하신가요?${colors.reset}\n`);
  
  Object.entries(guides).forEach(([key, guide], index) => {
    console.log(`  ${colors.green}${index + 1}.${colors.reset} ${guide.title}`);
    console.log(`     ${colors.blue}→${colors.reset} ${guide.description}`);
  });
  
  console.log(`\n${colors.yellow}선택 (번호 또는 이름):${colors.reset} `);
  
  rl.question('', (answer) => {
    const index = parseInt(answer) - 1;
    const guideKeys = Object.keys(guides);
    
    if (index >= 0 && index < guideKeys.length) {
      guides[guideKeys[index]].action();
    } else if (guides[answer]) {
      guides[answer].action();
    } else {
      console.log(`${colors.red}❌ 잘못된 선택입니다.${colors.reset}`);
      setTimeout(showMainMenu, 1500);
    }
  });
}

// 컴포넌트 검색
function searchComponent() {
  console.log(`\n${colors.cyan}🔍 컴포넌트 검색${colors.reset}`);
  
  rl.question('검색할 컴포넌트 이름: ', (query) => {
    // 컴포넌트 파일들 검색
    const componentsPath = path.join(__dirname, '..', 'js', 'components', 'ui');
    const sharedComponentsPath = path.join(__dirname, '..', 'src', 'shared', 'components');
    
    console.log(`\n${colors.yellow}검색 결과:${colors.reset}`);
    
    // js/components/ui 검색
    if (fs.existsSync(componentsPath)) {
      const files = fs.readdirSync(componentsPath);
      files.forEach(file => {
        if (file.toLowerCase().includes(query.toLowerCase())) {
          console.log(`  ${colors.green}✓${colors.reset} /js/components/ui/${file}`);
        }
      });
    }
    
    // shared/components 검색
    if (fs.existsSync(sharedComponentsPath)) {
      const files = fs.readdirSync(sharedComponentsPath);
      files.forEach(file => {
        if (file.toLowerCase().includes(query.toLowerCase())) {
          console.log(`  ${colors.green}✓${colors.reset} /src/shared/components/${file}`);
        }
      });
    }
    
    // CSS 컴포넌트 검색
    const cssPath = path.join(__dirname, '..', 'src', 'shared', 'css', 'components.css');
    if (fs.existsSync(cssPath)) {
      const content = fs.readFileSync(cssPath, 'utf8');
      const classRegex = new RegExp(`\\.${query}[a-zA-Z-]*`, 'gi');
      const matches = content.match(classRegex);
      if (matches) {
        console.log(`\n  ${colors.blue}CSS 클래스:${colors.reset}`);
        [...new Set(matches)].forEach(match => {
          console.log(`    ${match}`);
        });
      }
    }
    
    askToContinue();
  });
}

// 새 페이지 가이드
function newPageGuide() {
  console.log(`\n${colors.cyan}📄 새 페이지 생성 가이드${colors.reset}`);
  console.log(`
${colors.yellow}1. 템플릿 복사${colors.reset}
   cp templates/new-page.html [대상경로]/[페이지명].html

${colors.yellow}2. 필수 수정 사항${colors.reset}
   - <title> 태그 수정
   - 네비게이션 링크 업데이트
   - 권한 체크 로직 추가 (authManager.checkSession())

${colors.yellow}3. 스타일 추가${colors.reset}
   - 디자인 시스템 변수만 사용 (var(--linky-primary) 등)
   - components.css 클래스 활용
   - 하드코딩 절대 금지

${colors.yellow}4. API 연동${colors.reset}
   - API_CONFIG 사용
   - 에러 처리 추가
   - 로딩 상태 관리

${colors.yellow}5. 테스트${colors.reset}
   - 반응형 확인
   - 권한 체크 확인
   - 에러 시나리오 테스트
  `);
  
  askToContinue();
}

// API 통합 가이드
function apiIntegrationGuide() {
  console.log(`\n${colors.cyan}🔌 API 통합 가이드${colors.reset}`);
  console.log(`
${colors.yellow}1. Supabase 클라이언트 import${colors.reset}
   import { supabase } from '/src/shared/js/config.js';

${colors.yellow}2. API 함수 작성${colors.reset}
   async function fetchData() {
     const { data, error } = await supabase
       .from('table_name')
       .select('*');
     
     if (error) {
       console.error('Error:', error);
       return null;
     }
     return data;
   }

${colors.yellow}3. 에러 처리${colors.reset}
   - API_CONFIG.errorMessages 사용
   - 사용자에게 친화적인 메시지 표시
   - 콘솔에 디버깅 정보 로깅

${colors.yellow}4. 로딩 상태${colors.reset}
   - createSpinner() 컴포넌트 사용
   - 버튼 비활성화
   - 로딩 텍스트 표시
  `);
  
  askToContinue();
}

// UI 컴포넌트 가이드
function uiComponentGuide() {
  console.log(`\n${colors.cyan}🎨 UI 컴포넌트 가이드${colors.reset}`);
  console.log(`
${colors.yellow}사용 가능한 컴포넌트:${colors.reset}
  - createButton()    : 버튼 생성
  - createCard()      : 카드 컴포넌트
  - createInput()     : 입력 필드
  - createAlert()     : 알림 메시지
  - createBadge()     : 배지/태그
  - createModal()     : 모달 창
  - createTable()     : 테이블
  - createSpinner()   : 로딩 스피너

${colors.yellow}사용 예시:${colors.reset}
  import { createButton } from '/js/components/ui/index.js';
  
  const btn = createButton({
    text: '저장',
    variant: 'primary',
    onClick: handleSave
  });
  
  document.querySelector('#container').appendChild(btn);

${colors.yellow}스타일 커스터마이징:${colors.reset}
  - className 옵션으로 추가 클래스 적용
  - UI_CONFIG 상수 사용
  - components.css 클래스 활용
  `);
  
  askToContinue();
}

// 폼 개발 가이드
function formDevelopmentGuide() {
  console.log(`\n${colors.cyan}📝 폼 개발 가이드${colors.reset}`);
  console.log(`
${colors.yellow}1. 폼 구조${colors.reset}
   <form id="myForm">
     <!-- createInput() 컴포넌트 사용 -->
   </form>

${colors.yellow}2. 유효성 검사${colors.reset}
   - HTML5 validation 활용
   - 커스텀 검증 함수 작성
   - 실시간 에러 표시

${colors.yellow}3. 제출 처리${colors.reset}
   form.addEventListener('submit', async (e) => {
     e.preventDefault();
     // 데이터 수집
     // API 호출
     // 결과 처리
   });

${colors.yellow}4. 에러 처리${colors.reset}
   - 필드별 에러 메시지
   - createAlert() 사용
   - 포커스 이동
  `);
  
  askToContinue();
}

// 데이터베이스 가이드
function databaseGuide() {
  console.log(`\n${colors.cyan}💾 데이터베이스 작업 가이드${colors.reset}`);
  console.log(`
${colors.yellow}테이블 구조:${colors.reset}
  - business_users : 운영자 정보
  - partners       : 파트너 정보
  - spaces         : 무인공간 정보
  - jobs           : 작업 정보
  - job_applications : 작업 지원
  - ratings        : 평가 정보

${colors.yellow}쿼리 예시:${colors.reset}
  // SELECT
  const { data } = await supabase
    .from('spaces')
    .select('*')
    .eq('business_id', userId);
  
  // INSERT
  const { error } = await supabase
    .from('jobs')
    .insert({ ...jobData });
  
  // UPDATE
  const { error } = await supabase
    .from('jobs')
    .update({ status: 'completed' })
    .eq('id', jobId);

${colors.yellow}RLS 정책:${colors.reset}
  - 각 테이블에 Row Level Security 적용
  - 사용자 타입별 접근 권한 분리
  `);
  
  askToContinue();
}

// PWA 가이드
function pwaGuide() {
  console.log(`\n${colors.cyan}📱 PWA 기능 가이드${colors.reset}`);
  console.log(`
${colors.yellow}구현된 기능:${colors.reset}
  ✓ Service Worker
  ✓ Manifest.json
  ✓ 오프라인 지원
  ✓ 설치 가능

${colors.yellow}테스트 방법:${colors.reset}
  1. Chrome DevTools > Application 탭
  2. Service Worker 상태 확인
  3. Manifest 검증
  4. Lighthouse 실행

${colors.yellow}주의사항:${colors.reset}
  - HTTPS 필수
  - 캐시 전략 확인
  - 업데이트 메커니즘 테스트
  `);
  
  askToContinue();
}

// 코드 품질 체크
async function codeQualityCheck() {
  console.log(`\n${colors.cyan}🔍 코드 품질 체크 실행 중...${colors.reset}`);
  
  // 하드코딩 체크
  console.log(`\n${colors.yellow}하드코딩 검사:${colors.reset}`);
  const checkHardcoding = require('./check-hardcoding.js');
  await checkHardcoding();
  
  // 중복 체크
  console.log(`\n${colors.yellow}중복 코드 검사:${colors.reset}`);
  const checkDuplicates = require('./check-duplicates.js');
  await checkDuplicates();
  
  askToContinue();
}

// 디버깅 가이드
function debuggingGuide() {
  console.log(`\n${colors.cyan}🐛 디버깅 가이드${colors.reset}`);
  console.log(`
${colors.yellow}일반적인 문제:${colors.reset}

1. ${colors.red}Supabase 연결 오류${colors.reset}
   - SUPABASE_URL과 SUPABASE_ANON_KEY 확인
   - 네트워크 연결 확인
   - RLS 정책 확인

2. ${colors.red}인증 오류${colors.reset}
   - 세션 만료 확인
   - 사용자 타입 확인 (business/partner)
   - 토큰 유효성 확인

3. ${colors.red}UI 렌더링 문제${colors.reset}
   - 콘솔 에러 확인
   - CSS 클래스 충돌 확인
   - JavaScript 로드 순서 확인

${colors.yellow}디버깅 도구:${colors.reset}
  - Chrome DevTools
  - Supabase Dashboard
  - console.log() 전략적 배치
  `);
  
  askToContinue();
}

// Supabase 설정 가이드
function supabaseSetupGuide() {
  console.log(`\n${colors.cyan}⚙️ Supabase 설정 가이드${colors.reset}`);
  console.log(`
${colors.yellow}1. 프로젝트 생성${colors.reset}
   - https://app.supabase.com 접속
   - New Project 클릭
   - 프로젝트 정보 입력

${colors.yellow}2. 환경 변수 설정${colors.reset}
   /src/shared/js/config.js 파일에서:
   - SUPABASE_URL 업데이트
   - SUPABASE_ANON_KEY 업데이트

${colors.yellow}3. 데이터베이스 설정${colors.reset}
   SQL Editor에서 다음 순서로 실행:
   1. /database/schema/*.sql 파일들
   2. /database/seeds/*.sql (테스트 데이터)

${colors.yellow}4. 인증 설정${colors.reset}
   Authentication > Providers에서:
   - Email 인증 활성화
   - 회원가입 설정 확인

${colors.yellow}5. Storage 설정${colors.reset}
   Storage에서 버킷 생성:
   - profiles (프로필 이미지)
   - spaces (공간 이미지)
  `);
  
  askToContinue();
}

// 사용 가능한 가이드 표시
function showAvailableGuides() {
  console.log(`\n${colors.yellow}사용 가능한 가이드:${colors.reset}`);
  Object.keys(guides).forEach(key => {
    console.log(`  - ${key}`);
  });
}

// 계속 진행 여부 확인
function askToContinue() {
  console.log(`\n${colors.yellow}계속하시겠습니까? (y/n)${colors.reset}`);
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y') {
      showMainMenu();
    } else {
      console.log(`${colors.green}✅ 도움이 되셨길 바랍니다!${colors.reset}`);
      rl.close();
    }
  });
}

// 프로그램 시작
main().catch(console.error);