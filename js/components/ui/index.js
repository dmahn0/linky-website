/**
 * UI Components for Linky Platform
 * Linky Design System 기반 컴포넌트
 */

import { UI_CONFIG } from '/config/ui.config.js';

/**
 * Button Component
 * @param {Object} options - Button options
 * @param {string} options.text - Button text
 * @param {string} options.variant - Button variant (primary, secondary, danger, ghost)
 * @param {string} options.size - Button size (sm, md, lg)
 * @param {Function} options.onClick - Click handler
 * @param {boolean} options.disabled - Disabled state
 * @param {string} options.icon - Icon HTML/emoji
 * @returns {HTMLElement}
 */
export function createButton(options = {}) {
  const {
    text = '',
    variant = 'primary',
    size = 'md',
    onClick = null,
    disabled = false,
    icon = null,
    className = ''
  } = options;
  
  const button = document.createElement('button');
  button.className = `btn btn-${variant} btn-${size} ${className}`.trim();
  button.disabled = disabled;
  
  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = icon;
    button.appendChild(iconSpan);
  }
  
  if (text) {
    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    button.appendChild(textSpan);
  }
  
  if (onClick) {
    button.addEventListener('click', onClick);
  }
  
  return button;
}

/**
 * Card Component
 * @param {Object} options - Card options
 * @param {string} options.title - Card title
 * @param {string} options.content - Card content
 * @param {string} options.footer - Card footer content
 * @param {boolean} options.hoverable - Enable hover effect
 * @returns {HTMLElement}
 */
export function createCard(options = {}) {
  const {
    title = '',
    content = '',
    footer = '',
    hoverable = true,
    className = ''
  } = options;
  
  const card = document.createElement('div');
  card.className = `card ${hoverable ? 'hoverable' : ''} ${className}`.trim();
  
  if (title) {
    const header = document.createElement('div');
    header.className = 'card-header';
    const titleElement = document.createElement('h3');
    titleElement.className = 'card-title';
    titleElement.textContent = title;
    header.appendChild(titleElement);
    card.appendChild(header);
  }
  
  if (content) {
    const body = document.createElement('div');
    body.className = 'card-body';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else {
      body.appendChild(content);
    }
    card.appendChild(body);
  }
  
  if (footer) {
    const footerElement = document.createElement('div');
    footerElement.className = 'card-footer';
    if (typeof footer === 'string') {
      footerElement.innerHTML = footer;
    } else {
      footerElement.appendChild(footer);
    }
    card.appendChild(footerElement);
  }
  
  return card;
}

/**
 * Input Component
 * @param {Object} options - Input options
 * @param {string} options.type - Input type
 * @param {string} options.label - Input label
 * @param {string} options.placeholder - Input placeholder
 * @param {string} options.value - Input value
 * @param {boolean} options.required - Required field
 * @param {string} options.error - Error message
 * @param {Function} options.onChange - Change handler
 * @returns {HTMLElement}
 */
export function createInput(options = {}) {
  const {
    type = 'text',
    label = '',
    placeholder = '',
    value = '',
    required = false,
    error = '',
    hint = '',
    id = `input-${Date.now()}`,
    onChange = null,
    className = ''
  } = options;
  
  const container = document.createElement('div');
  container.className = 'form-group';
  
  if (label) {
    const labelElement = document.createElement('label');
    labelElement.className = 'form-label';
    labelElement.htmlFor = id;
    labelElement.textContent = label;
    if (required) {
      const requiredSpan = document.createElement('span');
      requiredSpan.style.color = UI_CONFIG.colors.error;
      requiredSpan.textContent = ' *';
      labelElement.appendChild(requiredSpan);
    }
    container.appendChild(labelElement);
  }
  
  const input = document.createElement('input');
  input.type = type;
  input.id = id;
  input.className = `form-input ${error ? 'error' : ''} ${className}`.trim();
  input.placeholder = placeholder;
  input.value = value;
  input.required = required;
  
  if (onChange) {
    input.addEventListener('change', onChange);
    input.addEventListener('input', onChange);
  }
  
  container.appendChild(input);
  
  if (error) {
    const errorElement = document.createElement('span');
    errorElement.className = 'form-error';
    errorElement.textContent = error;
    container.appendChild(errorElement);
  }
  
  if (hint && !error) {
    const hintElement = document.createElement('span');
    hintElement.className = 'form-hint';
    hintElement.textContent = hint;
    container.appendChild(hintElement);
  }
  
  return container;
}

/**
 * Alert Component
 * @param {Object} options - Alert options
 * @param {string} options.title - Alert title
 * @param {string} options.message - Alert message
 * @param {string} options.type - Alert type (info, success, warning, error)
 * @param {boolean} options.dismissible - Can be dismissed
 * @returns {HTMLElement}
 */
