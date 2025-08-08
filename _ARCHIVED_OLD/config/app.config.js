/**
 * 애플리케이션 전체 설정
 * 모든 설정값은 이곳에서 중앙 관리됩니다.
 */

export const APP_CONFIG = {
    // 앱 기본 정보
    app: {
        name: 'Linky Platform',
        shortName: 'Linky',
        version: '1.0.0',
        description: '무인공간 운영자와 정리 파트너를 연결하는 온디맨드 매칭 플랫폼',
        author: 'Linky Korea',
        copyright: '© 2025 Linky Korea. All rights reserved.'
    },
    
    // 환경 설정
    environment: {
        // TODO: 실제 배포 시 환경변수로 관리
        mode: 'development', // development, staging, production
        debug: true,
        logLevel: 'info' // error, warn, info, debug
    },
    
    // 언어 및 지역
    locale: {
        default: 'ko-KR',
        supported: ['ko-KR', 'en-US'],
        timezone: 'Asia/Seoul',
        currency: 'KRW',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm'
    },
    
    // 인증 설정
    auth: {
        sessionTimeout: 60 * 60 * 1000, // 1시간 (밀리초)
        refreshThreshold: 5 * 60 * 1000, // 5분 전 갱신
        rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30일
        maxLoginAttempts: 5,
        lockoutDuration: 30 * 60 * 1000 // 30분
    },
    
    // 페이지 설정
    pages: {
        itemsPerPage: 20,
        maxPageSize: 100,
        defaultSort: 'created_at',
        defaultOrder: 'desc'
    },
    
    // 파일 업로드
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 10,
        allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedDocTypes: ['application/pdf'],
        imageQuality: 0.8,
        thumbnailSize: { width: 200, height: 200 }
    },
    
    // 알림 설정
    notifications: {
        position: 'top-right',
        duration: 5000, // 5초
        maxStack: 3
    },
    
    // 검증 규칙
    validation: {
        password: {
            minLength: 6,
            maxLength: 128,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false
        },
        phone: {
            pattern: /^010-?\d{4}-?\d{4}$/,
            example: '010-1234-5678'
        },
        businessNumber: {
            pattern: /^\d{3}-\d{2}-\d{5}$/,
            example: '123-45-67890'
        }
    },
    
    // 비즈니스 로직
    business: {
        platformFeeRate: 0.2, // 20%
        minJobPrice: 10000, // 최소 작업 가격
        maxJobPrice: 1000000, // 최대 작업 가격
        cancellationGracePeriod: 24 * 60 * 60 * 1000, // 24시간
        cancellationFeeRate: 0.2, // 20%
        ratingUpdateDelay: 24 * 60 * 60 * 1000 // 24시간 후 평점 반영
    },
    
    // 파트너 설정
    partners: {
        levels: {
            bronze: { name: '브론즈', minRating: 0, minJobs: 0 },
            silver: { name: '실버', minRating: 4.0, minJobs: 10 },
            gold: { name: '골드', minRating: 4.5, minJobs: 50 },
            platinum: { name: '플래티넘', minRating: 4.8, minJobs: 100 }
        },
        workAreaLimit: 5, // 최대 활동 지역 수
        withdrawalMinAmount: 10000 // 최소 출금 금액
    },
    
    // 지도 설정
    map: {
        defaultCenter: { lat: 37.5665, lng: 126.9780 }, // 서울시청
        defaultZoom: 11,
        maxZoom: 18,
        minZoom: 8
    },
    
    // 외부 서비스 (개발/프로덕션 구분)
    external: {
        googleAnalytics: {
            // TODO: 실제 GA ID로 교체
            trackingId: 'G-XXXXXXXXXX',
            enabled: false // 프로덕션에서만 true
        },
        kakao: {
            // TODO: 실제 앱 키로 교체
            appKey: 'YOUR_KAKAO_APP_KEY',
            enabled: false
        },
        supabase: {
            // TODO: 실제 Supabase 프로젝트 정보로 교체
            url: 'https://your-project-id.supabase.co',
            anonKey: 'your-anon-key-here',
            serviceRoleKey: 'your-service-role-key-here', // 서버사이드 전용
            enabled: true
        }
    },
    
    // 개발자 도구
    dev: {
        enableMockData: true,
        showDebugInfo: true,
        logApiCalls: true,
        bypassAuth: false // 절대 프로덕션에서 true 금지!
    }
};

// 환경별 설정 오버라이드
if (APP_CONFIG.environment.mode === 'production') {
    APP_CONFIG.environment.debug = false;
    APP_CONFIG.dev.enableMockData = false;
    APP_CONFIG.dev.showDebugInfo = false;
    APP_CONFIG.dev.logApiCalls = false;
    APP_CONFIG.dev.bypassAuth = false;
    APP_CONFIG.external.googleAnalytics.enabled = true;
}

// 설정 고정 (실수로 변경 방지)
Object.freeze(APP_CONFIG);

export default APP_CONFIG;