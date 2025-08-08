#!/usr/bin/env node

/**
 * 중복 코드 검사 스크립트
 * 유사한 코드 패턴을 찾아 컴포넌트화를 제안합니다.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 검사할 파일 확장자
const FILE_EXTENSIONS = ['.js', '.html'];

// 검사 제외 경로
const EXCLUDE_PATHS = [
    'node_modules',
    '.git',
    'dist',
    'build',
    'scripts',
    'docs',
    'templates'
];

// 최소 중복 라인 수
const MIN_DUPLICATE_LINES = 10;

// 결과 저장
const codeBlocks = new Map(); // hash -> {code, locations}
const duplicates = [];

/**
 * 코드 정규화 (공백, 주석 제거)
 */
function normalizeCode(code) {
    return code
        // 한 줄 주석 제거
        .replace(/\/\/.*$/gm, '')
        // 여러 줄 주석 제거
        .replace(/\/\*[\s\S]*?\*\//g, '')
        // 연속된 공백을 하나로
        .replace(/\s+/g, ' ')
        // 앞뒤 공백 제거
        .trim();
}

/**
 * 코드 블록 추출
 */
function extractCodeBlocks(filePath, content) {
    const lines = content.split('\n');
    const blocks = [];
    
    // 함수 블록 추출
    const functionPattern = /function\s+\w+\s*\([^)]*\)\s*{|(\w+)\s*:\s*function\s*\([^)]*\)\s*{|(\w+)\s*\([^)]*\)\s*{|async\s+function|\([^)]*\)\s*=>/;
    
    let blockStart = -1;
    let braceCount = 0;
    let currentBlock = [];
    
    lines.forEach((line, index) => {
        if (functionPattern.test(line)) {
            blockStart = index;
            braceCount = 0;
            currentBlock = [];
        }
        
        if (blockStart !== -1) {
            currentBlock.push(line);
            
            // 중괄호 카운트
            for (const char of line) {
                if (char === '{') braceCount++;
                if (char === '}') braceCount--;
            }
            
            // 블록 종료
            if (braceCount === 0 && currentBlock.length >= MIN_DUPLICATE_LINES) {
                const code = currentBlock.join('\n');
                const normalizedCode = normalizeCode(code);
                
                if (normalizedCode.length > 100) { // 의미있는 크기만
                    blocks.push({
                        code,
                        normalizedCode,
                        startLine: blockStart + 1,
                        endLine: index + 1,
                        filePath
                    });
                }
                
                blockStart = -1;
                currentBlock = [];
            }
        }
    });
    
    // HTML 템플릿 블록 추출
    const templatePattern = /<(div|section|form|table|ul|ol)\s[^>]*>[\s\S]*?<\/\1>/g;
    const templates = content.match(templatePattern) || [];
    
    templates.forEach(template => {
        if (template.length > 200) { // 의미있는 크기만
            const startIndex = content.indexOf(template);
            const startLine = content.substring(0, startIndex).split('\n').length;
            
            blocks.push({
                code: template,
                normalizedCode: normalizeCode(template),
                startLine,
                endLine: startLine + template.split('\n').length,
                filePath
            });
        }
    });
    
    return blocks;
}

/**
 * 코드 블록 해시 생성
 */
function hashCode(code) {
    return crypto.createHash('md5').update(code).digest('hex');
}

/**
 * 파일 검사
 */
function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const blocks = extractCodeBlocks(filePath, content);
    
    blocks.forEach(block => {
        const hash = hashCode(block.normalizedCode);
        
        if (codeBlocks.has(hash)) {
            // 중복 발견
            const existing = codeBlocks.get(hash);
            existing.locations.push({
                file: filePath,
                startLine: block.startLine,
                endLine: block.endLine
            });
        } else {
            // 새로운 블록
            codeBlocks.set(hash, {
                code: block.code,
                locations: [{
                    file: filePath,
                    startLine: block.startLine,
                    endLine: block.endLine
                }]
            });
        }
    });
}

