// Supabase Configuration
const SUPABASE_URL = 'https://mzihuflrbspvyjknxlad.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16aWh1ZmxyYnNwdnlqa254bGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MTk3ODgsImV4cCI6MjA2ODM5NTc4OH0.UDwv6eknjWwmbZ9WsRioi3J23_1az9O1pJFlnKgQ88s';

// UI Configuration
const UI_CONFIG = {
    colors: {
        primary: '#22c55e',      // 링키 그린
        secondary: '#16a34a',
        background: '#ffffff',
        text: '#1a1a1a',
        textLight: '#666666',
        border: '#e5e7eb',
        cardBg: '#f8fafc',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e'
    },
    fonts: {
        primary: 'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    borderRadius: {
        small: '4px',
        medium: '8px',
        large: '12px'
    },
    shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 15px rgba(0, 0, 0, 0.1)'
    }
};

// API Configuration
const API_CONFIG = {
    baseUrl: SUPABASE_URL,
    timeout: 10000,
    retryAttempts: 3
};

// Routes Configuration
const ROUTES = {
    business: {
        login: '/src/business/index.html',
        dashboard: '/src/business/dashboard.html',
        spaces: '/src/business/spaces.html',
        jobs: '/src/business/jobs.html',
        profile: '/src/business/profile.html'
    },
    partners: {
        login: '/src/partners/index.html',
        dashboard: '/src/partners/dashboard.html',
        jobs: '/src/partners/jobs.html',
        earnings: '/src/partners/earnings.html',
        profile: '/src/partners/profile.html'
    },
    landing: '/src/landing/index.html'
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
        UI_CONFIG,
        API_CONFIG,
        ROUTES
    };
}