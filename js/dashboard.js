/**
 * Page 01 - Dashboard Command Center Controller
 * Connected with interactive KPI clicks, chart hovers, and live metrics
 */

const DashboardController = {
  init() {
    this.bindEvents();
    this.bindKpiClicks();
    this.render();
  },

  bindEvents() {
    const aiBannerBtn = document.getElementById('dashboard-ai-cta');
    if (aiBannerBtn) {
      aiBannerBtn.addEventListener('click', () => {
        window.App.navigateTo('ai-reorder');
      });
    }

    const quickAddBtn = document.getElementById('dashboard-quick-add');
    if (quickAddBtn) {
      quickAddBtn.addEventListener('click', () => {
        window.App.navigateTo('add-product');
      });
    }

    window.addEventListener('resize', () => {
      this.renderCharts();
    });
  },

  bindKpiClicks() {
    // 01: Total Products Click
    const cardTotal = document.getElementById('kpi-card-total');
    if (cardTotal) {
      cardTotal.addEventListener('click', () => {
        window.InventoryController.currentCategory = 'ALL';
        window.InventoryController.currentStatus = 'ALL';
        window.InventoryController.searchQuery = '';
        window.App.navigateTo('inventory');
      });
    }

    // 02: In Stock Click
    const cardInStock = document.getElementById('kpi-card-instock');
    if (cardInStock) {
      cardInStock.addEventListener('click', () => {
        window.InventoryController.currentStatus = 'IN STOCK';
        window.App.navigateTo('inventory');
      });
    }

    // 03: Low Stock Click
    const cardLowStock = document.getElementById('kpi-card-lowstock');
    if (cardLowStock) {
      cardLowStock.addEventListener('click', () => {
        window.InventoryController.currentStatus = 'LOW STOCK';
        window.App.navigateTo('inventory');
      });
    }

    // 04: AI Reorder Alerts Click
    const cardAiAlerts = document.getElementById('kpi-card-aialerts');
    if (cardAiAlerts) {
      cardAiAlerts.addEventListener('click', () => {
        window.App.navigateTo('ai-reorder');
      });
    }
  },

  render() {
    const state = window.appStore.getState();
    const { products, metrics, settings } = state;

    // 1. Update KPI Card Metrics
    this.updateKpi('kpi-total-products', metrics.totalProducts);
    this.updateKpi('kpi-in-stock', metrics.inStock);
    this.updateKpi('kpi-low-stock', metrics.lowStock);
    this.updateKpi('kpi-ai-alerts', metrics.aiAlerts);

    // 2. Update AI Insight Banner Text
    const aiInsightText = document.getElementById('ai-insight-text');
    if (aiInsightText) {
      if (metrics.critical > 0) {
        aiInsightText.textContent = `${metrics.critical} critical item${metrics.critical > 1 ? 's' : ''} require immediate replenishment. Groq AI reorder analysis active.`;
      } else if (metrics.lowStock > 0) {
        aiInsightText.textContent = `${metrics.lowStock} products are at or below threshold (stock &le; 5). Groq AI recommendations recorded in Reorder_Alerts.`;
      } else {
        aiInsightText.textContent = 'All inventory levels are within optimal thresholds (> 5 units). Continuous Groq AI monitoring active.';
      }
    }

    // 3. Render Donut & Category Charts
    this.renderCharts();

    // 4. Render Recent Inventory Table (Last 5 items)
    this.renderRecentTable(products.slice(0, 5), settings.currency);
  },

  updateKpi(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  },

  renderCharts() {
    const state = window.appStore.getState();
    const healthCanvas = document.getElementById('health-donut-chart');
    if (healthCanvas) {
      window.DashboardCharts.renderHealthDonut(healthCanvas, {
        inStock: state.metrics.inStock,
        lowStock: state.metrics.lowStock,
        critical: state.metrics.critical
      });
    }

    const categoryCanvas = document.getElementById('category-bar-chart');
    if (categoryCanvas) {
      const counts = {
        'Footwear': 0,
        'Apparel': 0,
        'Accessories': 0,
        'Training Gear': 0,
        'Sports Equipment': 0
      };
      state.products.forEach(p => {
        if (counts[p.category] !== undefined) counts[p.category]++;
      });
      window.DashboardCharts.renderCategoryBars(categoryCanvas, counts);
    }
  },

  renderRecentTable(recentProducts, currency = 'Rs. ') {
    const tbody = document.getElementById('recent-inventory-tbody');
    if (!tbody) return;

    if (recentProducts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No products registered in inventory yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = recentProducts.map(p => {
      const status = window.appStore.getProductStatus(p.stock);
      const statusClass = status === 'IN STOCK' ? 'in-stock' : (status === 'LOW STOCK' ? 'low-stock' : 'critical');

      return `
        <tr style="cursor: pointer;" onclick="window.App.navigateTo('inventory')">
          <td>
            <div class="table-product-cell">
              ${window.CategoryIcons ? CategoryIcons.wrapAvatar(p.category) : ''}
              <div class="product-cell-meta">
                <span class="product-cell-name">${this.escapeHtml(p.name)}</span>
                <span class="product-cell-sub">${p.size !== 'N/A' ? `Size: ${this.escapeHtml(p.size)}` : 'One Size'}</span>
              </div>
            </div>
          </td>
          <td><span class="sku-badge">${this.escapeHtml(p.sku)}</span></td>
          <td><span class="category-tag">${this.escapeHtml(p.category)}</span></td>
          <td><strong style="font-family: var(--font-mono);">${p.stock}</strong></td>
          <td><span style="font-family: var(--font-mono); font-weight: 600;">${currency}${p.price.toLocaleString()}</span></td>
          <td><span class="status-pill ${statusClass}">${status}</span></td>
        </tr>
      `;
    }).join('');
  },

  getCategoryIconSvg(category) {
    return window.CategoryIcons ? CategoryIcons.get(category) : '';
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.DashboardController = DashboardController;
