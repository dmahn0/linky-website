// Google Analytics 관련 함수들

// 이벤트 트래킹
function trackEvent(category, action, label = null, value = null) {
    if (typeof gtag !== 'undefined') {
        const eventParams = {
            event_category: category,
            event_label: label,
            value: value
        };
        
        // null 값 제거
        Object.keys(eventParams).forEach(key => {
            if (eventParams[key] === null) {
                delete eventParams[key];
            }
        });
        
        gtag('event', action, eventParams);
        console.log('Event tracked:', category, action, label);
    }
}

// 버튼 클릭 트래킹
function trackButtonClick(buttonName, location = 'unknown') {
    trackEvent('Button', 'click', `${buttonName}_${location}`);
}

// 스크롤 깊이 트래킹
let scrollDepthTracked = {
    25: false,
    50: false,
    75: false,
    100: false
};

function initScrollDepthTracking() {
    window.addEventListener('scroll', () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const scrollPercentage = Math.round((scrolled / scrollHeight) * 100);
        
        // 25%, 50%, 75%, 100% 지점 트래킹
        [25, 50, 75, 100].forEach(depth => {
            if (scrollPercentage >= depth && !scrollDepthTracked[depth]) {
                scrollDepthTracked[depth] = true;
                trackEvent('Scroll', 'depth', `${depth}%`);
            }
        });
    });
}

// 페이지 체류 시간 트래킹
let pageStartTime = Date.now();

function trackTimeOnPage() {
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
        trackEvent('Engagement', 'time_on_page', window.location.pathname, timeOnPage);
    });
}

// 외부 링크 클릭 트래킹
function initExternalLinkTracking() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link && link.href && !link.href.startsWith(window.location.origin)) {
            trackEvent('Outbound', 'click', link.href);
        }
    });
}

// 폼 제출 트래킹
function trackFormSubmit(formName, formData = {}) {
    trackEvent('Form', 'submit', formName);
    
    // 추가 데이터가 있으면 별도 이벤트로 전송
    if (Object.keys(formData).length > 0) {
        gtag('event', 'form_submit_details', {
            form_name: formName,
            ...formData
        });
    }
}

// 에러 트래킹
window.addEventListener('error', (e) => {
    trackEvent('Error', 'javascript', `${e.message} at ${e.filename}:${e.lineno}`);
});

// 페이지 로드 시 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    initScrollDepthTracking();
    trackTimeOnPage();
    initExternalLinkTracking();
});