/**
 * API 설정 및 엔드포인트 정의
 * 모든 API 관련 설정을 중앙에서 관리합니다.
 */

// Supabase 기반 API 설정
const SUPABASE_URLS = {
    development: 'https://your-dev-project.supabase.co',
    staging: 'https://your-staging-project.supabase.co',
    production: 'https://your-prod-project.supabase.co'
};

// 현재 환경 (TODO: 환경변수에서 가져오도록 수정)
const CURRENT_ENV = 'development';

export const API_CONFIG = {
    // Supabase 기본 설정
    SUPABASE_URL: SUPABASE_URLS[CURRENT_ENV],
    SUPABASE_ANON_KEY: 'your-anon-key', // TODO: 환경변수로 이동
    SUPABASE_SERVICE_ROLE_KEY: 'your-service-role-key', // TODO: 환경변수로 이동
    
    // REST API 설정 (Supabase REST API)
    BASE_URL: `${SUPABASE_URLS[CURRENT_ENV]}/rest/v1`,
    TIMEOUT: 30000, // 30초
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000, // 1초
    
    // 헤더 설정 (Supabase 전용)
    DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': '1.0.0',
        'apikey': 'your-anon-key', // TODO: 환경변수로 이동
        'Prefer': 'return=representation'
    },
    
    // Supabase 인증 헤더
    getAuthHeaders: (token) => ({
        'Authorization': `Bearer ${token}`,
        'apikey': 'your-anon-key' // TODO: 환경변수로 이동
    }),
    
    // Supabase 특화 설정
    SUPABASE: {
        REALTIME_URL: `${SUPABASE_URLS[CURRENT_ENV]}/realtime/v1`,
        AUTH_URL: `${SUPABASE_URLS[CURRENT_ENV]}/auth/v1`,
        STORAGE_URL: `${SUPABASE_URLS[CURRENT_ENV]}/storage/v1`,
        EDGE_FUNCTIONS_URL: `${SUPABASE_URLS[CURRENT_ENV]}/functions/v1`
    }
};

// Supabase 테이블 및 엔드포인트 정의
export const API_ENDPOINTS = {
    // Supabase 인증 (Auth API)
    AUTH: {
        SIGN_UP: '/auth/signup',
        SIGN_IN: '/auth/signin',
        SIGN_OUT: '/auth/signout',
        REFRESH: '/auth/refresh',
        VERIFY_EMAIL: '/auth/verify',
        RESET_PASSWORD: '/auth/recover',
        UPDATE_USER: '/auth/user'
    },
    
    // Supabase 테이블 (REST API)
    TABLES: {
        BUSINESS_USERS: '/business_users',
        PARTNERS_USERS: '/partners_users', 
        SPACES: '/spaces',
        JOBS: '/jobs',
        RATINGS: '/ratings',
        NOTIFICATIONS: '/notifications',
        TRANSACTIONS: '/transactions'
    },
    
    // 비즈니스 사용자
    BUSINESS: {
        PROFILE: '/business/profile',
        UPDATE_PROFILE: '/business/profile',
        SPACES: '/business/spaces',
        SPACE_DETAIL: '/business/spaces/:id',
        CREATE_SPACE: '/business/spaces',
        UPDATE_SPACE: '/business/spaces/:id',
        DELETE_SPACE: '/business/spaces/:id',
        JOBS: '/business/jobs',
        JOB_DETAIL: '/business/jobs/:id',
        CREATE_JOB: '/business/jobs',
        UPDATE_JOB: '/business/jobs/:id',
        CANCEL_JOB: '/business/jobs/:id/cancel',
        BILLINGS: '/business/billings',
        BILLING_DETAIL: '/business/billings/:id',
        STATISTICS: '/business/statistics'
    },
    
    // 파트너 사용자
    PARTNERS: {
        PROFILE: '/partners/profile',
        UPDATE_PROFILE: '/partners/profile',
        AVAILABLE_JOBS: '/partners/jobs',
        JOB_DETAIL: '/partners/jobs/:id',
        APPLY_JOB: '/partners/jobs/:id/apply',
        START_JOB: '/partners/jobs/:id/start',
        COMPLETE_JOB: '/partners/jobs/:id/complete',
        MY_JOBS: '/partners/my-jobs',
        EARNINGS: '/partners/earnings',
        WITHDRAW: '/partners/withdraw',
        STATISTICS: '/partners/statistics'
    },
    
    // 관리자
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        USERS: '/admin/users',
        USER_DETAIL: '/admin/users/:id',
        APPROVE_USER: '/admin/users/:id/approve',
        SUSPEND_USER: '/admin/users/:id/suspend',
        JOBS: '/admin/jobs',
        JOB_DETAIL: '/admin/jobs/:id',
        SETTLEMENTS: '/admin/settlements',
        REPORTS: '/admin/reports',
        SETTINGS: '/admin/settings'
    },
    
    // 공통
    COMMON: {
        NOTIFICATIONS: '/notifications',
        NOTIFICATION_DETAIL: '/notifications/:id',
        MARK_AS_READ: '/notifications/:id/read',
        NOTIFICATION_SETTINGS: '/notification-settings',
        UPLOAD_IMAGE: '/upload/image',
        REGIONS: '/regions',
        CATEGORIES: '/categories',
        FAQ: '/faq',
        TERMS: '/terms',
        PRIVACY: '/privacy'
    },
    
    // 외부 API
    EXTERNAL: {
        KAKAO_ADDRESS: 'https://dapi.kakao.com/v2/local/search/address.json',
        KAKAO_COORD: 'https://dapi.kakao.com/v2/local/geo/coord2address.json',
        PAYMENT_GATEWAY: 'https://api.tosspayments.com/v1',
        SMS_GATEWAY: 'https://api.coolsms.co.kr/v2'
    }
};

/**
 * URL 파라미터 치환 헬퍼
 * @param {string} endpoint - 엔드포인트 템플릿
 * @param {Object} params - 파라미터 객체
 * @returns {string} 완성된 URL
 * 
 * @example
 * replaceUrlParams('/users/:id', { id: 123 }) => '/users/123'
 */
export function replaceUrlParams(endpoint, params = {}) {
    let url = endpoint;
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`:${key}`, value);
    });
    return url;
}

/**
 * 전체 URL 생성 헬퍼
 * @param {string} endpoint - 엔드포인트
 * @returns {string} 전체 URL
 */
export function getFullUrl(endpoint) {
    if (endpoint.startsWith('http')) {
        return endpoint;
    }
    return `${API_CONFIG.BASE_URL}${endpoint}`;
}

/**
 * API 에러 코드 정의
 */
export const API_ERROR_CODES = {
    // 인증 관련
    UNAUTHORIZED: 'UNAUTHORIZED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    
    // 검증 관련
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    
    // 비즈니스 로직
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    JOB_ALREADY_TAKEN: 'JOB_ALREADY_TAKEN',
    CANCELLATION_NOT_ALLOWED: 'CANCELLATION_NOT_ALLOWED',
    
    // 시스템
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// 설정 고정
Object.freeze(API_CONFIG);
Object.freeze(API_ENDPOINTS);
Object.freeze(API_ERROR_CODES);

export default {
    API_CONFIG,
    API_ENDPOINTS,
    API_ERROR_CODES,
    replaceUrlParams,
    getFullUrl
};