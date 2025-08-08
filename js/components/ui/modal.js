/**
 * Modal Component for Linky Platform
 */

export class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            content: '',
            size: 'md', // sm, md, lg, xl, full
            closable: true,
            backdrop: true,
            keyboard: true,
            buttons: [],
            onOpen: null,
            onClose: null,
            ...options
        };
        
        this.isOpen = false;
        this.element = null;
        this.backdrop = null;
        
        this.init();
    }
    
    init() {
        this.createElement();
        this.attachEvents();
    }
    
    createElement() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';
        
        // Create modal
        this.element = document.createElement('div');
        this.element.className = `modal modal-${this.options.size}`;
        
        // Create header
        if (this.options.title) {
            const header = document.createElement('div');
            header.className = 'modal-header';
            
            const title = document.createElement('h3');
            title.className = 'modal-title';
            title.textContent = this.options.title;
            header.appendChild(title);
            
            if (this.options.closable) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'modal-close';
                closeBtn.innerHTML = '×';
                closeBtn.onclick = () => this.close();
                header.appendChild(closeBtn);
            }
            
            this.element.appendChild(header);
        }
        
        // Create body
        const body = document.createElement('div');
        body.className = 'modal-body';
        
        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        }
        
        this.element.appendChild(body);
        
        // Create footer with buttons
        if (this.options.buttons && this.options.buttons.length > 0) {
            const footer = document.createElement('div');
            footer.className = 'modal-footer';
            
            this.options.buttons.forEach(btnOptions => {
                const btn = document.createElement('button');
                btn.className = `btn btn-${btnOptions.variant || 'secondary'} ${btnOptions.size ? `btn-${btnOptions.size}` : ''}`;
                btn.textContent = btnOptions.text;
                
                if (btnOptions.onClick) {
                    btn.onclick = () => {
                        const result = btnOptions.onClick(this);
                        if (result !== false && btnOptions.closeOnClick !== false) {
                            this.close();
                        }
                    };
                }
                
                footer.appendChild(btn);
            });
            
            this.element.appendChild(footer);
        }
        
        this.backdrop.appendChild(this.element);
    }
    
    attachEvents() {
        // Close on backdrop click
        if (this.options.backdrop && this.options.closable) {
            this.backdrop.addEventListener('click', (e) => {
                if (e.target === this.backdrop) {
                    this.close();
                }
            });
        }
        
        // Close on ESC key
        if (this.options.keyboard && this.options.closable) {
            this.keyHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            };
        }
    }
    
    open() {
        if (this.isOpen) return;
        
        document.body.appendChild(this.backdrop);
        
        // Force reflow for animation
        this.backdrop.offsetHeight;
        
        this.backdrop.classList.add('active');
        this.isOpen = true;
        
        if (this.keyHandler) {
            document.addEventListener('keydown', this.keyHandler);
        }
        
        if (this.options.onOpen) {
            this.options.onOpen(this);
        }
        
        // Focus first focusable element
        const focusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) {
            focusable.focus();
        }
        
        return this;
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.backdrop.classList.remove('active');
        
        setTimeout(() => {
            if (this.backdrop.parentNode) {
                this.backdrop.parentNode.removeChild(this.backdrop);
            }
        }, 200);
        
        this.isOpen = false;
        
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
        }
        
        if (this.options.onClose) {
            this.options.onClose(this);
        }
        
        return this;
    }
    
    setContent(content) {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            if (typeof content === 'string') {
                body.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                body.innerHTML = '';
                body.appendChild(content);
            }
        }
        return this;
    }
    
    setTitle(title) {
        const titleElement = this.element.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        return this;
    }
    
    destroy() {
        this.close();
        this.backdrop = null;
        this.element = null;
    }
}

// Static methods for quick use
Modal.alert = function(message, title = '알림') {
    const modal = new Modal({
        title,
        content: message,
        size: 'sm',
        buttons: [{
            text: '확인',
            variant: 'primary',
            closeOnClick: true
        }]
    });
    return modal.open();
};

Modal.confirm = function(message, title = '확인') {
    return new Promise((resolve) => {
        const modal = new Modal({
            title,
            content: message,
            size: 'sm',
            buttons: [
                {
                    text: '취소',
                    variant: 'secondary',
                    onClick: () => {
                        resolve(false);
                        return true;
                    }
                },
                {
                    text: '확인',
                    variant: 'primary',
                    onClick: () => {
                        resolve(true);
                        return true;
                    }
                }
            ]
        });
        modal.open();
    });
};

Modal.prompt = function(message, title = '입력', defaultValue = '') {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-input';
        input.value = defaultValue;
        
        const content = document.createElement('div');
        content.innerHTML = `<p class="mb-md">${message}</p>`;
        content.appendChild(input);
        
        const modal = new Modal({
            title,
            content,
            size: 'sm',
            buttons: [
                {
                    text: '취소',
                    variant: 'secondary',
                    onClick: () => {
                        resolve(null);
                        return true;
                    }
                },
                {
                    text: '확인',
                    variant: 'primary',
                    onClick: () => {
                        resolve(input.value);
                        return true;
                    }
                }
            ],
            onOpen: () => {
                input.focus();
                input.select();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                resolve(input.value);
                modal.close();
            }
        });
        
        modal.open();
    });
};

export default Modal;