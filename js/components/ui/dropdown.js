/**
 * Dropdown Component for Linky Platform
 */

export class Dropdown {
    constructor(element, options = {}) {
        this.element = element;
        this.options = {
            trigger: 'click', // click, hover, focus
            placement: 'bottom', // top, bottom, left, right
            offset: 4,
            closeOnClick: true,
            closeOnOutsideClick: true,
            onOpen: null,
            onClose: null,
            ...options
        };
        
        this.isOpen = false;
        this.toggle = null;
        this.menu = null;
        
        this.init();
    }
    
    init() {
        this.toggle = this.element.querySelector('.dropdown-toggle') || this.element.querySelector('[data-dropdown-toggle]');
        this.menu = this.element.querySelector('.dropdown-menu') || this.element.querySelector('[data-dropdown-menu]');
        
        if (!this.toggle || !this.menu) {
            console.warn('Dropdown requires both toggle and menu elements');
            return;
        }
        
        this.attachEvents();
    }
    
    attachEvents() {
        switch (this.options.trigger) {
            case 'hover':
                this.element.addEventListener('mouseenter', () => this.open());
                this.element.addEventListener('mouseleave', () => this.close());
                break;
                
            case 'focus':
                this.toggle.addEventListener('focus', () => this.open());
                this.toggle.addEventListener('blur', () => this.close());
                break;
                
            case 'click':
            default:
                this.toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.toggle();
                });
                break;
        }
        
        // Close on menu item click
        if (this.options.closeOnClick) {
            this.menu.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropdown-item')) {
                    this.close();
                }
            });
        }
        
        // Close on outside click
        if (this.options.closeOnOutsideClick) {
            this.outsideClickHandler = (e) => {
                if (this.isOpen && !this.element.contains(e.target)) {
                    this.close();
                }
            };
        }
        
        // Close on ESC key
        this.keyHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.toggle.focus();
            }
        };
    }
    
    open() {
        if (this.isOpen) return;
        
        // Close other dropdowns
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            if (dropdown !== this.element) {
                dropdown.classList.remove('active');
            }
        });
        
        this.element.classList.add('active');
        this.isOpen = true;
        
        // Position the menu
        this.positionMenu();
        
        // Add event listeners
        if (this.outsideClickHandler) {
            document.addEventListener('click', this.outsideClickHandler);
        }
        document.addEventListener('keydown', this.keyHandler);
        
        // Set ARIA attributes
        this.toggle.setAttribute('aria-expanded', 'true');
        this.menu.setAttribute('aria-hidden', 'false');
        
        if (this.options.onOpen) {
            this.options.onOpen(this);
        }
        
        // Focus first menu item
        const firstItem = this.menu.querySelector('.dropdown-item');
        if (firstItem) {
            firstItem.focus();
        }
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.element.classList.remove('active');
        this.isOpen = false;
        
        // Remove event listeners
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
        document.removeEventListener('keydown', this.keyHandler);
        
        // Set ARIA attributes
        this.toggle.setAttribute('aria-expanded', 'false');
        this.menu.setAttribute('aria-hidden', 'true');
        
        if (this.options.onClose) {
            this.options.onClose(this);
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    positionMenu() {
        const toggleRect = this.toggle.getBoundingClientRect();
        const menuRect = this.menu.getBoundingClientRect();
        
        // Reset position
        this.menu.style.position = 'absolute';
        this.menu.style.top = '';
        this.menu.style.bottom = '';
        this.menu.style.left = '';
        this.menu.style.right = '';
        
        switch (this.options.placement) {
            case 'top':
                this.menu.style.bottom = `calc(100% + ${this.options.offset}px)`;
                this.menu.style.left = '0';
                break;
                
            case 'bottom':
                this.menu.style.top = `calc(100% + ${this.options.offset}px)`;
                this.menu.style.left = '0';
                break;
                
            case 'left':
                this.menu.style.right = `calc(100% + ${this.options.offset}px)`;
                this.menu.style.top = '0';
                break;
                
            case 'right':
                this.menu.style.left = `calc(100% + ${this.options.offset}px)`;
                this.menu.style.top = '0';
                break;
        }
        
        // Adjust if menu goes off screen
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (menuRect.right > windowWidth) {
            this.menu.style.left = 'auto';
            this.menu.style.right = '0';
        }
        
        if (menuRect.bottom > windowHeight) {
            if (this.options.placement === 'bottom') {
                this.menu.style.top = 'auto';
                this.menu.style.bottom = `calc(100% + ${this.options.offset}px)`;
            }
        }
    }
    
    destroy() {
        this.close();
        
        // Remove all event listeners
        this.toggle.removeEventListener('click', this.toggleHandler);
        
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
        
        document.removeEventListener('keydown', this.keyHandler);
    }
}

// Auto-initialize dropdowns
export function initDropdowns() {
    document.querySelectorAll('.dropdown').forEach(element => {
        if (!element.dropdown) {
            element.dropdown = new Dropdown(element);
        }
    });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDropdowns);
} else {
    initDropdowns();
}

export default Dropdown;