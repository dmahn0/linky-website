/**
 * UI/UX 설정
 * 디자인 시스템의 모든 값을 중앙에서 관리합니다.
 */

export const UI_CONFIG = {
    // 색상 팔레트
    colors: {
        // 브랜드 색상 (모던 에메랄드 그린)
        primary: '#10B981',      // 모던한 에메랄드 그린
        primaryDark: '#059669',  // 딥 에메랄드
        primaryLight: '#34D399', // 라이트 에메랄드
        secondary: '#D1FAE5',    // 아주 연한 민트
        accent: '#F0FDF4',       // 거의 보이지 않는 민트 틴트
        
        // 그레이스케일
        black: '#000000',
        white: '#ffffff',
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827'
        },
        
        // 텍스트 색상 (모던 뉴트럴 톤)
        text: {
            primary: '#0F172A',    // 딥 슬레이트
            secondary: '#64748B',  // 슬레이트 그레이
            light: '#94A3B8',      // 라이트 슬레이트
            muted: '#CBD5E1',
            disabled: '#E2E8F0'
        },
        
        // 배경 색상
        background: {
            primary: '#FFFFFF',    // 순수 흰색
            secondary: '#FAFAFA',  // 아주 연한 회색
            tertiary: '#F8FAFC',
            hover: '#F1F5F9',
            active: '#E2E8F0'
        },
        
        // 모던 테두리
        border: {
            default: '#E2E8F0',    // 연한 슬레이트 테두리
            light: '#F1F5F9',      // 아주 연한 테두리
            dark: '#CBD5E1',
            primary: '#10B981',
            focus: '#059669'
        },
        
        // 박스 배경색
        box: {
            light: '#f8fffe',
            info: '#f5f9ff',
            success: '#f0fdf4',
            warning: '#fffbeb',
            error: '#fef2f2'
        },
        
        // 상태 색상 (모던톤)
        status: {
            success: '#10B981',
            warning: '#F59E0B',
            error: '#EF4444',
            info: '#3B82F6'
        },
        
        // 시맨틱 색상
        semantic: {
            link: '#10B981',
            linkHover: '#059669',
            focus: 'rgba(16, 185, 129, 0.2)',
            selection: 'rgba(16, 185, 129, 0.1)'
        },
        
        // 그림자
        shadow: 'rgba(15, 23, 42, 0.04)'
    },
    
    // 타이포그래피
    typography: {
        // 폰트 패밀리
        fontFamily: {
            base: '"Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            logo: '"YourLogoFont", "Pretendard", sans-serif', // TODO: 실제 로고 폰트로 교체
            mono: '"Consolas", "Monaco", "Courier New", monospace'
        },
        
        // 폰트 크기
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem',// 30px
            '4xl': '2.25rem', // 36px
            '5xl': '3rem'     // 48px
        },
        
        // 폰트 굵기
        fontWeight: {
            thin: 100,
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            extrabold: 800
        },
        
        // 줄 높이
        lineHeight: {
            none: 1,
            tight: 1.25,
            snug: 1.375,
            normal: 1.5,
            relaxed: 1.625,
            loose: 2
        },
        
        // 자간
        letterSpacing: {
            tighter: '-0.05em',
            tight: '-0.025em',
            normal: '0',
            wide: '0.025em',
            wider: '0.05em',
            widest: '0.1em'
        }
    },
    
    // 간격
    spacing: {
        0: '0',
        1: '0.25rem',   // 4px
        2: '0.5rem',    // 8px
        3: '0.75rem',   // 12px
        4: '1rem',      // 16px
        5: '1.25rem',   // 20px
        6: '1.5rem',    // 24px
        8: '2rem',      // 32px
        10: '2.5rem',   // 40px
        12: '3rem',     // 48px
        16: '4rem',     // 64px
        20: '5rem',     // 80px
        24: '6rem',     // 96px
        32: '8rem',     // 128px
        40: '10rem',    // 160px
        48: '12rem',    // 192px
        56: '14rem',    // 224px
        64: '16rem'     // 256px
    },
    
    // 테두리 반경
    borderRadius: {
        none: '0',
        sm: '0.125rem',    // 2px
        base: '0.25rem',   // 4px
        md: '0.375rem',    // 6px
        lg: '0.5rem',      // 8px
        xl: '0.75rem',     // 12px
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
        full: '9999px'
    },
    
    // 그림자
    shadows: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        
        // 호버 효과용
        hover: '0 4px 12px rgba(34, 197, 94, 0.15)',
        hoverLg: '0 8px 24px rgba(34, 197, 94, 0.2)'
    },
    
    // 애니메이션
    animation: {
        // 지속 시간
        duration: {
            fast: '150ms',
            base: '300ms',
            slow: '500ms',
            slower: '700ms'
        },
        
        // 이징
        easing: {
            linear: 'linear',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
            inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
        }
    },
    
    // 반응형 브레이크포인트
    breakpoints: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
    },
    
    // z-index 레벨
    zIndex: {
        auto: 'auto',
        0: 0,
        10: 10,       // 일반 요소
        20: 20,       // 플로팅 요소
        30: 30,       // 드롭다운
        40: 40,       // 고정 헤더
        50: 50,       // 모달 백드롭
        60: 60,       // 모달
        70: 70,       // 토스트/알림
        80: 80,       // 툴팁
        90: 90,       // 로딩 오버레이
        999: 999,     // 최상위
        max: 2147483647
    },
    
    // 컴포넌트별 설정
    components: {
        // 버튼
        button: {
            height: {
                sm: '32px',
                base: '40px',
                lg: '48px'
            },
            padding: {
                sm: '0 12px',
                base: '0 16px',
                lg: '0 24px'
            },
            fontSize: {
                sm: '14px',
                base: '16px',
                lg: '18px'
            }
        },
        
        // 입력 필드
        input: {
            height: {
                sm: '32px',
                base: '40px',
                lg: '48px'
            },
            padding: '0 12px',
            borderWidth: '1px'
        },
        
        // 카드
        card: {
            padding: '24px',
            borderRadius: '8px',
            shadow: 'base'
        },
        
        // 모달
        modal: {
            width: {
                sm: '400px',
                base: '500px',
                lg: '600px',
                xl: '800px'
            },
            padding: '24px',
            borderRadius: '8px'
        },
        
        // 테이블
        table: {
            cellPadding: '12px 16px',
            borderColor: '#e5e7eb',
            hoverBg: '#f9fafb'
        }
    }
};

// 설정 고정
Object.freeze(UI_CONFIG);

// CSS 변수 생성 헬퍼
export function generateCSSVariables() {
    const cssVars = [];
    
    // 색상 변수
    Object.entries(UI_CONFIG.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
            cssVars.push(`--color-${key}: ${value};`);
        } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                cssVars.push(`--color-${key}-${subKey}: ${subValue};`);
            });
        }
    });
    
    // 간격 변수
    Object.entries(UI_CONFIG.spacing).forEach(([key, value]) => {
        cssVars.push(`--spacing-${key}: ${value};`);
    });
    
    return cssVars.join('\n');
}

export default UI_CONFIG;