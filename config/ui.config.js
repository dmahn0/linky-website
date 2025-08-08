/**
 * UI Configuration for Linky Platform
 * Based on Linky Design System
 */

export const UI_CONFIG = {
  // 색상 시스템
  colors: {
    // Primary Colors
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    
    // Neutral Colors
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textLight: '#94A3B8',
    
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFAFA',
    
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // System Colors
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6'
  },
  
  // 스페이싱 시스템 (8px 기반)
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
    '5xl': '96px'
  },
  
  // Border Radius
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    full: '9999px'
  },
  
  // Shadow
  shadow: {
    sm: '0 1px 3px rgba(15, 23, 42, 0.04)',
    md: '0 4px 12px rgba(15, 23, 42, 0.06)',
    lg: '0 8px 24px rgba(15, 23, 42, 0.08)',
    xl: '0 20px 40px rgba(15, 23, 42, 0.10)',
    '2xl': '0 25px 50px rgba(15, 23, 42, 0.12)'
  },
  
  // Transition
  transition: {
    fast: '0.15s ease',
    base: '0.2s ease',
    slow: '0.3s ease'
  },
  
  // Typography
  typography: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    
    display: {
      large: { size: '72px', weight: 700, lineHeight: 1 },
      medium: { size: '64px', weight: 700, lineHeight: 1.1 },
      small: { size: '56px', weight: 700, lineHeight: 1.2 }
    },
    
    heading: {
      h1: { size: '48px', weight: 700, lineHeight: 1.2 },
      h2: { size: '36px', weight: 700, lineHeight: 1.3 },
      h3: { size: '28px', weight: 600, lineHeight: 1.4 },
      h4: { size: '24px', weight: 600, lineHeight: 1.4 },
      h5: { size: '20px', weight: 600, lineHeight: 1.5 },
      h6: { size: '18px', weight: 600, lineHeight: 1.5 }
    },
    
    body: {
      large: { size: '18px', weight: 400, lineHeight: 1.7 },
      regular: { size: '16px', weight: 400, lineHeight: 1.6 },
      small: { size: '14px', weight: 400, lineHeight: 1.6 }
    },
    
    support: {
      caption: { size: '13px', weight: 400, lineHeight: 1.5 },
      overline: { size: '12px', weight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' },
      label: { size: '14px', weight: 500, lineHeight: 1.4 }
    }
  },
  
  // Breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1200px'
  }
};

// CSS 변수로 내보내기
export function applyTheme() {
  const root = document.documentElement;
  
  // Colors
  Object.entries(UI_CONFIG.colors).forEach(([key, value]) => {
    root.style.setProperty(`--linky-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value);
  });
  
  // Spacing
  Object.entries(UI_CONFIG.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
  
  // Radius
  Object.entries(UI_CONFIG.radius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });
  
  // Shadow
  Object.entries(UI_CONFIG.shadow).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });
  
  // Transition
  Object.entries(UI_CONFIG.transition).forEach(([key, value]) => {
    root.style.setProperty(`--transition-${key}`, value);
  });
}