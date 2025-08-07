#!/usr/bin/env node

/**
 * Pre-commit 검사 스크립트
 * 커밋 전 코드 품질을 자동으로 검사합니다.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// 색상 코드
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// 검사 결과
let hasErrors = false;
let hasWarnings = false;

/**
 * 컬러 출력
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 명령 실행
 */
function runCommand(command, description) {
    try {
        log(`\n🔍 ${description}...`, 'blue');
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        
        if (output.trim()) {
            console.log(output);
        }
        
        return { success: true, output };
    } catch (error) {
        return { success: false, output: error.stdout || error.message };
    }
}

/**
 * Git 스테이징된 파일 가져오기
 */
function getStagedFiles() {
    try {
        const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
        return output.trim().split('\n').filter(file => file);
    } catch (error) {
        return [];
    }
}

/**
 * 파일 확장자 확인
 */
function getFilesByExtension(files, extensions) {
    return files.filter(file => {
        const ext = path.extname(file);
        return extensions.includes(ext);
    });
}

/**
 * 1. 하드코딩 검사
 */
function checkHardcoding(files) {
    const jsFiles = getFilesByExtension(files, ['.js', '.html', '.css']);
    
    if (jsFiles.length === 0) return true;
    
    const result = runCommand(
        `node scripts/check-hardcoding.js ${jsFiles.join(' ')}`,
        '하드코딩 검사'
    );
    
    if (!result.success) {
        if (result.output.includes('에러')) {
            log('❌ 하드코딩 에러 발견!', 'red');
            hasErrors = true;
            return false;
        } else if (result.output.includes('경고')) {
            log('⚠️  하드코딩 경고 발견', 'yellow');
            hasWarnings = true;
        }
    } else {
        log('✅ 하드코딩 검사 통과', 'green');
    }
    
    return true;
}

/**
 * 2. 중복 코드 검사
 */
function checkDuplicates(files) {
    const codeFiles = getFilesByExtension(files, ['.js', '.html']);
    
    if (codeFiles.length === 0) return true;
    
    const result = runCommand(
        `node scripts/check-duplicates.js`,
        '중복 코드 검사'
    );
    
    if (result.output.includes('중복 코드 블록 발견')) {
        log('⚠️  중복 코드 발견 - 컴포넌트화를 고려하세요', 'yellow');
        hasWarnings = true;
    } else {
        log('✅ 중복 코드 검사 통과', 'green');
    }
    
    return true;
}

/**
 * 3. TODO 주석 검사
 */
function checkTodos(files) {
    let todoCount = 0;
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const content = fs.readFileSync(file, 'utf8');
            const todos = content.match(/TODO:/gi) || [];
            todoCount += todos.length;
        }
    });
    
    if (todoCount > 0) {
        log(`\nℹ️  TODO 주석 ${todoCount}개 발견`, 'yellow');
        log('   커밋 전에 TODO를 해결하거나 이슈로 등록하세요', 'yellow');
    }
    
    return true;
}

/**
 * 4. 파일 크기 검사
 */
function checkFileSize(files) {
    const MAX_FILE_SIZE = 200 * 1024; // 200KB
    const largeFiles = [];
    
    files.forEach(file => {
        if (fs.existsSync(file)) {
            const stats = fs.statSync(file);
            if (stats.size > MAX_FILE_SIZE) {
                largeFiles.push({
                    file,
                    size: (stats.size / 1024).toFixed(2) + 'KB'
                });
            }
        }
    });
    
    if (largeFiles.length > 0) {
        log('\n⚠️  큰 파일 발견:', 'yellow');
        largeFiles.forEach(({ file, size }) => {
            log(`   - ${file} (${size})`, 'yellow');
        });
        log('   파일 분할이나 최적화를 고려하세요', 'yellow');
        hasWarnings = true;
    }
    
    return true;
}

/**
 * 5. 설정 파일 확인
 */
function checkConfigUsage(files) {
    const jsFiles = getFilesByExtension(files, ['.js']);
    let configIssues = 0;
    
    jsFiles.forEach(file => {
        if (fs.existsSync(file) && !file.includes('config/')) {
            const content = fs.readFileSync(file, 'utf8');
            
            // config import 없이 하드코딩된 값 사용 확인
            if (content.includes("'#") && !content.includes('config')) {
                configIssues++;
            }
        }
    });
    
    if (configIssues > 0) {
        log(`\n⚠️  ${configIssues}개 파일에서 config 미사용 의심`, 'yellow');
        hasWarnings = true;
    }
    
    return true;
}

