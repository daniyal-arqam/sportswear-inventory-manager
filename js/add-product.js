/**
 * Page 02 - Add Inventory Product Controller & Automation Pipeline Animator
 * Configured for Daniyal Arqam's n8n Workflow Validation Rules
 */

const AddProductController = {
  selectedCategory: 'Footwear',

  init() {
    this.initCategoryIcons();
    this.bindCustomDropdown();
    this.bindFormValidation();
    this.bindPresetButtons();
    this.bindFormSubmit();
  },

  initCategoryIcons() {
    if (!window.CategoryIcons) return;
    document.querySelectorAll('.custom-option[data-value]').forEach(opt => {
      const cat = opt.getAttribute('data-value');
      const iconWrap = opt.querySelector('.cat-icon');
      if (iconWrap) iconWrap.innerHTML = CategoryIcons.get(cat);
    });
    const selectedIcon = document.getElementById('selected-category-icon');
    if (selectedIcon) selectedIcon.innerHTML = CategoryIcons.get(this.selectedCategory);
  },

  bindCustomDropdown() {
    const wrapper = document.getElementById('category-select-wrapper');
    const trigger = document.getElementById('category-select-trigger');
    const options = document.querySelectorAll('.custom-option');
    const selectedText = document.getElementById('selected-category-text');

    if (!wrapper || !trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      wrapper.classList.toggle('open');
    });

    document.addEventListener('click', () => {
      wrapper.classList.remove('open');
    });

    options.forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.getAttribute('data-value');
        this.selectedCategory = value;
        selectedText.textContent = value;
        const iconEl = document.getElementById('selected-category-icon');
        if (iconEl && window.CategoryIcons) {
          iconEl.innerHTML = CategoryIcons.get(value);
        }
        options.forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        wrapper.classList.remove('open');
        this.validateField('category');
      });
    });
  },

  bindFormValidation() {
    const inputs = ['prod-name', 'prod-sku', 'prod-price', 'prod-stock', 'prod-supplier'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.validateField(id));
        el.addEventListener('blur', () => this.validateField(id));
      }
    });

    // Realtime SKU duplicate warning
    const skuInput = document.getElementById('prod-sku');
    if (skuInput) {
      skuInput.addEventListener('input', () => {
        const val = skuInput.value.trim();
        const errorEl = document.getElementById('error-prod-sku');
        if (val && window.appStore.isDuplicateSku(val)) {
          skuInput.classList.add('is-invalid');
          if (errorEl) errorEl.textContent = 'Warning: SKU already exists in inventory (409 Conflict)';
        }
      });
    }
  },

  validateField(id) {
    let isValid = true;
    let message = '';

    if (id === 'prod-name') {
      const el = document.getElementById('prod-name');
      const val = el.value.trim();
      if (!val) {
        isValid = false;
        message = 'Item name is required.';
      }
      this.setFieldState(el, 'error-prod-name', isValid, message);
    } else if (id === 'prod-sku') {
      const el = document.getElementById('prod-sku');
      const val = el.value.trim();
      if (!val) {
        isValid = false;
        message = 'SKU is required.';
      } else if (window.appStore.isDuplicateSku(val)) {
        isValid = false;
        message = 'Product with this SKU already exists.';
      }
      this.setFieldState(el, 'error-prod-sku', isValid, message);
    } else if (id === 'prod-price') {
      const el = document.getElementById('prod-price');
      const val = parseFloat(el.value);
      if (isNaN(val) || val <= 0) {
        isValid = false;
        message = 'Price must be greater than 0.';
      }
      this.setFieldState(el, 'error-prod-price', isValid, message);
    } else if (id === 'prod-stock') {
      const el = document.getElementById('prod-stock');
      const val = parseInt(el.value, 10);
      if (isNaN(val) || val < 0) {
        isValid = false;
        message = 'Stock quantity cannot be negative.';
      }
      this.setFieldState(el, 'error-prod-stock', isValid, message);
    } else if (id === 'prod-supplier') {
      const el = document.getElementById('prod-supplier');
      const val = el.value.trim();
      if (!val) {
        isValid = false;
        message = 'Supplier name is required.';
      }
      this.setFieldState(el, 'error-prod-supplier', isValid, message);
    }

    return isValid;
  },

  setFieldState(inputEl, errorElId, isValid, errorMessage) {
    const errorEl = document.getElementById(errorElId);
    if (isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
      if (errorEl) errorEl.textContent = errorMessage;
    }
  },

  bindPresetButtons() {
    const presetStandard = document.getElementById('preset-standard');
    const presetLowStock = document.getElementById('preset-low-stock');
    const presetDuplicate = document.getElementById('preset-duplicate');
    const presetInvalid = document.getElementById('preset-invalid');

    if (presetStandard) {
      presetStandard.addEventListener('click', () => {
        this.fillForm({
          name: 'Apex Speed Pro Distance Spike',
          sku: 'SPIKE-' + Math.floor(100 + Math.random() * 900),
          category: 'Footwear',
          size: 'US 11',
          price: '11500',
          stock: '28',
          supplier: 'Puma Performance Lab'
        });
      });
    }

    if (presetLowStock) {
      presetLowStock.addEventListener('click', () => {
        this.fillForm({
          name: 'Kinetic Ergonomic Knee Sleeves (Pair)',
          sku: 'KS-' + Math.floor(100 + Math.random() * 900),
          category: 'Training Gear',
          size: 'L',
          price: '3800',
          stock: '2', // stock <= 5 triggers Groq AI Agent
          supplier: 'SBD Apparel Ltd'
        });
      });
    }

    if (presetDuplicate) {
      presetDuplicate.addEventListener('click', () => {
        this.fillForm({
          name: 'Existing SKU Duplicate Test',
          sku: 'TEST-VALID-001', // Documented duplicate in Daniyal's repo
          category: 'Sports Equipment',
          size: 'N/A',
          price: '18900',
          stock: '10',
          supplier: 'Wilson Sports Corp'
        });
      });
    }

    if (presetInvalid) {
      presetInvalid.addEventListener('click', () => {
        this.fillForm({
          name: '',
          sku: '',
          category: 'Footwear',
          size: '',
          price: '0',
          stock: '-4',
          supplier: ''
        });
      });
    }
  },

  fillForm(data) {
    document.getElementById('prod-name').value = data.name;
    document.getElementById('prod-sku').value = data.sku;
    document.getElementById('prod-size').value = data.size;
    document.getElementById('prod-price').value = data.price;
    document.getElementById('prod-stock').value = data.stock;
    document.getElementById('prod-supplier').value = data.supplier;

    this.selectedCategory = data.category;
    document.getElementById('selected-category-text').textContent = data.category;
    const iconEl = document.getElementById('selected-category-icon');
    if (iconEl && window.CategoryIcons) iconEl.innerHTML = CategoryIcons.get(data.category);
    document.querySelectorAll('.custom-option').forEach(opt => {
      if (opt.getAttribute('data-value') === data.category) opt.classList.add('selected');
      else opt.classList.remove('selected');
    });

    // Reset field styling
    ['prod-name', 'prod-sku', 'prod-price', 'prod-stock', 'prod-supplier'].forEach(id => {
      const el = document.getElementById(id);
      el.classList.remove('is-invalid', 'is-valid');
      const err = document.getElementById(`error-${id}`);
      if (err) err.textContent = '';
    });
  },

  bindFormSubmit() {
    const form = document.getElementById('add-product-form');
    const submitBtn = document.getElementById('btn-submit-inventory');
    const btnText = document.getElementById('btn-submit-text');
    const spinner = document.getElementById('btn-submit-spinner');

    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const productData = {
        item_name: document.getElementById('prod-name').value,
        sku: document.getElementById('prod-sku').value,
        category: this.selectedCategory,
        size: document.getElementById('prod-size').value || 'N/A',
        price: document.getElementById('prod-price').value,
        stock_quantity: document.getElementById('prod-stock').value,
        supplier: document.getElementById('prod-supplier').value
      };

      // Set Loading State
      submitBtn.disabled = true;
      submitBtn.classList.add('is-loading');
      spinner.style.display = 'inline-block';
      btnText.textContent = 'Executing n8n Automation...';
      this.resetStepper();

      // Execute n8n Workflow with step callback
      const result = await window.ApiService.submitProduct(productData, (stepData) => {
        this.updateStepUi(stepData.step, stepData.status);
      });

      // Restore button
      submitBtn.disabled = false;
      submitBtn.classList.remove('is-loading');
      spinner.style.display = 'none';
      btnText.textContent = 'Add to Inventory';

      // Handle Feedback
      if (result.status === 201) {
        if (result.aiTriggered) {
          this.renderFeedback('ai-trigger', '201 Created & Groq AI Agent Triggered', 'Product appended to Sheet1. Stock is &le; 5, so Groq AI Agent recorded a replenishment alert in Reorder_Alerts sheet.');
        } else {
          this.renderFeedback('success', '201 Created: Product Added Successfully', 'Product validated, unique SKU confirmed, and record appended to Google Sheets (Sheet1).');
        }
        window.App.showToast('Product registered in inventory', 'success');
        this.resetForm();
      } else if (result.status === 409 || result.status === 'duplicate_sku') {
        this.renderFeedback('duplicate', '409 Conflict: Duplicate SKU Detected', result.message);
        window.App.showToast('409 Conflict: Duplicate SKU', 'warning');
      } else {
        this.renderFeedback('invalid', '400 Bad Request: Invalid Product Data', result.message);
        window.App.showToast('400 Bad Request: Validation Error', 'error');
      }
    });
  },

  resetStepper() {
    for (let i = 1; i <= 4; i++) {
      const stepEl = document.getElementById(`pipeline-step-${i}`);
      if (stepEl) {
        stepEl.className = 'pipeline-step';
      }
    }
    const feedbackPanel = document.getElementById('automation-feedback-panel');
    if (feedbackPanel) feedbackPanel.style.display = 'none';
  },

  updateStepUi(stepNum, status) {
    const stepEl = document.getElementById(`pipeline-step-${stepNum}`);
    if (stepEl) {
      stepEl.className = `pipeline-step ${status}`;
    }
  },

  renderFeedback(type, title, description) {
    const panel = document.getElementById('automation-feedback-panel');
    const titleEl = document.getElementById('feedback-title');
    const descEl = document.getElementById('feedback-desc');
    const iconEl = document.getElementById('feedback-icon');

    if (!panel) return;
    panel.className = `automation-feedback-panel ${type}`;
    panel.style.display = 'block';

    if (titleEl) titleEl.innerHTML = title;
    if (descEl) descEl.innerHTML = description;

    if (iconEl) {
      if (type === 'success') {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:20px;height:20px;"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      } else if (type === 'ai-trigger') {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
      } else if (type === 'duplicate') {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
      } else {
        iconEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;
      }
    }
  }
};

window.AddProductController = AddProductController;
