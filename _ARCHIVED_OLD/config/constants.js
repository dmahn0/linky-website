/**
 * 애플리케이션 상수 정의
 * 변하지 않는 값들을 중앙에서 관리합니다.
 */

// 사용자 타입
export const USER_TYPES = {
    BUSINESS: 'business',
    PARTNER: 'partner',
    ADMIN: 'admin'
};

// 사용자 상태
export const USER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    SUSPENDED: 'suspended',
    DELETED: 'deleted'
};

// 작업 상태
export const JOB_STATUS = {
    DRAFT: 'draft',
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    VERIFIED: 'verified',
    CANCELLED: 'cancelled',
    DISPUTED: 'disputed'
};

// 작업 타입
export const JOB_TYPES = {
    CLEANING: 'cleaning',
    MAINTENANCE: 'maintenance',
    INSPECTION: 'inspection',
    DELIVERY: 'delivery',
    SETUP: 'setup',
    OTHER: 'other'
};

// 공간 타입
export const SPACE_TYPES = {
    OFFICE: 'office',
    RETAIL: 'retail',
    WAREHOUSE: 'warehouse',
    FACTORY: 'factory',
    STUDYROOM: 'studyroom',
    PARTYROOM: 'partyroom',
    OTHER: 'other'
};

// 비즈니스 타입
export const BUSINESS_TYPES = {
    STUDYROOM: 'studyroom',
    PARTYROOM: 'partyroom',
    UNMANNED: 'unmanned',
    OFFICE: 'office',
    WAREHOUSE: 'warehouse',
    FACTORY: 'factory',
    OTHER: 'other'
};

// 파트너 레벨
export const PARTNER_LEVELS = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum'
};

// 결제 상태
export const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
};

// 알림 타입
export const NOTIFICATION_TYPES = {
    SYSTEM: 'system',
    NEW_JOB: 'new_job',
    JOB_ASSIGNED: 'job_assigned',
    JOB_STARTED: 'job_started',
    JOB_COMPLETED: 'job_completed',
    JOB_CANCELLED: 'job_cancelled',
    PAYMENT_RECEIVED: 'payment_received',
    PAYMENT_SENT: 'payment_sent',
    REVIEW_RECEIVED: 'review_received',
    MESSAGE: 'message',
    PROMOTION: 'promotion'
};

// 청소 주기
export const CLEANING_FREQUENCY = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    BIWEEKLY: 'biweekly',
    MONTHLY: 'monthly',
    CUSTOM: 'custom'
};

// 요일
export const WEEKDAYS = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6
};

// 요일 한글명
export const WEEKDAY_NAMES = {
    0: '일요일',
    1: '월요일',
    2: '화요일',
    3: '수요일',
    4: '목요일',
    5: '금요일',
    6: '토요일'
};

// 정렬 옵션
export const SORT_OPTIONS = {
    CREATED_AT_DESC: { field: 'created_at', order: 'desc', label: '최신순' },
    CREATED_AT_ASC: { field: 'created_at', order: 'asc', label: '오래된순' },
    PRICE_DESC: { field: 'price', order: 'desc', label: '가격 높은순' },
    PRICE_ASC: { field: 'price', order: 'asc', label: '가격 낮은순' },
    RATING_DESC: { field: 'rating', order: 'desc', label: '평점 높은순' },
    DISTANCE_ASC: { field: 'distance', order: 'asc', label: '거리순' }
};

// 페이지 크기 옵션
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 정규 표현식 패턴
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^010-?\d{4}-?\d{4}$/,
    BUSINESS_NUMBER: /^\d{3}-\d{2}-\d{5}$/,
    PASSWORD: /^.{6,}$/, // 최소 6자
    KOREAN_NAME: /^[가-힣]{2,10}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    URL: /^https?:\/\/.+/
};

// 에러 메시지
export const ERROR_MESSAGES = {
    // 공통
    REQUIRED_FIELD: '필수 입력 항목입니다',
    INVALID_FORMAT: '올바른 형식이 아닙니다',
    NETWORK_ERROR: '네트워크 오류가 발생했습니다',
    SERVER_ERROR: '서버 오류가 발생했습니다',
    UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
    
    // 인증
    INVALID_CREDENTIALS: '이메일 또는 비밀번호가 일치하지 않습니다',
    ACCOUNT_NOT_FOUND: '등록되지 않은 계정입니다',
    ACCOUNT_SUSPENDED: '정지된 계정입니다',
    SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요',
    
    // 검증
    INVALID_EMAIL: '올바른 이메일 형식이 아닙니다',
    INVALID_PHONE: '올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)',
    INVALID_BUSINESS_NUMBER: '올바른 사업자등록번호 형식이 아닙니다 (예: 123-45-67890)',
    PASSWORD_TOO_SHORT: '비밀번호는 최소 6자 이상이어야 합니다',
    PASSWORDS_NOT_MATCH: '비밀번호가 일치하지 않습니다',
    
    // 비즈니스 로직
    DUPLICATE_EMAIL: '이미 사용 중인 이메일입니다',
    DUPLICATE_PHONE: '이미 등록된 전화번호입니다',
    DUPLICATE_BUSINESS_NUMBER: '이미 등록된 사업자등록번호입니다',
    JOB_NOT_FOUND: '작업을 찾을 수 없습니다',
    ALREADY_APPLIED: '이미 지원한 작업입니다',
    CANNOT_CANCEL: '취소할 수 없는 상태입니다',
    INSUFFICIENT_BALANCE: '잔액이 부족합니다'
};

