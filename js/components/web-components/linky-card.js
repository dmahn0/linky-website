/**
 * Linky Card Web Component
 * Usage: 
 * <linky-card hoverable>
 *   <h3 slot="header">Card Title</h3>
 *   <div slot="body">Card content</div>
 *   <div slot="footer">Card footer</div>
 * </linky-card>
 */

class LinkyCard extends HTMLElement {
    static get observedAttributes() {
        return ['hoverable', 'variant', 'clickable'];
    }
    
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    
    connectedCallback() {
        this.render();
        if (this.hasAttribute('clickable')) {
            this.style.cursor = 'pointer';
        }
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
            this.render();
        }
    }
    
    render() {
        const hoverable = this.hasAttribute('hoverable');
        const variant = this.getAttribute('variant') || 'default';
        
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                
                .card {
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
                    overflow: hidden;
                    transition: all 0.2s ease;
                    ${this.getVariantStyles(variant)}
                }
                
                ${hoverable ? `
                .card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
                }
                ` : ''}
                
                .card-header {
                    padding: 20px;
                    border-bottom: 1px solid #E2E8F0;
                }
                
                .card-body {
                    padding: 20px;
                }
                
                .card-footer {
                    padding: 20px;
                    border-top: 1px solid #E2E8F0;
                    background: #FAFAFA;
                }
                
                ::slotted(h1), ::slotted(h2), ::slotted(h3), 
                ::slotted(h4), ::slotted(h5), ::slotted(h6) {
                    margin: 0;
                    color: #0F172A;
                }
                
                .empty {
                    display: none;
                }
            </style>
            
            <div class="card">
                <div class="card-header" id="header">
                    <slot name="header"></slot>
                </div>
                <div class="card-body" id="body">
                    <slot name="body">
                        <slot></slot>
                    </slot>
                </div>
                <div class="card-footer" id="footer">
                    <slot name="footer"></slot>
                </div>
            </div>
        `;
        
        // Hide empty sections
        this.checkSlots();
    }
    
    getVariantStyles(variant) {
        const styles = {
            default: '',
            bordered: `
                border: 1px solid #E2E8F0;
                box-shadow: none;
            `,
            flat: `
                box-shadow: none;
                border: 1px solid #E2E8F0;
            `,
            raised: `
                box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
            `,
            primary: `
                border: 2px solid #10B981;
            `,
            pricing: `
                text-align: center;
                position: relative;
            `,
            featured: `
                border: 2px solid #10B981;
                transform: scale(1.05);
            `
        };
        return styles[variant] || styles.default;
    }
    
    checkSlots() {
        setTimeout(() => {
            const header = this.shadowRoot.getElementById('header');
            const footer = this.shadowRoot.getElementById('footer');
            
            const headerSlot = this.shadowRoot.querySelector('slot[name="header"]');
            const footerSlot = this.shadowRoot.querySelector('slot[name="footer"]');
            
            if (headerSlot && headerSlot.assignedNodes().length === 0) {
                header.style.display = 'none';
            }
            
            if (footerSlot && footerSlot.assignedNodes().length === 0) {
                footer.style.display = 'none';
            }
        }, 0);
    }
}

// Register the component
customElements.define('linky-card', LinkyCard);

export default LinkyCard;