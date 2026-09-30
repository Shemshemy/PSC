/**
 * PSCIMS 2.0 - Inline, Asynchronous Form Validator & Input Physics Engine
 * Implements NN/g onBlur validation, triple-cue states, auto-tabbing date physics,
 * and character boundary validation.
 */

export class FormValidator {
  constructor(options = {}) {
    this.onSaveTrigger = options.onSaveTrigger || (() => {});
    this.rules = {
      nationalId: (val) => {
        if (!val || !val.trim()) return 'National ID is required for verification with the National Registration Bureau.';
        const clean = val.trim();
        if (!/^\d{7,8}$/.test(clean)) return 'National ID must be between 7 and 8 digits without spaces or hyphens.';
        return null;
      },
      payrollNumber: (val) => {
        if (!val || !val.trim()) return null; // optional if not currently serving civil servant
        const clean = val.trim();
        if (!/^\d{9,12}$/.test(clean)) return 'Civil Service Payroll Number must contain 9 to 12 digits (e.g. 20250031176).';
        return null;
      },
      kraPin: (val) => {
        if (!val || !val.trim()) return 'KRA PIN is required for statutory Chapter 6 ethics clearance.';
        const clean = val.trim().toUpperCase();
        if (!/^[A-Z]\d{9}[A-Z]$/.test(clean)) return 'KRA PIN must match standard format: 1 letter, 9 digits, 1 letter (e.g. A011114073C).';
        return null;
      },
      mobileNumber: (val) => {
        if (!val || !val.trim()) return 'Primary mobile number is required for SMS interview alerts.';
        const clean = val.trim().replace(/\s+/g, '');
        if (!/^(07|01|\+2547|\+2541)\d{8}$/.test(clean)) return 'Enter a valid Kenyan mobile number starting with 07 or 01 (e.g. 0721877088).';
        return null;
      },
      emailAddress: (val) => {
        if (!val || !val.trim()) return 'Official communication email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Please enter a valid email format (e.g. applicant@domain.go.ke).';
        return null;
      },
      postalCode: (val) => {
        if (!val || !val.trim()) return 'Postal Code is required for delivery of official appointment letters.';
        if (!/^\d{5}$/.test(val.trim())) return 'Kenyan postal code must be a 5-digit number (e.g. 30300 or 00100).';
        return null;
      }
    };
  }

  attachToForm(formElement) {
    if (!formElement) return;

    // Attach onBlur validation to each validated field
    Object.keys(this.rules).forEach(fieldName => {
      const input = formElement.querySelector(`[name="${fieldName}"]`);
      if (input) {
        input.addEventListener('blur', () => {
          this.validateField(input, this.rules[fieldName]);
          this.onSaveTrigger();
        });

        input.addEventListener('input', () => {
          // Clear error dynamically if valid
          const group = input.closest('.form-group');
          if (group && group.classList.contains('has-error')) {
            const error = this.rules[fieldName](input.value);
            if (!error) {
              this.clearFieldError(input);
            }
          }
        });
      }
    });

    // Date-of-Birth 3-Part Input Physics (Auto-tabbing & Live Age Calculation)
    this.setupDateOfBirthPhysics(formElement);
  }

  setupDateOfBirthPhysics(formElement) {
    const dayInput = formElement.querySelector('.input-dob-day');
    const monthInput = formElement.querySelector('.input-dob-month');
    const yearInput = formElement.querySelector('.input-dob-year');
    const ageBadge = formElement.querySelector('.dob-age-feedback');
    const group = dayInput ? dayInput.closest('.form-group') : null;

    if (!dayInput || !monthInput || !yearInput) return;

    const calculateAge = () => {
      const d = parseInt(dayInput.value, 10);
      const m = parseInt(monthInput.value, 10) - 1;
      const y = parseInt(yearInput.value, 10);

      if (!d || !m || !y || isNaN(d) || isNaN(m) || isNaN(y)) {
        if (ageBadge) ageBadge.classList.remove('visible');
        return;
      }

      if (d < 1 || d > 31 || m < 0 || m > 11 || y < 1940 || y > 2026) {
        this.setFieldError(dayInput, 'Please enter a valid calendar date of birth.');
        if (ageBadge) ageBadge.classList.remove('visible');
        return;
      }

      const birthDate = new Date(y, m, d);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        this.setFieldError(dayInput, 'Applicant must be at least 18 years of age to seek public service appointment.');
        if (ageBadge) ageBadge.classList.remove('visible');
        return;
      }

      if (age > 65) {
        this.setFieldError(dayInput, 'Mandatory retirement age in the Public Service is 60 years (65 years for PWDs).');
        if (ageBadge) ageBadge.classList.remove('visible');
        return;
      }

      this.clearFieldError(dayInput);
      if (ageBadge) {
        ageBadge.textContent = `✓ Age: ${age} years (Eligible)`;
        ageBadge.classList.add('visible');
      }
      this.onSaveTrigger();
    };

