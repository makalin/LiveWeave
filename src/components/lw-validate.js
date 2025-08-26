import { LWBase } from './lw-base.js';
import { validator } from '../utils/advanced.js';

export class LWValidate extends LWBase {
  constructor() {
    super();
    this._validationRules = new Map();
    this._errorMessages = new Map();
    this._validators = new Map();
    this._isValidating = false;
    this._validationQueue = [];
  }
  
  connectedCallback() {
    super.connectedCallback();
    this.setupValidation();
  }
  
  setupValidation() {
    // Parse validation rules from attributes
    const rules = this.getAttribute('rules');
    if (rules) {
      try {
        const parsedRules = JSON.parse(rules);
        this.setValidationRules(parsedRules);
      } catch (error) {
        console.warn('Invalid validation rules:', error);
      }
    }
    
    // Setup form event listeners
    const form = this.closest('form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
      form.addEventListener('input', this.handleInput.bind(this));
      form.addEventListener('blur', this.handleBlur.bind(this), true);
    }
    
    // Setup custom validators
    this.setupCustomValidators();
  }
  
  setupCustomValidators() {
    // Add built-in validators
    for (const [name, validatorFn] of Object.entries(validator.validators)) {
      this.addValidator(name, validatorFn);
    }
    
    // Add custom validators
    this.addValidator('unique', this.validateUnique.bind(this));
    this.addValidator('password-strength', this.validatePasswordStrength.bind(this));
    this.addValidator('phone', this.validatePhone.bind(this));
    this.addValidator('postal-code', this.validatePostalCode.bind(this));
  }
  