export function createAlert(options = {}) {
  const {
    title = '',
    message = '',
    type = 'info',
    dismissible = false,
    onDismiss = null,
    className = ''
  } = options;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} ${className}`.trim();
  
  const content = document.createElement('div');
  content.className = 'alert-content';
  
  if (title) {
    const titleElement = document.createElement('div');
    titleElement.className = 'alert-title';
    titleElement.textContent = title;
    content.appendChild(titleElement);
  }
  
  if (message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'alert-message';
    messageElement.textContent = message;
    content.appendChild(messageElement);
  }
  
  alert.appendChild(content);
  
  if (dismissible) {
    const closeButton = document.createElement('button');
    closeButton.className = 'alert-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => {
      alert.remove();
      if (onDismiss) onDismiss();
    };
    alert.appendChild(closeButton);
  }
  
  return alert;
}

/**
 * Badge Component
 * @param {Object} options - Badge options
 * @param {string} options.text - Badge text
 * @param {string} options.variant - Badge variant (primary, secondary, success, warning, danger)
 * @returns {HTMLElement}
 */
export function createBadge(options = {}) {
  const {
    text = '',
    variant = 'primary',
    className = ''
  } = options;
  
  const badge = document.createElement('span');
  badge.className = `badge badge-${variant} ${className}`.trim();
  badge.textContent = text;
  
  return badge;
}

/**
 * Modal Component
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string|HTMLElement} options.content - Modal content
 * @param {Array} options.buttons - Modal buttons
 * @param {Function} options.onClose - Close handler
 * @returns {HTMLElement}
 */
export function createModal(options = {}) {
  const {
    title = '',
    content = '',
    buttons = [],
    onClose = null,
    className = ''
  } = options;
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = `modal ${className}`.trim();
  
  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';
  
  const titleElement = document.createElement('h2');
  titleElement.className = 'modal-title';
  titleElement.textContent = title;
  header.appendChild(titleElement);
  
  const closeButton = document.createElement('button');
  closeButton.className = 'modal-close';
  closeButton.innerHTML = '×';
  closeButton.onclick = () => {
    overlay.remove();
    if (onClose) onClose();
  };
  header.appendChild(closeButton);
  
  modal.appendChild(header);
  
  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }
  modal.appendChild(body);
  
  // Footer with buttons
  if (buttons.length > 0) {
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    buttons.forEach(buttonOptions => {
      const btn = createButton(buttonOptions);
      footer.appendChild(btn);
    });
    
    modal.appendChild(footer);
  }
  
  overlay.appendChild(modal);
  
  // Show modal
  requestAnimationFrame(() => {
    overlay.classList.add('active');
  });
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      if (onClose) onClose();
    }
  });
  
  return overlay;
}

/**
 * Table Component
 * @param {Object} options - Table options
 * @param {Array} options.headers - Table headers
 * @param {Array} options.data - Table data
 * @param {boolean} options.hoverable - Enable row hover
 * @returns {HTMLElement}
 */
export function createTable(options = {}) {
  const {
    headers = [],
    data = [],
    hoverable = true,
    className = ''
  } = options;
  
  const container = document.createElement('div');
  container.className = 'table-container';
  
  const table = document.createElement('table');
  table.className = `table ${hoverable ? 'hoverable' : ''} ${className}`.trim();
  
  // Headers
  if (headers.length > 0) {
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
  }
  
  // Body
  const tbody = document.createElement('tbody');
  
  data.forEach(row => {
    const tr = document.createElement('tr');
    
    if (Array.isArray(row)) {
      row.forEach(cell => {
        const td = document.createElement('td');
        if (typeof cell === 'string') {
          td.textContent = cell;
        } else {
          td.appendChild(cell);
        }
        tr.appendChild(td);
      });
    } else {
      Object.values(row).forEach(cell => {
        const td = document.createElement('td');
        if (typeof cell === 'string') {
          td.textContent = cell;
        } else {
          td.appendChild(cell);
        }
        tr.appendChild(td);
      });
    }
    
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  return container;
}

/**
 * Loading Spinner Component
 * @param {Object} options - Spinner options
 * @param {string} options.size - Spinner size (sm, md, lg)
 * @param {string} options.text - Loading text
 * @returns {HTMLElement}
 */
export function createSpinner(options = {}) {
  const {
    size = 'md',
    text = '로딩 중...',
    className = ''
  } = options;
  
  const container = document.createElement('div');
  container.className = `spinner-container ${className}`.trim();
  
  const spinner = document.createElement('div');
  spinner.className = `spinner spinner-${size}`;
  
  // CSS for spinner
  const style = document.createElement('style');
  style.textContent = `
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: ${UI_CONFIG.spacing.md};
    }
    .spinner {
      border: 3px solid ${UI_CONFIG.colors.border};
      border-top-color: ${UI_CONFIG.colors.primary};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .spinner-sm {
      width: 20px;
      height: 20px;
    }
    .spinner-md {
      width: 32px;
      height: 32px;
    }
    .spinner-lg {
      width: 48px;
      height: 48px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  
  if (!document.querySelector('style[data-spinner]')) {
    style.setAttribute('data-spinner', 'true');
    document.head.appendChild(style);
  }
  
  container.appendChild(spinner);
  
  if (text) {
    const textElement = document.createElement('div');
    textElement.className = 'spinner-text';
    textElement.textContent = text;
    textElement.style.color = UI_CONFIG.colors.textSecondary;
    container.appendChild(textElement);
  }
  
  return container;
}

// Export all components
export default {
  createButton,
  createCard,
  createInput,
  createAlert,
  createBadge,
  createModal,
  createTable,
  createSpinner
};