/**
 * 유사도 계산 (Levenshtein Distance)
 */
function calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) dp[i][0] = i;
    for (let j = 0; j <= len2; j++) dp[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,
                    dp[i][j - 1] + 1,
                    dp[i - 1][j - 1] + 1
                );
            }
        }
    }
    
    const distance = dp[len1][len2];
    const maxLen = Math.max(len1, len2);
    return (maxLen - distance) / maxLen;
}

/**
 * 디렉토리 순회
 */
function walkDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
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
 * 중복 분석
 */
function analyzeDuplicates() {
    codeBlocks.forEach((data, hash) => {
        if (data.locations.length > 1) {
            duplicates.push({
                code: data.code,
                locations: data.locations,
                lineCount: data.code.split('\n').length
            });
        }
    });
    
    // 크기순 정렬
    duplicates.sort((a, b) => b.lineCount - a.lineCount);
}

/**
 * 컴포넌트 제안
 */
function suggestComponent(duplicate) {
    const code = duplicate.code;
    
    // 함수명 추출
    const functionMatch = code.match(/function\s+(\w+)|(\w+)\s*:\s*function|(\w+)\s*\(/);
    const functionName = functionMatch ? (functionMatch[1] || functionMatch[2] || functionMatch[3]) : 'Component';
    
    // HTML 요소 확인
    const isHTML = /<\w+/.test(code);
    
    if (isHTML) {
        return {
            type: 'HTML Template',
            suggestion: `HTMLTemplateComponent`,
            location: '/js/components/templates/'
        };
    } else {
        return {
            type: 'JavaScript Function',
            suggestion: `${functionName}Utility`,
            location: '/js/utils/'
        };
    }
}

/**
 * 결과 출력
 */
function printResults() {
    console.log('\n🔍 중복 코드 검사 결과\n');
    
    if (duplicates.length === 0) {
        console.log('✅ 중복 코드가 발견되지 않았습니다!');
        return;
    }
    
    console.log(`❌ ${duplicates.length}개의 중복 코드 블록 발견\n`);
    
    duplicates.forEach((dup, index) => {
        console.log(`\n${index + 1}. 중복 코드 (${dup.lineCount}줄)`);
        console.log('━'.repeat(50));
        
        // 위치 정보
        console.log('\n📍 위치:');
        dup.locations.forEach(loc => {
            console.log(`  - ${loc.file}:${loc.startLine}-${loc.endLine}`);
        });
        
        // 컴포넌트 제안
        const suggestion = suggestComponent(dup);
        console.log('\n💡 제안:');
        console.log(`  타입: ${suggestion.type}`);
        console.log(`  컴포넌트명: ${suggestion.suggestion}`);
        console.log(`  위치: ${suggestion.location}`);
        
        // 코드 미리보기
        console.log('\n📄 코드 미리보기:');
        const preview = dup.code.split('\n').slice(0, 5).join('\n');
        console.log(preview);
        if (dup.lineCount > 5) {
            console.log('... (생략) ...');
        }
    });
    
    // 요약
    console.log('\n\n📊 요약:');
    console.log(`  - 총 중복 블록: ${duplicates.length}개`);
    console.log(`  - 총 중복 라인: ${duplicates.reduce((sum, dup) => sum + (dup.lineCount * (dup.locations.length - 1)), 0)}줄`);
    
    console.log('\n💡 해결 방법:');
    console.log('  1. 중복 코드를 컴포넌트로 추출하세요');
    console.log('  2. /templates/new-component.js 템플릿을 사용하세요');
    console.log('  3. 생성한 컴포넌트를 /docs/COMPONENT_CATALOG.md에 문서화하세요');
}

/**
 * 메인 실행
 */
function main() {
    const targetPath = process.argv[2] || 'linky-test/linky-website';
    
    console.log('🔍 중복 코드 검사 시작...');
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
    
    analyzeDuplicates();
    printResults();
}

// 실행
main();