/**
 * Linky UI Component Library - Main Entry Point
 * Version: 1.0.0
 * 
 * This is the centralized JavaScript component library for the Linky platform.
 * Import this file to get access to all UI components.
 */

// Core UI Components
export { createButton, createCard, createAlert, createModal, createForm } from './ui/index.js';

// Extended Components
export { Modal } from './ui/modal.js';
export { Dropdown, initDropdowns } from './ui/dropdown.js';

// Web Components (lazy load)
export async function loadWebComponents() {
    await import('./web-components/linky-button.js');
    await import('./web-components/linky-card.js');
    console.log('Linky Web Components loaded');
}

// Initialize all components
export function initLinkyUI() {
    // Initialize dropdowns
    initDropdowns();
    
    // Add other auto-initializations here
    console.log('Linky UI initialized');
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLinkyUI);
    } else {
        initLinkyUI();
    }
}

// Utility functions
export const LinkyUI = {
    /**
     * Show a notification toast
     */
    toast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 right-0 m-lg animate-slide-in`;
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex align-center gap-sm">
                <span>${message}</span>
                <button class="alert-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.add('animate-fade-out');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
        
        return toast;
    },
    
    /**
     * Confirm dialog
     */
    async confirm(message, title = '확인') {
        const { Modal } = await import('./ui/modal.js');
        return Modal.confirm(message, title);
    },
    
    /**
     * Alert dialog
     */
    async alert(message, title = '알림') {
        const { Modal } = await import('./ui/modal.js');
        return Modal.alert(message, title);
    },
    
    /**
     * Prompt dialog
     */
    async prompt(message, title = '입력', defaultValue = '') {
        const { Modal } = await import('./ui/modal.js');
        return Modal.prompt(message, title, defaultValue);
    },
    
    /**
     * Show loading overlay
     */
    showLoading(message = '로딩 중...') {
        let overlay = document.getElementById('linky-loading-overlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'linky-loading-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            `;
            overlay.innerHTML = `
                <div style="background: white; padding: 32px; border-radius: 12px; text-align: center;">
                    <div class="spinner spinner-lg mb-md"></div>
                    <div>${message}</div>
                </div>
            `;
        }
        
        document.body.appendChild(overlay);
        return overlay;
    },
    
    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('linky-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    },
    
    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'KRW') {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(amount);
    },
    
    /**
     * Format date
     */
    formatDate(date, format = 'short') {
        const d = new Date(date);
        
        if (format === 'short') {
            return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(d);
        } else if (format === 'long') {
            return new Intl.DateTimeFormat('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            }).format(d);
        } else if (format === 'time') {
            return new Intl.DateTimeFormat('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(d);
        }
        
        return d.toLocaleString('ko-KR');
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// Export as default
export default LinkyUI;