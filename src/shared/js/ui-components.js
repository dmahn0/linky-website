/**
 * Linky UI Components JavaScript
 * ui-core.html 기반 중앙화된 컴포넌트 시스템
 */

// PWA 설치 관리
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const promptElement = document.getElementById('install-prompt');
    if (promptElement) {
        promptElement.classList.add('show');
    }
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('PWA 설치됨');
            }
            deferredPrompt = null;
            hideInstallPrompt();
        });
    }
}

function hideInstallPrompt() {
    const promptElement = document.getElementById('install-prompt');
    if (promptElement) {
        promptElement.classList.remove('show');
    }
}

// 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker 등록 성공:', registration.scope))
            .catch(err => console.log('ServiceWorker 등록 실패:', err));
    });
}

// UI 컴포넌트 팩토리
const UIComponents = {
    /**
     * 헤더 네비게이션 생성
     */
    createHeader: function(options = {}) {
        const { logo = 'Linky', menuItems = [], currentPath = '/', logoHref = '/' } = options;
        
        return `
            <header class="header-nav">
                <div class="header-nav-inner" style="display: flex; align-items: center; position: relative;">
                    <a href="${logoHref}" class="logo">${logo}</a>
                    <nav style="flex: 1; display: flex; justify-content: flex-end;">
                        <ul class="nav-menu" id="navMenu" style="display: flex; align-items: center; margin: 0;">
                            ${menuItems.map(item => `
                                <li><a href="${item.href}" class="${currentPath === item.href ? 'active' : ''}" ${item.onclick ? `onclick="${item.onclick}"` : ''}>${item.label}</a></li>
                            `).join('')}
                        </ul>
                    </nav>
                    <button class="nav-mobile-toggle" onclick="toggleMobileMenu()" style="display: none; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--linky-text-primary); margin-left: 20px;">☰</button>
                </div>
            </header>
            <style>
                @media (max-width: 768px) {
                    .nav-menu {
                        display: none !important;
                    }
                    .nav-menu.nav-links-mobile {
                        display: flex !important;
                        flex-direction: column;
                        position: absolute;
                        top: 100%;
                        left: 0;
                        right: 0;
                        background: white;
                        padding: 16px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        z-index: 1000;
                    }
                    .nav-menu.nav-links-mobile li {
                        width: 100%;
                        margin: 8px 0;
                    }
                    .nav-menu.nav-links-mobile a {
                        display: block;
                        padding: 12px;
                        text-align: center;
                        border-radius: 8px;
                        transition: background 0.3s;
                    }
                    .nav-menu.nav-links-mobile a:hover {
                        background: var(--linky-surface-alt);
                    }
                    .nav-mobile-toggle {
                        display: block !important;
                    }
                    .header-nav-inner {
                        position: relative;
                    }
                }
            </style>
            <script>
                function toggleMobileMenu() {
                    const navMenu = document.getElementById('navMenu');
                    navMenu.classList.toggle('nav-links-mobile');
                }
            </script>
        `;
    },
    
    /**
     * 히어로 섹션 생성
     */
    createHeroSection: function(options = {}) {
        const { 
            title = '', 
            subtitle = '', 
            buttons = [],
            className = ''
        } = options;
        
        return `
            <section class="hero-section ${className}">
                <div class="container">
                    <h1 class="hero-title">${title}</h1>
                    <p class="hero-subtitle">${subtitle}</p>
                    <div class="hero-buttons">
                        ${buttons.map(btn => `
                            <button class="btn btn-${btn.variant || 'primary'} btn-${btn.size || 'lg'}" 
                                    onclick="${btn.onClick || ''}">
                                ${btn.icon ? `<span>${btn.icon}</span>` : ''}
                                ${btn.text}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
    },
    
    /**
     * 카드 그리드 생성
     */
    createCardGrid: function(cards = []) {
        return `
            <div class="card-grid">
                ${cards.map(card => `
                    <div class="card">
                        ${card.image ? `<div class="card-image">${card.image}</div>` : ''}
                        <h3 class="card-title">${card.title}</h3>
                        <p class="card-content">${card.content}</p>
                        ${card.footer ? `
                            <div class="card-footer">
                                ${card.footer}
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * 특징 그리드 생성
     */
    createFeatureGrid: function(features = []) {
        return `
            <div class="feature-grid">
                ${features.map(feature => `
                    <div class="feature-item">
                        <div class="feature-icon">${feature.icon}</div>
                        <h3 class="feature-title">${feature.title}</h3>
                        <p class="feature-description">${feature.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    /**
     * 폼 생성
     */
    createForm: function(options = {}) {
        const { 
            id = 'form',
            fields = [],
            submitText = '제출',
            onSubmit = ''
        } = options;
        
        return `
            <form id="${id}" onsubmit="${onSubmit}; return false;">
                ${fields.map(field => `
                    <div class="form-group">
                        <label class="form-label" for="${field.id}">${field.label}</label>
                        ${field.type === 'textarea' ? `
                            <textarea 
                                id="${field.id}" 
                                class="form-textarea" 
                                placeholder="${field.placeholder || ''}"
                                ${field.required ? 'required' : ''}
                            ></textarea>
                        ` : field.type === 'select' ? `
                            <select 
                                id="${field.id}" 
                                class="form-select"
                                ${field.required ? 'required' : ''}
                            >
                                ${field.options.map(opt => `
                                    <option value="${opt.value}">${opt.label}</option>
                                `).join('')}
                            </select>
                        ` : `
                            <input 
                                type="${field.type}" 
                                id="${field.id}" 
                                class="form-input" 
                                placeholder="${field.placeholder || ''}"
                                ${field.required ? 'required' : ''}
                            >
                        `}
                    </div>
                `).join('')}
                <button type="submit" class="btn btn-primary btn-block">
                    ${submitText}
                </button>
            </form>
        `;
    },
    
    /**
     * 푸터 생성
     */
    createFooter: function(options = {}) {
        const { 
            copyright = '© 2025 Linky Platform. All rights reserved.',
            links = []
        } = options;
        
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <p>${copyright}</p>
                        ${links.length > 0 ? `
                            <div class="footer-links">
                                ${links.map(link => `
                                    <a href="${link.href}">${link.label}</a>
                                `).join(' | ')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </footer>
        `;
    },
    
    /**
     * PWA 설치 프롬프트 생성
     */
    createInstallPrompt: function() {
        return `
            <div id="install-prompt" class="install-prompt">
                <span>앱으로 설치하시겠습니까?</span>
                <button class="btn btn-secondary btn-sm" onclick="installPWA()">설치</button>
                <button class="btn btn-ghost btn-sm" onclick="hideInstallPrompt()">나중에</button>
            </div>
        `;
    }
};

// 전역 노출
window.UIComponents = UIComponents;
window.installPWA = installPWA;
window.hideInstallPrompt = hideInstallPrompt;