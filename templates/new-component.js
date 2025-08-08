/**
 * [컴포넌트명] Component
 * [컴포넌트 설명]
 * 
 * @module components/[컴포넌트명]
 * @requires UI_CONFIG
 */

import { UI_CONFIG } from '/config/ui.config.js';

/**
 * [컴포넌트명] 생성
 * 
 * @param {Object} options - 컴포넌트 옵션
 * @param {string} options.id - 컴포넌트 ID
 * @param {string} options.className - 추가 CSS 클래스
 * @param {Object} options.data - 컴포넌트 데이터
 * @param {Function} options.onClick - 클릭 핸들러
 * @param {Function} options.onChange - 변경 핸들러
 * @param {boolean} options.disabled - 비활성화 상태
 * @returns {HTMLElement} 생성된 컴포넌트 엘리먼트
 * 
 * @example
 * const component = create[컴포넌트명]({
 *   id: 'my-component',
 *   data: { title: '제목', content: '내용' },
 *   onClick: handleClick
 * });
 */
export function create[컴포넌트명](options = {}) {
    // 옵션 구조 분해
    const {
        id = `component-${Date.now()}`,
        className = '',
        data = {},
        onClick = null,
        onChange = null,
        disabled = false
    } = options;
    
    // 컨테이너 생성
    const container = document.createElement('div');
    container.id = id;
    container.className = `[컴포넌트-클래스] ${className}`.trim();
    
    // 비활성화 상태 적용
    if (disabled) {
        container.classList.add('disabled');
        container.setAttribute('aria-disabled', 'true');
    }
    
    // 스타일 적용 (디자인 시스템 변수 사용)
    applyStyles(container);
    
    // 컴포넌트 구조 생성
    const structure = createStructure(data);
    container.appendChild(structure);
    
    // 이벤트 핸들러 연결
    if (onClick) {
        container.addEventListener('click', onClick);
    }
    
    if (onChange) {
        container.addEventListener('change', onChange);
    }
    
    // 접근성 속성 추가
    addAccessibilityAttributes(container, data);
    
    return container;
}

/**
 * 컴포넌트 구조 생성
 * @private
 */
function createStructure(data) {
    const wrapper = document.createElement('div');
    wrapper.className = '[컴포넌트]-wrapper';
    
    // 헤더 (필요한 경우)
    if (data.title) {
        const header = document.createElement('div');
        header.className = '[컴포넌트]-header';
        
        const title = document.createElement('h3');
        title.className = '[컴포넌트]-title';
        title.textContent = data.title;
        
        header.appendChild(title);
        wrapper.appendChild(header);
    }
    
    // 본문
    const body = document.createElement('div');
    body.className = '[컴포넌트]-body';
    
    if (data.content) {
        if (typeof data.content === 'string') {
            body.innerHTML = data.content;
        } else {
            body.appendChild(data.content);
        }
    }
    
    wrapper.appendChild(body);
    
    // 푸터 (필요한 경우)
    if (data.footer) {
        const footer = document.createElement('div');
        footer.className = '[컴포넌트]-footer';
        
        if (typeof data.footer === 'string') {
            footer.innerHTML = data.footer;
        } else {
            footer.appendChild(data.footer);
        }
        
        wrapper.appendChild(footer);
    }
    
    return wrapper;
}

/**
 * 스타일 적용
 * @private
 */
function applyStyles(element) {
    // CSS 변수를 사용한 인라인 스타일 (필요한 경우)
    // 주의: 가능한 한 CSS 클래스 사용을 우선시
    
    // 예시:
    // element.style.setProperty('--component-padding', UI_CONFIG.spacing.md);
    // element.style.setProperty('--component-color', UI_CONFIG.colors.primary);
}

/**
 * 접근성 속성 추가
 * @private
 */
function addAccessibilityAttributes(element, data) {
    // ARIA 속성 추가
    element.setAttribute('role', '[적절한-role]');
    
    if (data.label) {
        element.setAttribute('aria-label', data.label);
    }
    
    if (data.description) {
        element.setAttribute('aria-describedby', `${element.id}-description`);
        
        // 설명 요소 생성
        const description = document.createElement('span');
        description.id = `${element.id}-description`;
        description.className = 'sr-only'; // 스크린 리더 전용
        description.textContent = data.description;
        element.appendChild(description);
    }
}

/**
 * 컴포넌트 업데이트
 * 
 * @param {HTMLElement} component - 업데이트할 컴포넌트
 * @param {Object} newData - 새로운 데이터
 */
export function update[컴포넌트명](component, newData) {
    if (!component || !newData) return;
    
    // 제목 업데이트
    if (newData.title) {
        const titleEl = component.querySelector('.[컴포넌트]-title');
        if (titleEl) {
            titleEl.textContent = newData.title;
        }
    }
    
    // 내용 업데이트
    if (newData.content) {
        const bodyEl = component.querySelector('.[컴포넌트]-body');
        if (bodyEl) {
            if (typeof newData.content === 'string') {
                bodyEl.innerHTML = newData.content;
            } else {
                bodyEl.innerHTML = '';
                bodyEl.appendChild(newData.content);
            }
        }
    }
    
    // 이벤트 발생
    const event = new CustomEvent('[컴포넌트]Updated', {
        detail: newData,
        bubbles: true
    });
    component.dispatchEvent(event);
}

/**
 * 컴포넌트 제거
 * 
 * @param {HTMLElement} component - 제거할 컴포넌트
 */
export function destroy[컴포넌트명](component) {
    if (!component) return;
    
    // 이벤트 리스너 제거 (필요한 경우 저장된 참조 사용)
    // component.removeEventListener('click', savedClickHandler);
    
    // 애니메이션 후 제거 (선택사항)
    component.style.opacity = '0';
    component.style.transition = UI_CONFIG.transition.base;
    
    setTimeout(() => {
        component.remove();
    }, 200);
}

/**
 * 컴포넌트 유효성 검사
 * 
 * @param {Object} data - 검증할 데이터
 * @returns {boolean} 유효성 여부
 */
export function validate[컴포넌트명](data) {
    if (!data) return false;
    
    // 필수 필드 검증
    // if (!data.requiredField) {
    //     console.error('[컴포넌트명]: requiredField is required');
    //     return false;
    // }
    
    // 데이터 타입 검증
    // if (typeof data.someField !== 'string') {
    //     console.error('[컴포넌트명]: someField must be a string');
    //     return false;
    // }
    
    return true;
}

// 기본 내보내기
export default {
    create: create[컴포넌트명],
    update: update[컴포넌트명],
    destroy: destroy[컴포넌트명],
    validate: validate[컴포넌트명]
};