// 성공 메시지
export const SUCCESS_MESSAGES = {
    // 공통
    SAVED: '저장되었습니다',
    DELETED: '삭제되었습니다',
    UPDATED: '수정되었습니다',
    
    // 인증
    LOGIN_SUCCESS: '로그인되었습니다',
    LOGOUT_SUCCESS: '로그아웃되었습니다',
    REGISTER_SUCCESS: '회원가입이 완료되었습니다',
    
    // 작업
    JOB_CREATED: '작업이 등록되었습니다',
    JOB_APPLIED: '작업에 지원했습니다',
    JOB_COMPLETED: '작업이 완료되었습니다',
    
    // 리뷰
    REVIEW_SUBMITTED: '리뷰가 등록되었습니다'
};

// 확인 메시지
export const CONFIRM_MESSAGES = {
    DELETE: '정말 삭제하시겠습니까?',
    CANCEL: '작업을 취소하시겠습니까?',
    LOGOUT: '로그아웃하시겠습니까?',
    SAVE_DRAFT: '작성 중인 내용을 저장하시겠습니까?',
    LEAVE_PAGE: '작성 중인 내용이 있습니다. 페이지를 나가시겠습니까?'
};

// 플레이스홀더
export const PLACEHOLDERS = {
    EMAIL: '이메일을 입력하세요',
    PASSWORD: '비밀번호를 입력하세요',
    PHONE: '010-1234-5678',
    BUSINESS_NUMBER: '123-45-67890',
    SEARCH: '검색어를 입력하세요',
    SELECT: '선택하세요',
    PRICE: '가격을 입력하세요',
    DESCRIPTION: '상세 설명을 입력하세요'
};

// 라벨
export const LABELS = {
    // 공통
    REQUIRED: '필수',
    OPTIONAL: '선택',
    
    // 버튼
    SAVE: '저장',
    CANCEL: '취소',
    DELETE: '삭제',
    EDIT: '수정',
    CONFIRM: '확인',
    CLOSE: '닫기',
    SEARCH: '검색',
    RESET: '초기화',
    APPLY: '적용',
    BACK: '뒤로',
    NEXT: '다음',
    PREVIOUS: '이전',
    
    // 상태
    LOADING: '로딩 중...',
    NO_DATA: '데이터가 없습니다',
    ERROR: '오류가 발생했습니다'
};

// 모든 상수 고정
Object.freeze(USER_TYPES);
Object.freeze(USER_STATUS);
Object.freeze(JOB_STATUS);
Object.freeze(JOB_TYPES);
Object.freeze(SPACE_TYPES);
Object.freeze(BUSINESS_TYPES);
Object.freeze(PARTNER_LEVELS);
Object.freeze(PAYMENT_STATUS);
Object.freeze(NOTIFICATION_TYPES);
Object.freeze(CLEANING_FREQUENCY);
Object.freeze(WEEKDAYS);
Object.freeze(WEEKDAY_NAMES);
Object.freeze(SORT_OPTIONS);
Object.freeze(PAGE_SIZE_OPTIONS);
Object.freeze(REGEX_PATTERNS);
Object.freeze(ERROR_MESSAGES);
Object.freeze(SUCCESS_MESSAGES);
Object.freeze(CONFIRM_MESSAGES);
Object.freeze(PLACEHOLDERS);
Object.freeze(LABELS);

export default {
    USER_TYPES,
    USER_STATUS,
    JOB_STATUS,
    JOB_TYPES,
    SPACE_TYPES,
    BUSINESS_TYPES,
    PARTNER_LEVELS,
    PAYMENT_STATUS,
    NOTIFICATION_TYPES,
    CLEANING_FREQUENCY,
    WEEKDAYS,
    WEEKDAY_NAMES,
    SORT_OPTIONS,
    PAGE_SIZE_OPTIONS,
    REGEX_PATTERNS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    CONFIRM_MESSAGES,
    PLACEHOLDERS,
    LABELS
};