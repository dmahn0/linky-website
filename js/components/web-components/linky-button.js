/**
 * Linky Button Web Component
 * Usage: <linky-button variant="primary" size="lg">Click me</linky-button>
 */

class LinkyButton extends HTMLElement {
    static get observedAttributes() {
        return ['variant', 'size', 'disabled', 'loading', 'icon'];
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.render();
        this.attachEvents();
    }
    
    disconnectedCallback() {
        this.removeEvents();
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }
    
    render() {
        const variant = this.getAttribute('variant') || 'primary';
        const size = this.getAttribute('size') || 'md';
        const disabled = this.hasAttribute('disabled');
        const loading = this.hasAttribute('loading');
        const icon = this.getAttribute('icon');
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                
                button {
                    padding: ${this.getSizePadding(size)};
                    border: none;
                    border-radius: 8px;
                    font-size: ${this.getSizeFontSize(size)};
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    text-align: center;
                    font-family: 'Pretendard', -apple-system, sans-serif;
                    position: relative;
                    overflow: hidden;
                    ${this.getVariantStyles(variant)}
                }
                
                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    ${this.getVariantHoverStyles(variant)}
                }
                
                .icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid currentColor;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .content {
                    ${loading ? 'visibility: hidden;' : ''}
                }
            </style>
            
            <button ${disabled ? 'disabled' : ''}>
                ${loading ? '<span class="spinner"></span>' : ''}
                <span class="content">
                    ${icon ? `<span class="icon">${icon}</span>` : ''}
                    <slot></slot>
                </span>
            </button>
        `;
    }
    
    getSizePadding(size) {
        const sizes = {
            sm: '6px 12px',
            md: '10px 24px',
            lg: '14px 36px',
            xl: '18px 48px'
        };
        return sizes[size] || sizes.md;
    }
    
    getSizeFontSize(size) {
        const sizes = {
            sm: '12px',
            md: '14px',
            lg: '16px',
            xl: '18px'
        };
        return sizes[size] || sizes.md;
    }
    
    getVariantStyles(variant) {
        const styles = {
            primary: `
                background: #10B981;
                color: white;
            `,
            secondary: `
                background: white;
                color: #10B981;
                border: 2px solid #10B981;
            `,
            danger: `
                background: #EF4444;
                color: white;
            `,
            ghost: `
                background: transparent;
                color: #0F172A;
            `,
            white: `
                background: white;
                color: #10B981;
                box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
            `
        };
        return styles[variant] || styles.primary;
    }
    
    getVariantHoverStyles(variant) {
        const styles = {
            primary: `
                background: #059669;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            `,
            secondary: `
                background: #F0FDF4;
            `,
            danger: `
                background: #DC2626;
                box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            `,
            ghost: `
                background: #FAFAFA;
            `,
            white: `
                box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
            `
        };
        return styles[variant] || styles.primary;
    }
    
    attachEvents() {
        this.button = this.shadowRoot.querySelector('button');
        
        // Forward click events
        this.button.addEventListener('click', (e) => {
            if (!this.hasAttribute('disabled') && !this.hasAttribute('loading')) {
                this.dispatchEvent(new CustomEvent('click', {
                    bubbles: true,
                    composed: true,
                    detail: { originalEvent: e }
                }));
            }
        });
    }
    
    removeEvents() {
        if (this.button) {
            this.button.removeEventListener('click', this.clickHandler);
        }
    }
    
    // Public methods
    setLoading(loading) {
        if (loading) {
            this.setAttribute('loading', '');
        } else {
            this.removeAttribute('loading');
        }
    }
    
    setDisabled(disabled) {
        if (disabled) {
            this.setAttribute('disabled', '');
        } else {
            this.removeAttribute('disabled');
        }
    }
}

// Register the component
customElements.define('linky-button', LinkyButton);

export default LinkyButton;