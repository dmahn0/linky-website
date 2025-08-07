/**
 * API Configuration for Linky Platform
 * Supabase 및 외부 API 설정
 */

export const API_CONFIG = {
  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  
  // API Endpoints
  BASE_URL: process.env.API_BASE_URL || '/api',
  
  // API Routes
  routes: {
    // Auth
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      signup: '/auth/signup',
      refresh: '/auth/refresh',
      verify: '/auth/verify'
    },
    
    // Business
    business: {
      dashboard: '/business/dashboard',
      spaces: '/business/spaces',
      jobs: '/business/jobs',
      billing: '/business/billing',
      analytics: '/business/analytics'
    },
    
    // Partner
    partner: {
      dashboard: '/partner/dashboard',
      jobs: '/partner/jobs',
      earnings: '/partner/earnings',
      profile: '/partner/profile'
    },
    
    // Common
    common: {
      notifications: '/notifications',
      messages: '/messages',
      support: '/support'
    }
  },
  
  // API Headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout
  timeout: 30000, // 30 seconds
  
  // Retry Configuration
  retry: {
    maxAttempts: 3,
    delay: 1000,
    multiplier: 2
  },
  
  // Error Messages
  errorMessages: {
    network: '네트워크 연결을 확인해주세요.',
    timeout: '요청 시간이 초과되었습니다.',
    server: '서버 오류가 발생했습니다.',
    unauthorized: '인증이 필요합니다.',
    forbidden: '접근 권한이 없습니다.'
  }
};

// API Helper Functions
export const apiHelpers = {
  /**
   * Build full API URL
   */
  buildUrl: (route) => {
    return `${API_CONFIG.BASE_URL}${route}`;
  },
  
  /**
   * Get headers with auth token
   */
  getHeaders: (token) => {
    return {
      ...API_CONFIG.headers,
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },
  
  /**
   * Handle API errors
   */
  handleError: (error) => {
    if (error.code === 'NETWORK_ERROR') {
      return API_CONFIG.errorMessages.network;
    }
    if (error.code === 'TIMEOUT') {
      return API_CONFIG.errorMessages.timeout;
    }
    if (error.status === 401) {
      return API_CONFIG.errorMessages.unauthorized;
    }
    if (error.status === 403) {
      return API_CONFIG.errorMessages.forbidden;
    }
    if (error.status >= 500) {
      return API_CONFIG.errorMessages.server;
    }
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }
};