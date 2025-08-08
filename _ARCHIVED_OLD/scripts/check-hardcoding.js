#!/usr/bin/env node

/**
 * 하드코딩 검사 스크립트
 * 코드에서 하드코딩된 값을 찾아 경고합니다.
 */

const fs = require('fs');
const path = require('path');

// 검사할 파일 확장자
const FILE_EXTENSIONS = ['.js', '.html', '.css'];

// 검사 제외 경로
const EXCLUDE_PATHS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'scripts',
    'docs',
    'templates',
    'config'  // config 파일은 제외
];

// 하드코딩 패턴 정의
const HARDCODING_PATTERNS = [
    // API URLs
    {
        pattern: /https?:\/\/(?:api\.|backend\.|localhost|127\.0\.0\.1|supabase)/gi,
        message: 'API URL 하드코딩 발견! config/api.config.js 사용하세요',
        severity: 'error'
    },
    
    // API Keys
    {
        pattern: /(['"])(?:sk_|pk_|api_key_|apikey|bearer\s+)[\w\-]{20,}(['"])/gi,
        message: 'API 키 하드코딩 발견! 환경변수 사용하세요',
        severity: 'error'
    },
    
    // Supabase Keys
    {
        pattern: /(['"])eyJ[\w\-\.]+(['"])/g,
        message: 'Supabase 키 하드코딩 발견! APP_CONFIG.external.supabase 사용하세요',
        severity: 'error'
    },
    
    // Supabase URL
    {
        pattern: /https:\/\/[\w-]+\.supabase\.co/g,
        message: 'Supabase URL 하드코딩 발견! API_CONFIG.SUPABASE_URL 사용하세요',
        severity: 'error'
    },
    
    // 색상 코드 (절대 금지)
    {
        pattern: /#(?:[0-9a-fA-F]{3}){1,2}\b/g,
        message: '색상값 하드코딩! UI_CONFIG 또는 컴포넌트 사용 필수',
        severity: 'error',
        exclude: [] // 예외 없음
    },
    
    // 인라인 스타일
    {
        pattern: /style\s*=\s*["'][^"']+["']/g,
        message: '인라인 스타일! 컴포넌트 사용 필수',
        severity: 'error',
        exclude: []
    },
    
    // 직접 CSS 클래스 (스타일 관련)
    {
        pattern: /class\s*=\s*["'][^"']*(?:margin|padding|color|bg-|text-|border|shadow)[^"']*["']/gi,
        message: '스타일 클래스 하드코딩! 컴포넌트 사용 필수',
        severity: 'error',
        exclude: []
    },
    
    // px, rem 등 단위 하드코딩
    {
        pattern: /\d+(?:px|rem|em|vh|vw)(?![\w-])/g,
        message: '스타일 단위 하드코딩! UI_CONFIG.spacing 사용',
        severity: 'warning',
        exclude: []
    },
    
    // RGB/RGBA 색상
    {
        pattern: /rgba?\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/g,
        message: 'RGB 색상 하드코딩! UI_CONFIG.colors 사용',
        severity: 'error',
        exclude: []
    },
    
    // 포트 번호
    {
        pattern: /(?:port|PORT)\s*[=:]\s*\d{4,5}/g,
        message: '포트 번호 하드코딩 발견! 설정 파일 사용하세요',
        severity: 'warning'
    },
    
    // 하드코딩된 경로
    {
        pattern: /(['"])\/(?:api|auth|admin|business|partners)\/[\w\-\/]+(['"])/g,
        message: '경로 하드코딩 발견! 상수나 설정 사용을 고려하세요',
        severity: 'info'
    },
    
    // 한국어 메시지 (일부는 허용)
    {
        pattern: /(['"])[가-힣\s]{10,}(['"])/g,
        message: '긴 한국어 텍스트 발견! 별도 상수로 관리를 고려하세요',
        severity: 'info'
    }
];

// 결과 저장
const results = {
    errors: [],
    warnings: [],
    infos: []
};

/**
 * 파일 검사
 */
function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // TODO 주석이 있는 라인은 제외
        if (line.includes('TODO:') || line.includes('// TODO')) {
            return;
        }
        
        HARDCODING_PATTERNS.forEach(({ pattern, message, severity, exclude }) => {
            const matches = line.match(pattern);
            
            if (matches) {
                // 제외 패턴 확인
                if (exclude && exclude.some(ex => line.includes(ex))) {
                    return;
                }
                
                const result = {
                    file: filePath,
                    line: index + 1,
                    code: line.trim(),
                    message,
                    match: matches[0]
                };
                
                switch (severity) {
                    case 'error':
                        results.errors.push(result);
                        break;
                    case 'warning':
                        results.warnings.push(result);
                        break;
                    case 'info':
                        results.infos.push(result);
                        break;
                }
            }
        });
    });
}

/**
 * 디렉토리 순회
 */
function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        // 제외 경로 확인
        if (EXCLUDE_PATHS.some(exclude => filePath.includes(exclude))) {
            return;
        }
        
        if (stat.isDirectory()) {
            walkDirectory(filePath);
        } else if (stat.isFile()) {
            const ext = path.extname(file);
            if (FILE_EXTENSIONS.includes(ext)) {
                checkFile(filePath);
            }
        }
    });
}

/**
 * 결과 출력
 */
function printResults() {
    console.log('\n🔍 하드코딩 검사 결과\n');
    
    // 에러 출력
    if (results.errors.length > 0) {
        console.log('❌ 에러 (' + results.errors.length + '개)');
        results.errors.forEach(error => {
            console.log(`\n  ${error.file}:${error.line}`);
            console.log(`  ${error.message}`);
            console.log(`  발견: ${error.match}`);
            console.log(`  코드: ${error.code}`);
        });
    }
    
    // 경고 출력
    if (results.warnings.length > 0) {
        console.log('\n⚠️  경고 (' + results.warnings.length + '개)');
        results.warnings.forEach(warning => {
            console.log(`\n  ${warning.file}:${warning.line}`);
            console.log(`  ${warning.message}`);
            console.log(`  발견: ${warning.match}`);
        });
    }
    
    // 정보 출력 (간략히)
    if (results.infos.length > 0) {
        console.log('\nℹ️  정보 (' + results.infos.length + '개)');
        console.log('  (자세한 내용은 --verbose 옵션 사용)');
    }
    
    // 요약
    console.log('\n📊 요약:');
    console.log(`  - 에러: ${results.errors.length}개`);
    console.log(`  - 경고: ${results.warnings.length}개`);
    console.log(`  - 정보: ${results.infos.length}개`);
    
    // 종료 코드
    if (results.errors.length > 0) {
        console.log('\n❌ 하드코딩 에러를 수정해주세요!');
        process.exit(1);
    } else if (results.warnings.length > 0) {
        console.log('\n⚠️  하드코딩 경고를 검토해주세요.');
        process.exit(0);
    } else {
        console.log('\n✅ 하드코딩이 발견되지 않았습니다!');
        process.exit(0);
    }
}

/**
 * 메인 실행
 */
function main() {
    const targetPath = process.argv[2] || 'linky-test/linky-website';
    
    console.log('🔍 하드코딩 검사 시작...');
    console.log(`대상: ${targetPath}\n`);
    
    if (!fs.existsSync(targetPath)) {
        console.error(`❌ 경로를 찾을 수 없습니다: ${targetPath}`);
        process.exit(1);
    }
    
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
        walkDirectory(targetPath);
    } else if (stat.isFile()) {
        checkFile(targetPath);
    }
    
    printResults();
}

// 실행
main();