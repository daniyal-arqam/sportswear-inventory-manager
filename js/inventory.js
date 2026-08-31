/**
 * Page 03 - Inventory Explorer Controller
 */

const InventoryController = {
  currentCategory: 'ALL',
  currentStatus: 'ALL',
  currentSort: 'name_asc',
  searchQuery: '',

  init() {
    this.bindFilters();
    this.bindSearch();
    this.bindSort();
    this.bindTableActions();
    this.render();
  },

  bindFilters() {
    const categoryChips = document.querySelectorAll('.inventory-cat-chip');
    categoryChips.forEach(chip => {
      chip.addEventListener('click', () => {
        categoryChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentCategory = chip.getAttribute('data-category');
        this.render();
      });
    });

    const statusChips = document.querySelectorAll('.inventory-status-chip');
    statusChips.forEach(chip => {
      chip.addEventListener('click', () => {
        statusChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentStatus = chip.getAttribute('data-status');
        this.render();
      });
    });

    const addBtn = document.getElementById('inventory-add-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.App.navigateTo('add-product');
      });
    }
  },

  bindSearch() {
    const searchInput = document.getElementById('inventory-search');
    const clearBtn = document.getElementById('search-clear-btn');

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchQuery = searchInput.value.trim().toLowerCase();
        if (clearBtn) {
          clearBtn.classList.toggle('visible', this.searchQuery.length > 0);
        }
        this.render();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        this.searchQuery = '';
        clearBtn.classList.remove('visible');
        this.render();
      });
    }
  },

  bindSort() {
    const sortSelect = document.getElementById('inventory-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.render();
      });
    }
  },

  bindTableActions() {
    // Quick Stock Adjust Modal Save
    const stockSaveBtn = document.getElementById('modal-stock-save-btn');
    if (stockSaveBtn) {
      stockSaveBtn.addEventListener('click', () => {
        const prodId = document.getElementById('modal-stock-prod-id').value;
        const newStock = document.getElementById('modal-stock-input').value;
        if (prodId && newStock !== '') {
          window.appStore.updateStock(prodId, newStock);
          window.App.closeModal('modal-stock-adjust');
          window.App.showToast('Stock quantity updated successfully.', 'success');
        }
      });
    }
  },

  render() {
    const state = window.appStore.getState();
    let filtered = [...state.products];

    // Filter by Category
    if (this.currentCategory !== 'ALL') {
      filtered = filtered.filter(p => p.category === this.currentCategory);
    }

    // Filter by Status
    if (this.currentStatus !== 'ALL') {
      filtered = filtered.filter(p => {
        const status = window.appStore.getProductStatus(p.stock, p.minThreshold);
        return status === this.currentStatus;
      });
    }

    // Filter by Search Query (Name, SKU, Supplier)
    if (this.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(this.searchQuery) ||
        p.sku.toLowerCase().includes(this.searchQuery) ||
        p.supplier.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort Products
    filtered.sort((a, b) => {
      switch (this.currentSort) {
        case 'stock_asc':
          return a.stock - b.stock;
        case 'stock_desc':
          return b.stock - a.stock;
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Update Counts in Filter Tabs
    this.updateFilterCounts(state.products);

    // Render Table or Empty State
    const tableContainer = document.getElementById('inventory-table-wrap');
    const emptyState = document.getElementById('inventory-empty-state');
    const tbody = document.getElementById('inventory-table-tbody');
    const showingCount = document.getElementById('inventory-showing-count');

    if (filtered.length === 0) {
      if (tableContainer) tableContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      if (showingCount) showingCount.textContent = '0 items';
    } else {
      if (tableContainer) tableContainer.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
      if (showingCount) showingCount.textContent = `Showing ${filtered.length} of ${state.products.length} items`;
      this.renderRows(tbody, filtered, state.settings.currency);
    }
  },

  updateFilterCounts(products) {
    const counts = {
      'ALL': products.length,
      'Footwear': 0,
      'Apparel': 0,
      'Accessories': 0,
      'Training Gear': 0,
      'Sports Equipment': 0
    };
    products.forEach(p => {
      if (counts[p.category] !== undefined) counts[p.category]++;
    });

    Object.keys(counts).forEach(cat => {
      const el = document.getElementById(`cat-count-${cat.replace(/\s+/g, '-').toLowerCase()}`);
      if (el) el.textContent = counts[cat];
    });
  },

  renderRows(tbody, products, currency) {
    if (!tbody) return;

    tbody.innerHTML = products.map(p => {
      const status = window.appStore.getProductStatus(p.stock, p.minThreshold);
      const statusClass = status === 'IN STOCK' ? 'in-stock' : (status === 'LOW STOCK' ? 'low-stock' : 'critical');
      const rowClass = status === 'CRITICAL' ? 'row-critical' : (status === 'LOW STOCK' ? 'row-low-stock' : '');
      // Stock bar percentage (max 30 units as visual 100%)
      const stockPercent = Math.min(100, Math.round((p.stock / 30) * 100));
      const barClass = status === 'IN STOCK' ? 'success' : (status === 'LOW STOCK' ? 'warning' : 'danger');

      return `
        <tr class="${rowClass}">
          <td>
            <div class="table-product-cell">
              <div class="product-cell-meta">
                <span class="product-cell-name">${this.escapeHtml(p.name)}</span>
                <span class="product-cell-sub">Supplier: ${this.escapeHtml(p.supplier)}</span>
              </div>
            </div>
          </td>
          <td><span class="sku-badge">${this.escapeHtml(p.sku)}</span></td>
          <td><span class="category-tag">${this.escapeHtml(p.category)}</span></td>
          <td><span style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">${p.size !== 'N/A' ? this.escapeHtml(p.size) : '-'}</span></td>
          <td><span style="font-family: var(--font-mono); font-weight: 700;">${currency}${p.price.toLocaleString()}</span></td>
          <td>
            <div class="stock-metric-cell">
              <div class="stock-num-row">
                <span class="stock-num">${p.stock} units</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">min ${p.minThreshold || 8}</span>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill ${barClass}" style="width: ${stockPercent}%"></div>
              </div>
            </div>
          </td>
          <td><span class="status-pill ${statusClass}">${status}</span></td>
          <td>
            <div class="row-actions">
              <button type="button" class="btn-table-action btn-table-text" title="Adjust Stock" onclick="InventoryController.openStockModal('${p.id}')">Edit</button>
              ${p.aiRecommendation ? `
                <button type="button" class="btn-table-action btn-table-text btn-table-ai" title="View AI Reorder Recommendation" onclick="window.App.navigateTo('ai-reorder')">AI</button>
              ` : ''}
              <button type="button" class="btn-table-action btn-table-text action-delete" title="Delete Product" onclick="InventoryController.deleteProduct('${p.id}', '${this.escapeHtml(p.name)}')">Del</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  openStockModal(productId) {
    const state = window.appStore.getState();
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('modal-stock-prod-id').value = product.id;
    document.getElementById('modal-stock-prod-name').textContent = product.name;
    document.getElementById('modal-stock-sku').textContent = product.sku;
    document.getElementById('modal-stock-input').value = product.stock;

    window.App.openModal('modal-stock-adjust');
  },

  deleteProduct(productId, productName) {
    if (confirm(`Are you sure you want to remove "${productName}" from the inventory master?`)) {
      window.appStore.deleteProduct(productId);
      window.App.showToast(`Product "${productName}" removed.`, 'warning');
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.InventoryController = InventoryController;
