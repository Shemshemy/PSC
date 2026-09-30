/**
 * PSCIMS 2.0 - Accessible Combobox Component (WAI-ARIA 1.2 Compliant)
 * Features fuzzy matching, full keyboard ergonomics (Arrow Up/Down, Enter, Esc),
 * character boundary affordance, and mobile friendly touch targets.
 */

export class Combobox {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    if (!this.container) return;

    this.options = options.items || [];
    this.placeholder = options.placeholder || 'Type to search...';
    this.name = options.name || '';
    this.id = options.id || `combo-${Math.random().toString(36).substr(2, 9)}`;
    this.initialValue = options.initialValue || '';
    this.onSelect = options.onSelect || (() => {});
    this.maxWidth = options.maxWidth || null;

    this.isOpen = false;
    this.activeIndex = -1;
    this.filteredOptions = [...this.options];

    this.render();
    this.bindEvents();
    if (this.initialValue) {
      this.setValue(this.initialValue);
    }
  }

  render() {
    this.container.classList.add('combobox-container');
    if (this.maxWidth) {
      this.container.style.maxWidth = this.maxWidth;
    }

    this.container.innerHTML = `
      <div class="combobox-input-wrapper">
        <input
          type="text"
          id="${this.id}"
          name="${this.name}"
          class="form-control combobox-input"
          placeholder="${this.placeholder}"
          autocomplete="off"
          role="combobox"
          aria-expanded="false"
          aria-autocomplete="list"
          aria-controls="${this.id}-dropdown"
        />
        <button type="button" class="combobox-toggle-btn" aria-label="Toggle options" tabindex="-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      <ul id="${this.id}-dropdown" class="combobox-dropdown" role="listbox" aria-label="${this.placeholder}">
      </ul>
    `;

    this.input = this.container.querySelector('.combobox-input');
    this.toggleBtn = this.container.querySelector('.combobox-toggle-btn');
    this.dropdown = this.container.querySelector('.combobox-dropdown');
  }

  setItems(items) {
    this.options = items;
    this.filteredOptions = [...items];
    if (this.isOpen) {
      this.renderOptions();
    }
  }

  setValue(val) {
    if (!this.input) return;
    this.input.value = val;
    this.onSelect(val);
  }

  getValue() {
    return this.input ? this.input.value : '';
  }

  bindEvents() {
    this.input.addEventListener('input', () => {
      this.filterOptions(this.input.value);
      this.open();
    });

    this.input.addEventListener('focus', () => {
      this.filterOptions(this.input.value);
      this.open();
    });

    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

    this.toggleBtn.addEventListener('click', () => {
      if (this.isOpen) {
        this.close();
      } else {
        this.filterOptions('');
        this.open();
        this.input.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.close();
      }
    });
  }

  filterOptions(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredOptions = [...this.options];
    } else {
      this.filteredOptions = this.options.filter(opt => {
        const text = typeof opt === 'string' ? opt : opt.label || opt.name;
        return text.toLowerCase().includes(q);
      });
    }
    this.activeIndex = -1;
    this.renderOptions(q);
  }

  renderOptions(query = '') {
    this.dropdown.innerHTML = '';
    if (this.filteredOptions.length === 0) {
      this.dropdown.innerHTML = `<li class="combobox-empty-msg" role="presentation">No matches found</li>`;
      return;
    }

    this.filteredOptions.forEach((opt, idx) => {
      const text = typeof opt === 'string' ? opt : opt.label || opt.name;
      const li = document.createElement('li');
      li.className = 'combobox-option';
      li.id = `${this.id}-opt-${idx}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', idx === this.activeIndex ? 'true' : 'false');

      // Highlight match
      if (query) {
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const highlightedText = text.replace(regex, '<span class="combobox-match-highlight">$1</span>');
        li.innerHTML = highlightedText;
      } else {
        li.textContent = text;
      }

      if (text.toLowerCase() === this.input.value.trim().toLowerCase()) {
        li.classList.add('selected');
      }

      li.addEventListener('click', () => {
        this.selectOption(opt);
      });

      this.dropdown.appendChild(li);
    });
  }

  selectOption(opt) {
    const text = typeof opt === 'string' ? opt : opt.label || opt.name;
    this.input.value = text;
    this.close();
    this.onSelect(opt);
    this.input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  open() {
    if (this.isOpen) return;
    this.isOpen = true;
    this.dropdown.classList.add('open');
    this.input.setAttribute('aria-expanded', 'true');
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.dropdown.classList.remove('open');
    this.input.setAttribute('aria-expanded', 'false');
    this.activeIndex = -1;
  }

  handleKeydown(e) {
    if (!this.isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        this.filterOptions('');
        this.open();
        e.preventDefault();
        return;
      }
    }

    const items = this.dropdown.querySelectorAll('.combobox-option');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % items.length;
      this.updateActiveItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + items.length) % items.length;
      this.updateActiveItem(items);
    } else if (e.key === 'Enter') {
      if (this.activeIndex >= 0 && this.activeIndex < this.filteredOptions.length) {
        e.preventDefault();
        this.selectOption(this.filteredOptions[this.activeIndex]);
      }
    } else if (e.key === 'Escape') {
      this.close();
    }
  }

  updateActiveItem(items) {
    items.forEach((item, idx) => {
      if (idx === this.activeIndex) {
        item.classList.add('highlighted');
        item.setAttribute('aria-selected', 'true');
        this.input.setAttribute('aria-activedescendant', item.id);
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('highlighted');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }
}
