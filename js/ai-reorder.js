/**
 * Page 04 - AI Reorder Center Controller
 */

const AiReorderController = {
  currentUrgency: 'ALL',

  init() {
    this.bindFilters();
    this.bindAuditButton();
    this.bindModalActions();
    this.render();
  },

  bindFilters() {
    const filterBtns = document.querySelectorAll('.urgency-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentUrgency = btn.getAttribute('data-urgency');
        this.render();
      });
    });
  },

  bindAuditButton() {
    const auditBtn = document.getElementById('btn-run-ai-audit');
    if (auditBtn) {
      auditBtn.addEventListener('click', async () => {
        const icon = auditBtn.querySelector('svg');
        const text = auditBtn.querySelector('span');
        if (icon) icon.style.animation = 'spin 0.8s infinite linear';
        if (text) text.textContent = 'Analyzing Stock Buffers...';
        auditBtn.disabled = true;

        await window.ApiService.delay(900);
        window.appStore.runAiAudit();

        if (icon) icon.style.animation = 'none';
        if (text) text.textContent = 'Run Instant AI Audit';
        auditBtn.disabled = false;

        window.App.showToast('AI Stock Audit completed across all inventory SKUs!', 'ai');
      });
    }
  },

  bindModalActions() {
    const approveBtn = document.getElementById('modal-po-approve-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', async () => {
        const prodId = document.getElementById('modal-po-prod-id').value;
        const units = document.getElementById('modal-po-units-input').value;
        const supplier = document.getElementById('modal-po-supplier').textContent;

        approveBtn.disabled = true;
        approveBtn.textContent = 'Dispatching PO via n8n...';

        const result = await window.ApiService.submitPurchaseOrder(prodId, units, supplier);

        approveBtn.disabled = false;
        approveBtn.textContent = 'Approve & Dispatch PO';
        window.App.closeModal('modal-po-review');

        if (result.success) {
          window.App.showToast(`${result.message} [${result.orderId}]`, 'success');
        } else {
          window.App.showToast(result.message, 'error');
        }
      });
    }
  },

  render() {
    const state = window.appStore.getState();
    const { products, metrics } = state;

    // Filter products that have AI recommendations
    const aiProducts = products.filter(p => p.aiRecommendation);

    // Calculate Summary Metrics
    let criticalCount = 0;
    let highCount = 0;
    let totalRecommendedUnits = 0;

    aiProducts.forEach(p => {
      if (p.aiRecommendation.urgency === 'critical') criticalCount++;
      if (p.aiRecommendation.urgency === 'high') highCount++;
      totalRecommendedUnits += p.aiRecommendation.recommendedUnits || 0;
    });

    // Update Summary Header Cards
    this.updateVal('ai-stat-critical', criticalCount);
    this.updateVal('ai-stat-high', highCount);
    this.updateVal('ai-stat-units', totalRecommendedUnits);
    this.updateVal('ai-stat-analyzed', products.length);

    // Filter by selected urgency
    let displayList = aiProducts;
    if (this.currentUrgency !== 'ALL') {
      displayList = displayList.filter(p => p.aiRecommendation.urgency === this.currentUrgency);
    }

    const container = document.getElementById('ai-cards-grid');
    const emptyState = document.getElementById('ai-empty-state');

    if (displayList.length === 0) {
      if (container) container.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
    } else {
      if (container) container.style.display = 'grid';
      if (emptyState) emptyState.style.display = 'none';
      this.renderCards(container, displayList, state.settings.currency);
    }
  },

  updateVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  renderCards(container, products, currency) {
    if (!container) return;

    container.innerHTML = products.map(p => {
      const rec = p.aiRecommendation;
      const urgency = rec.urgency || 'medium';
      const estCost = currency + ((rec.recommendedUnits || 10) * p.price).toLocaleString();

      return `
        <div class="ai-reorder-card urgency-${urgency}">
          <div>
            <div class="ai-card-top">
              <div class="ai-product-heading">
                ${window.CategoryIcons ? CategoryIcons.wrapAvatar(p.category, 'ai-product-icon') : ''}
                <div>
                  <h4 class="ai-product-title">${this.escapeHtml(p.name)}</h4>
                  <div class="ai-product-sku-row">
                    <span class="sku-badge">${this.escapeHtml(p.sku)}</span>
                    <span class="category-tag">${this.escapeHtml(p.category)}</span>
                  </div>
                </div>
              </div>
              <span class="urgency-badge ${urgency}">
                ${urgency.toUpperCase()} URGENCY
              </span>
            </div>

            <div class="ai-numbers-grid">
              <div class="ai-num-box">
                <span class="ai-num-label">Current Stock</span>
                <span class="ai-num-val" style="color: ${p.stock <= 2 ? 'var(--status-critical)' : 'var(--status-warning)'};">${p.stock} units</span>
              </div>
              <div class="ai-num-box">
                <span class="ai-num-label">AI Reorder</span>
                <span class="ai-num-val recommended">+${rec.recommendedUnits || 15} units</span>
              </div>
              <div class="ai-num-box">
                <span class="ai-num-label">Supplier</span>
                <span class="ai-num-val supplier">${this.escapeHtml(p.supplier)}</span>
              </div>
            </div>

            <div class="ai-reason-box">
              <div class="ai-reason-header">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                AI Reasoning Analysis
              </div>
              <p class="ai-reason-text">${this.escapeHtml(rec.reason)}</p>
            </div>
          </div>

          <button class="btn-review-rec" onclick="AiReorderController.openPoModal('${p.id}')">
            Review Recommendation & PO
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      `;
    }).join('');
  },

  openPoModal(productId) {
    const state = window.appStore.getState();
    const product = state.products.find(p => p.id === productId);
    if (!product || !product.aiRecommendation) return;

    const rec = product.aiRecommendation;
    const units = rec.recommendedUnits || 15;
    const totalCost = (units * product.price).toLocaleString();

    document.getElementById('modal-po-prod-id').value = product.id;
    document.getElementById('modal-po-title').textContent = product.name;
    document.getElementById('modal-po-sku').textContent = product.sku;
    document.getElementById('modal-po-current-stock').textContent = `${product.stock} units`;
    document.getElementById('modal-po-supplier').textContent = product.supplier;
    document.getElementById('modal-po-units-input').value = units;
    document.getElementById('modal-po-unit-price').textContent = `${state.settings.currency}${product.price.toLocaleString()}`;
    document.getElementById('modal-po-total-cost').textContent = `${state.settings.currency}${totalCost}`;

    // Live update total cost when units change
    const unitsInput = document.getElementById('modal-po-units-input');
    unitsInput.oninput = () => {
      const q = parseInt(unitsInput.value, 10) || 0;
      document.getElementById('modal-po-total-cost').textContent = `${state.settings.currency}${(q * product.price).toLocaleString()}`;
    };

    window.App.openModal('modal-po-review');
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.AiReorderController = AiReorderController;