  setValidationRules(rules) {
    this._validationRules.clear();
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      this._validationRules.set(field, fieldRules);
    }
  }
  
  addValidator(name, validatorFn) {
    this._validators.set(name, validatorFn);
  }
  
  removeValidator(name) {
    this._validators.delete(name);
  }
  
  async validateField(fieldName, value) {
    const rules = this._validationRules.get(fieldName);
    if (!rules) return { isValid: true, errors: [] };
    
    const errors = [];
    
    for (const rule of rules) {
      const [ruleName, ...params] = Array.isArray(rule) ? rule : [rule];
      const validatorFn = this._validators.get(ruleName);
      
      if (validatorFn && !validatorFn(value, ...params)) {
        const errorMessage = this.getErrorMessage(fieldName, ruleName, params);
        errors.push({
          field: fieldName,
          rule: ruleName,
          value,
          message: errorMessage
        });
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  async validateForm() {
    const form = this.closest('form');
    if (!form) return { isValid: true, errors: [] };
    
    const formData = new FormData(form);
    const allErrors = [];
    
    for (const [fieldName] of formData.entries()) {
      const value = formData.get(fieldName);
      const result = await this.validateField(fieldName, value);
      
      if (!result.isValid) {
        allErrors.push(...result.errors);
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }
  
  handleInput(event) {
    const field = event.target;
    const fieldName = field.name;
    
    if (!fieldName || !this._validationRules.has(fieldName)) return;
    
    // Debounce validation
    clearTimeout(this._validationQueue[fieldName]);
    this._validationQueue[fieldName] = setTimeout(() => {
      this.validateAndShowField(fieldName, field.value);
    }, 300);
  }
  
  handleBlur(event) {
    const field = event.target;
    const fieldName = field.name;
    
    if (!fieldName || !this._validationRules.has(fieldName)) return;
    
    this.validateAndShowField(fieldName, field.value);
  }
  
  async handleSubmit(event) {
    event.preventDefault();
    
    const result = await this.validateForm();
    
    if (result.isValid) {
      // Trigger success event
      this.dispatchEvent(new CustomEvent('lw:validation-success', {
        detail: { form: event.target }
      }));
      
      // Allow form submission
      event.target.submit();
    } else {
      // Show all errors
      this.showAllErrors(result.errors);
      
      // Trigger error event
      this.dispatchEvent(new CustomEvent('lw:validation-error', {
        detail: { errors: result.errors, form: event.target }
      }));
    }
  }
  
  async validateAndShowField(fieldName, value) {
    const result = await this.validateField(fieldName, value);
    this.showFieldValidation(fieldName, result);
    
    // Trigger field validation event
    this.dispatchEvent(new CustomEvent('lw:field-validation', {
      detail: { field: fieldName, result }
    }));
  }
  
  showFieldValidation(fieldName, result) {
    const field = this.querySelector(`[name="${fieldName}"]`);
    if (!field) return;
    
    // Remove existing validation classes
    field.classList.remove('lw-valid', 'lw-invalid');
    
    // Add validation class
    if (result.isValid) {
      field.classList.add('lw-valid');
    } else {
      field.classList.add('lw-invalid');
    }
    
    // Show/hide error message
    this.showFieldError(fieldName, result.errors);
  }
  
  showFieldError(fieldName, errors) {
    // Remove existing error message
    const existingError = this.querySelector(`[data-field-error="${fieldName}"]`);
    if (existingError) {
      existingError.remove();
    }
    
    if (errors.length === 0) return;
    
    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'lw-error-message';
    errorElement.setAttribute('data-field-error', fieldName);
    errorElement.textContent = errors[0].message;
    
    // Insert after the field
    const field = this.querySelector(`[name="${fieldName}"]`);
    if (field && field.parentNode) {
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
  }
  
  showAllErrors(errors) {
    // Group errors by field
    const errorsByField = {};
    errors.forEach(error => {
      if (!errorsByField[error.field]) {
        errorsByField[error.field] = [];
      }
      errorsByField[error.field].push(error);
    });
    
    // Show errors for each field
    for (const [fieldName, fieldErrors] of Object.entries(errorsByField)) {
      this.showFieldValidation(fieldName, { isValid: false, errors: fieldErrors });
    }
  }
  
  getErrorMessage(fieldName, ruleName, params) {
    const customMessage = this._errorMessages.get(`${fieldName}.${ruleName}`);
    if (customMessage) return customMessage;
    
    // Default error messages
    const defaultMessages = {
      required: `${fieldName} is required`,
      email: `${fieldName} must be a valid email address`,
      minLength: `${fieldName} must be at least ${params[0]} characters`,
      maxLength: `${fieldName} must be no more than ${params[0]} characters`,
      min: `${fieldName} must be at least ${params[0]}`,
      max: `${fieldName} must be no more than ${params[0]}`,
      pattern: `${fieldName} format is invalid`,
      url: `${fieldName} must be a valid URL`,
      date: `${fieldName} must be a valid date`,
      number: `${fieldName} must be a number`,
      boolean: `${fieldName} must be true or false`,
      array: `${fieldName} must be an array`,
      object: `${fieldName} must be an object`,
      unique: `${fieldName} must be unique`,
      'password-strength': `${fieldName} must be stronger`,
      phone: `${fieldName} must be a valid phone number`,
      'postal-code': `${fieldName} must be a valid postal code`
    };
    
    return defaultMessages[ruleName] || `${fieldName} validation failed`;
  }
  
  setErrorMessage(fieldName, ruleName, message) {
    this._errorMessages.set(`${fieldName}.${ruleName}`, message);
  }
  
  // Custom validators
  validateUnique(value, fieldName) {
    // This would typically check against a database
    // For now, we'll simulate uniqueness check
    const form = this.closest('form');
    if (!form) return true;
    
    const fields = form.querySelectorAll(`[name="${fieldName}"]`);
    let count = 0;
    
    fields.forEach(field => {
      if (field.value === value) count++;
    });
    
    return count <= 1;
  }
  
  validatePasswordStrength(value) {
    const hasLower = /[a-z]/.test(value);
    const hasUpper = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const isLongEnough = value.length >= 8;
    
    return hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough;
  }
  
  validatePhone(value) {
    // Basic phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  }
  
  validatePostalCode(value) {
    // Basic postal code validation (US format)
    const postalRegex = /^\d{5}(-\d{4})?$/;
    return postalRegex.test(value);
  }
  
  // Public API
  validateFieldByName(fieldName) {
    const field = this.querySelector(`[name="${fieldName}"]`);
    if (!field) return Promise.resolve({ isValid: true, errors: [] });
    
    return this.validateField(fieldName, field.value);
  }
  
  clearValidation(fieldName) {
    if (fieldName) {
      const field = this.querySelector(`[name="${fieldName}"]`);
      if (field) {
        field.classList.remove('lw-valid', 'lw-invalid');
        this.showFieldError(fieldName, []);
      }
    } else {
      // Clear all validations
      this.querySelectorAll('.lw-valid, .lw-invalid').forEach(field => {
        field.classList.remove('lw-valid', 'lw-invalid');
      });
      
      this.querySelectorAll('.lw-error-message').forEach(error => {
        error.remove();
      });
    }
  }
  
  getValidationState() {
    const form = this.closest('form');
    if (!form) return { isValid: true, errors: [] };
    
    const fields = form.querySelectorAll('[name]');
    const state = {};
    
    fields.forEach(field => {
      const fieldName = field.name;
      if (this._validationRules.has(fieldName)) {
        state[fieldName] = {
          isValid: !field.classList.contains('lw-invalid'),
          value: field.value,
          rules: this._validationRules.get(fieldName)
        };
      }
    });
    
    return state;
  }
}

export default LWValidate;