/**
 * 6. 컴포넌트 사용 검사
 */
function checkComponentUsage(files) {
    const htmlFiles = getFilesByExtension(files, ['.html']);
    
    if (htmlFiles.length === 0) return true;
    
    const result = runCommand(
        `node scripts/check-component-usage.js ${htmlFiles.join(' ')}`,
        'UI 컴포넌트 사용 검사'
    );
    
    if (!result.success) {
        if (result.output.includes('에러')) {
            log('❌ UI 요소를 직접 작성하지 말고 컴포넌트를 사용하세요!', 'red');
            hasErrors = true;
            return false;
        }
    } else {
        log('✅ 모든 UI 요소가 컴포넌트를 통해 생성됩니다', 'green');
    }
    
    return true;
}

/**
 * 7. 새 컴포넌트 검토 확인
 */
function checkNewComponents(files) {
    const componentFiles = files.filter(file => 
        file.includes('/js/components/') && 
        file.endsWith('.js') &&
        !fs.existsSync(file.replace('.js', '.approved'))
    );
    
    const unapprovedComponents = [];
    
    componentFiles.forEach(file => {
        // Git에서 파일이 새로 추가되었는지 확인
        try {
            execSync(`git ls-files --error-unmatch ${file}`, { stdio: 'ignore' });
            // 파일이 이미 존재함 - 수정만 된 경우
        } catch (error) {
            // 새 파일인 경우
            unapprovedComponents.push(file);
        }
    });
    
    if (unapprovedComponents.length > 0) {
        log('\n❌ 검토받지 않은 새 컴포넌트 발견:', 'red');
        unapprovedComponents.forEach(comp => {
            log(`   - ${comp}`, 'red');
        });
        log('\n📝 /templates/component-request.md를 작성하여 검토를 받으세요', 'yellow');
        log('   검토 후 .approved 파일이 생성되어야 커밋 가능합니다', 'yellow');
        hasErrors = true;
        return false;
    }
    
    return true;
}

/**
 * 메인 실행
 */
function main() {
    log('\n🚀 Pre-commit 검사 시작\n', 'blue');
    
    // 스테이징된 파일 가져오기
    const stagedFiles = getStagedFiles();
    
    if (stagedFiles.length === 0) {
        log('ℹ️  스테이징된 파일이 없습니다', 'yellow');
        process.exit(0);
    }
    
    log(`📁 검사 대상: ${stagedFiles.length}개 파일`, 'blue');
    
    // 검사 실행
    const checks = [
        { name: '하드코딩 검사', fn: () => checkHardcoding(stagedFiles) },
        { name: '중복 코드 검사', fn: () => checkDuplicates(stagedFiles) },
        { name: 'TODO 주석 검사', fn: () => checkTodos(stagedFiles) },
        { name: '파일 크기 검사', fn: () => checkFileSize(stagedFiles) },
        { name: '설정 파일 사용 검사', fn: () => checkConfigUsage(stagedFiles) },
        { name: '새 컴포넌트 검토 확인', fn: () => checkNewComponents(stagedFiles) },
        { name: '컴포넌트 사용 검사', fn: () => checkComponentUsage(stagedFiles) }
    ];
    
    checks.forEach(check => {
        try {
            check.fn();
        } catch (error) {
            log(`\n❌ ${check.name} 실패: ${error.message}`, 'red');
            hasErrors = true;
        }
    });
    
    // 결과 출력
    console.log('\n' + '='.repeat(50));
    
    if (hasErrors) {
        log('\n❌ 커밋 차단: 에러를 수정해주세요!', 'red');
        process.exit(1);
    } else if (hasWarnings) {
        log('\n⚠️  경고가 있습니다. 검토 후 커밋하세요.', 'yellow');
        log('   강제 커밋: git commit --no-verify', 'yellow');
        process.exit(0);
    } else {
        log('\n✅ 모든 검사를 통과했습니다!', 'green');
        process.exit(0);
    }
}

// 실행
main();