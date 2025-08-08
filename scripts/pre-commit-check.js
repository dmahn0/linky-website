#!/usr/bin/env node

/**
 * Pre-commit Check Script
 * 커밋 전 코드 품질 검사
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

let hasErrors = false;
let hasWarnings = false;

console.log(`${colors.cyan}${colors.bright}
╔══════════════════════════════════════════════╗
║     Linky Platform Pre-Commit Check 🔍      ║
╚══════════════════════════════════════════════╝
${colors.reset}`);

// 1. 하드코딩 체크
function checkHardcoding() {
  console.log(`\n${colors.yellow}1. 하드코딩 검사...${colors.reset}`);
  
  const patterns = [
    { pattern: /#[0-9A-Fa-f]{6}/, message: '하드코딩된 색상 코드', severity: 'error' },
    { pattern: /https?:\/\/(?!localhost|127\.0\.0\.1)/, message: '하드코딩된 URL', severity: 'warning' },
    { pattern: /style="[^"]+"/g, message: '인라인 스타일', severity: 'warning' },
    { pattern: /console\.log/, message: 'console.log 발견', severity: 'warning' },
    { pattern: /TODO:|FIXME:|XXX:/, message: 'TODO 주석', severity: 'warning' }
  ];
  
  const filesToCheck = [
    ...getFiles('src', ['.html', '.js', '.css']),
    ...getFiles('js', ['.js']),
    ...getFiles('config', ['.js'])
  ];
  
  let foundIssues = false;
  
  filesToCheck.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      patterns.forEach(({ pattern, message, severity }) => {
        if (pattern.test(line)) {
          foundIssues = true;
          if (severity === 'error') {
            hasErrors = true;
            console.log(`  ${colors.red}❌ ${message}${colors.reset}`);
          } else {
            hasWarnings = true;
            console.log(`  ${colors.yellow}⚠️  ${message}${colors.reset}`);
          }
          console.log(`     파일: ${file}:${index + 1}`);
          console.log(`     내용: ${line.trim().substring(0, 60)}...`);
        }
      });
    });
  });
  
  if (!foundIssues) {
    console.log(`  ${colors.green}✓ 하드코딩 없음${colors.reset}`);
  }
}

// 2. 컴포넌트 사용 체크
function checkComponentUsage() {
  console.log(`\n${colors.yellow}2. 컴포넌트 사용 검사...${colors.reset}`);
  
  const htmlFiles = getFiles('src', ['.html']);
  let foundIssues = false;
  
  htmlFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // HTML 직접 작성 체크
    const directHTMLPatterns = [
      /<button(?!.*btn)/,
      /<input(?!.*form-input)/,
      /<div class="card"(?!.*card)/
    ];
    
    directHTMLPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        foundIssues = true;
        hasWarnings = true;
        console.log(`  ${colors.yellow}⚠️  컴포넌트 미사용 발견${colors.reset}`);
        console.log(`     파일: ${file}`);
        console.log(`     권장: createButton(), createInput(), createCard() 사용`);
      }
    });
  });
  
  if (!foundIssues) {
    console.log(`  ${colors.green}✓ 컴포넌트 적절히 사용됨${colors.reset}`);
  }
}

// 3. 설정값 사용 체크
function checkConfigUsage() {
  console.log(`\n${colors.yellow}3. 설정값 사용 검사...${colors.reset}`);
  
  const jsFiles = getFiles('src', ['.js']);
  let foundIssues = false;
  
  jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    // API_CONFIG, UI_CONFIG import 확인
    if (!content.includes('API_CONFIG') && content.includes('fetch')) {
      foundIssues = true;
      hasWarnings = true;
      console.log(`  ${colors.yellow}⚠️  API_CONFIG 미사용${colors.reset}`);
      console.log(`     파일: ${file}`);
    }
    
    if (!content.includes('UI_CONFIG') && content.includes('style')) {
      foundIssues = true;
      hasWarnings = true;
      console.log(`  ${colors.yellow}⚠️  UI_CONFIG 미사용${colors.reset}`);
      console.log(`     파일: ${file}`);
    }
  });
  
  if (!foundIssues) {
    console.log(`  ${colors.green}✓ 설정값 적절히 사용됨${colors.reset}`);
  }
}

// 4. 파일 크기 체크
function checkFileSize() {
  console.log(`\n${colors.yellow}4. 파일 크기 검사...${colors.reset}`);
  
  const maxSizes = {
    '.js': 100 * 1024,  // 100KB
    '.css': 50 * 1024,   // 50KB
    '.html': 50 * 1024   // 50KB
  };
  
  let foundIssues = false;
  
  Object.entries(maxSizes).forEach(([ext, maxSize]) => {
    const files = getFiles('src', [ext]);
    
    files.forEach(file => {
      const stats = fs.statSync(file);
      if (stats.size > maxSize) {
        foundIssues = true;
        hasWarnings = true;
        console.log(`  ${colors.yellow}⚠️  큰 파일 발견${colors.reset}`);
        console.log(`     파일: ${file}`);
        console.log(`     크기: ${(stats.size / 1024).toFixed(2)}KB (최대: ${maxSize / 1024}KB)`);
      }
    });
  });
  
  if (!foundIssues) {
    console.log(`  ${colors.green}✓ 파일 크기 적절함${colors.reset}`);
  }
}

// 5. 보안 체크
function checkSecurity() {
  console.log(`\n${colors.yellow}5. 보안 검사...${colors.reset}`);
  
  const securityPatterns = [
    { pattern: /password\s*=\s*["'][^"']+["']/, message: '하드코딩된 비밀번호' },
    { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/, message: '하드코딩된 API 키' },
    { pattern: /secret\s*=\s*["'][^"']+["']/, message: '하드코딩된 시크릿' },
    { pattern: /eval\(/, message: 'eval() 사용' },
    { pattern: /innerHTML\s*=/, message: 'innerHTML 직접 사용 (XSS 위험)' }
  ];
  
  const files = [...getFiles('src', ['.js', '.html']), ...getFiles('js', ['.js'])];
  let foundIssues = false;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    
    securityPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(content)) {
        foundIssues = true;
        hasErrors = true;
        console.log(`  ${colors.red}❌ ${message}${colors.reset}`);
        console.log(`     파일: ${file}`);
      }
    });
  });
  
  if (!foundIssues) {
    console.log(`  ${colors.green}✓ 보안 문제 없음${colors.reset}`);
  }
}

// 파일 목록 가져오기
function getFiles(dir, extensions) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(itemPath);
      } else if (stats.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(itemPath);
        }
      }
    });
  }
  
  traverse(dir);
  return files;
}

// 검사 실행
function runChecks() {
  checkHardcoding();
  checkComponentUsage();
  checkConfigUsage();
  checkFileSize();
  checkSecurity();
  
  // 결과 출력
  console.log(`\n${colors.cyan}${ colors.bright}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  
  if (hasErrors) {
    console.log(`\n${colors.red}❌ 커밋 차단됨: 오류를 수정해주세요.${colors.reset}`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`\n${colors.yellow}⚠️  경고가 있지만 커밋 가능합니다.${colors.reset}`);
    console.log(`${colors.yellow}   권장: 경고 사항을 확인하고 수정해주세요.${colors.reset}`);
  } else {
    console.log(`\n${colors.green}✅ 모든 검사 통과! 커밋 가능합니다.${colors.reset}`);
  }
}

// 실행
runChecks();