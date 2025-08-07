/**
 * 문서 가이드 헬퍼
 * 상황에 맞는 참고 문서를 안내하는 유틸리티
 */

const fs = require('fs');
const path = require('path');

// 문서 가이드 JSON 로드
const docsGuide = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../config/docs-guide.json'), 'utf8')
);

/**
 * 상황별 문서 가이드 출력
 * @param {string} situation - 상황 키 (예: 'new-page', 'api-integration')
 */
function showGuide(situation) {
    const guide = docsGuide.situations[situation];
    
    if (!guide) {
        console.log('❌ 알 수 없는 상황입니다.');
        console.log('\n사용 가능한 상황:');
        Object.keys(docsGuide.situations).forEach(key => {
            console.log(`  - ${key}: ${docsGuide.situations[key].title}`);
        });
        return;
    }
    
    console.log(`\n📚 ${guide.title}`);
    console.log(`📝 ${guide.description}`);
    console.log('\n단계별 가이드:');
    
    guide.steps.forEach(step => {
        const required = step.required ? '필수' : '선택';
        console.log(`\n${step.order}. [${required}] ${step.action.toUpperCase()}`);
        console.log(`   📄 ${step.document}`);
        console.log(`   💡 ${step.purpose}`);
    });
    
    if (guide.examples) {
        console.log('\n예시:');
        guide.examples.forEach(example => {
            console.log(`  - ${example}`);
        });
    }
    
    if (guide.commands) {
        console.log('\n실행 명령:');
        guide.commands.forEach(cmd => {
            console.log(`  $ ${cmd}`);
        });
    }
}

/**
 * 빠른 참조 정보 출력
 */
function showQuickReference() {
    console.log('\n⚡ 빠른 참조');
    
    console.log('\n📋 코딩 전 필수 확인:');
    docsGuide['quick-reference']['must-check-before-coding'].forEach(doc => {
        console.log(`  - ${doc}`);
    });
    
    console.log('\n🔍 커밋 전 필수 실행:');
    docsGuide['quick-reference']['must-run-before-commit'].forEach(cmd => {
        console.log(`  $ ${cmd}`);
    });
    
    console.log('\n📝 변경 후 필수 업데이트:');
    docsGuide['quick-reference']['must-update-after-change'].forEach(doc => {
        console.log(`  - ${doc}`);
    });
}

/**
 * 파일 용도 검색
 * @param {string} keyword - 검색 키워드
 */
function searchFilePurpose(keyword) {
    console.log(`\n🔍 "${keyword}" 관련 문서 검색 결과:\n`);
    
    let found = false;
    Object.entries(docsGuide['file-purposes']).forEach(([file, purpose]) => {
        if (file.toLowerCase().includes(keyword.toLowerCase()) || 
            purpose.toLowerCase().includes(keyword.toLowerCase())) {
            console.log(`📄 ${file}`);
            console.log(`   ${purpose}\n`);
            found = true;
        }
    });
    
    if (!found) {
        console.log('검색 결과가 없습니다.');
    }
}

/**
 * 필수 문서 목록 출력
 * @param {string} category - 카테고리 (선택적)
 */
function showEssentialDocuments(category) {
    console.log('\n📖 필수 문서 목록');
    
    const essentialDocs = docsGuide['essential-documents'];
    const categories = category ? [category] : Object.keys(essentialDocs);
    
    categories.forEach(cat => {
        if (!essentialDocs[cat]) {
            console.log(`❌ 알 수 없는 카테고리: ${cat}`);
            return;
        }
        
        const section = essentialDocs[cat];
        console.log(`\n### ${section.title}`);
        console.log(`${section.description}\n`);
        
        section.documents.forEach(doc => {
            const required = doc.required ? '필수' : '선택';
            const priority = '⭐'.repeat(doc.priority);
            console.log(`${priority} [${required}] ${doc.path}`);
            console.log(`   └─ ${doc.purpose}`);
        });
    });
}

/**
 * 읽기 순서 출력
 * @param {string} type - 타입 (new-developer, before-coding, before-commit)
 */
function showReadingOrder(type) {
    const readingOrder = docsGuide['reading-order'];
    
    if (!readingOrder[type]) {
        console.log('\n📖 사용 가능한 읽기 순서:');
        Object.keys(readingOrder).forEach(key => {
            console.log(`  - ${key}`);
        });
        return;
    }
    
    console.log(`\n📖 ${type} 읽기 순서:`);
    readingOrder[type].forEach((doc, index) => {
        console.log(`${index + 1}. ${doc}`);
    });
}

/**
 * 대화형 가이드
 */
function interactiveGuide() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('\n🤖 Linky 문서 가이드 도우미');
    console.log('어떤 작업을 하시려고 하나요?\n');
    
    const situations = Object.entries(docsGuide.situations);
    situations.forEach(([key, value], index) => {
        console.log(`${index + 1}. ${value.title}`);
    });
    console.log(`${situations.length + 1}. 필수 문서 보기`);
    console.log(`${situations.length + 2}. 빠른 참조 보기`);
    console.log(`${situations.length + 3}. 문서 검색`);
    console.log('0. 종료\n');
    
    rl.question('선택하세요 (숫자 입력): ', (answer) => {
        const choice = parseInt(answer);
        
        if (choice === 0) {
            rl.close();
            return;
        }
        
        if (choice > 0 && choice <= situations.length) {
            const [key] = situations[choice - 1];
            showGuide(key);
        } else if (choice === situations.length + 1) {
            showEssentialDocuments();
        } else if (choice === situations.length + 2) {
            showQuickReference();
        } else if (choice === situations.length + 3) {
            rl.question('\n검색어를 입력하세요: ', (keyword) => {
                searchFilePurpose(keyword);
                rl.close();
            });
            return;
        }
        
        rl.close();
    });
}

// CLI 실행
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        interactiveGuide();
    } else if (args[0] === 'quick') {
        showQuickReference();
    } else if (args[0] === 'essential') {
        showEssentialDocuments(args[1]);
    } else if (args[0] === 'reading-order') {
        showReadingOrder(args[1]);
    } else if (args[0] === 'search' && args[1]) {
        searchFilePurpose(args[1]);
    } else {
        showGuide(args[0]);
    }
}

module.exports = {
    showGuide,
    showQuickReference,
    searchFilePurpose,
    showEssentialDocuments,
    showReadingOrder,
    docsGuide
};