    // Auto-tab from Day to Month after 2 digits
    dayInput.addEventListener('input', (e) => {
      dayInput.value = dayInput.value.replace(/\D/g, '').slice(0, 2);
      if (dayInput.value.length === 2) {
        monthInput.focus();
        monthInput.select();
      }
      calculateAge();
    });

    // Auto-tab from Month to Year after 2 digits
    monthInput.addEventListener('input', (e) => {
      monthInput.value = monthInput.value.replace(/\D/g, '').slice(0, 2);
      if (monthInput.value.length === 2) {
        yearInput.focus();
        yearInput.select();
      }
      calculateAge();
    });

    // Backspace navigation
    monthInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !monthInput.value) {
        dayInput.focus();
      }
    });

    yearInput.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !yearInput.value) {
        monthInput.focus();
      }
    });

    yearInput.addEventListener('input', (e) => {
      yearInput.value = yearInput.value.replace(/\D/g, '').slice(0, 4);
      if (yearInput.value.length === 4) {
        calculateAge();
      }
    });

    // Initial check
    calculateAge();
  }

  validateField(inputElement, ruleFn) {
    const error = ruleFn(inputElement.value);
    if (error) {
      this.setFieldError(inputElement, error);
      return false;
    } else {
      this.clearFieldError(inputElement);
      return true;
    }
  }

  setFieldError(inputElement, message) {
    const group = inputElement.closest('.form-group');
    if (!group) return;

    group.classList.add('has-error');
    let errorElem = group.querySelector('.error-message');
    if (!errorElem) {
      errorElem = document.createElement('div');
      errorElem.className = 'error-message';
      errorElem.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span class="error-text"></span>
      `;
      group.appendChild(errorElem);
    }

    const textSpan = errorElem.querySelector('.error-text');
    if (textSpan) textSpan.textContent = message;

    // Field Alert icon
    let iconElem = group.querySelector('.field-error-icon');
    if (!iconElem) {
      iconElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconElem.setAttribute('class', 'field-error-icon');
      iconElem.setAttribute('viewBox', '0 0 24 24');
      iconElem.setAttribute('fill', 'none');
      iconElem.setAttribute('stroke', 'currentColor');
      iconElem.setAttribute('stroke-width', '2');
      iconElem.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
      group.appendChild(iconElem);
    }
  }

  clearFieldError(inputElement) {
    const group = inputElement.closest('.form-group');
    if (!group) return;
    group.classList.remove('has-error');
  }

  validateAll(formElement) {
    let isValid = true;
    Object.keys(this.rules).forEach(fieldName => {
      const input = formElement.querySelector(`[name="${fieldName}"]`);
      if (input) {
        const ok = this.validateField(input, this.rules[fieldName]);
        if (!ok) isValid = false;
      }
    });
    return isValid;
  }

  validateSegment(containerElement) {
    if (!containerElement) return true;
    let isValid = true;

    // Validate specific rule-based fields inside this segment
    Object.keys(this.rules).forEach(fieldName => {
      const input = containerElement.querySelector(`[name="${fieldName}"]`);
      if (input) {
        const ok = this.validateField(input, this.rules[fieldName]);
        if (!ok) isValid = false;
      }
    });

    // Validate generic required inputs inside this segment
    const requiredInputs = containerElement.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
      if (input.type === 'radio') {
        const checked = containerElement.querySelector(`input[name="${input.name}"]:checked`);
        if (!checked) {
          this.setFieldError(input, 'Please select an option.');
          isValid = false;
        }
      } else if (!input.value || !input.value.trim()) {
        this.setFieldError(input, 'This field is required.');
        isValid = false;
      }
    });

    return isValid;
  }
}

