/**
 * Main Application Coordinator, Router, Theme Manager & UI Engine
 */

const App = {
  currentView: 'dashboard',

  init() {
    this.initTheme();
    this.initRouter();
    this.initLiveClock();
    this.initMobileMenu();
    this.initAutomationModal();
    this.initModals();

    // Initialize sub-controllers
    window.DashboardController.init();
    window.AddProductController.init();
    window.InventoryController.init();
    window.AiReorderController.init();

    // Subscribe to store updates for automatic reactivity
    window.appStore.subscribe(() => {
      this.handleStateChange();
    });

    // Update initial sidebar badge
    this.updateSidebarBadges();
  },

  initTheme() {
    const savedTheme = localStorage.getItem('sportswear_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButtonIcon(savedTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('sportswear_theme', next);
        this.updateThemeButtonIcon(next);

        // Redraw charts with new theme colors
        window.DashboardController.renderCharts();
        this.showToast(`Switched to ${next.toUpperCase()} mode`, 'info');
      });
    }
  },

  updateThemeButtonIcon(theme) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (theme === 'light') {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      btn.title = 'Switch to Dark Mode';
    } else {
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      btn.title = 'Switch to Light Mode';
    }
  },

  initRouter() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const viewName = item.getAttribute('data-view');
        this.navigateTo(viewName);
      });
    });
  },

  navigateTo(viewName) {
    this.currentView = viewName;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update breadcrumbs
    const breadcrumb = document.getElementById('header-current-view');
    if (breadcrumb) {
      const titles = {
        'dashboard': 'Dashboard Overview',
        'add-product': 'Add Inventory Product',
        'inventory': 'Inventory Explorer',
        'ai-reorder': 'AI Reorder Center'
      };
      breadcrumb.textContent = titles[viewName] || 'Dashboard';
    }

    // Toggle View Containers
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close mobile menu if open
    this.closeMobileMenu();

    // Trigger view-specific re-renders
    if (viewName === 'dashboard') {
      window.DashboardController.render();
    } else if (viewName === 'inventory') {
      window.InventoryController.render();
    } else if (viewName === 'ai-reorder') {
      window.AiReorderController.render();
    }
  },

  initLiveClock() {
    const clockEl = document.getElementById('live-clock-text');
    const updateTime = () => {
      if (!clockEl) return;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      clockEl.textContent = `${timeStr} UTC`;
    };
    updateTime();
    setInterval(updateTime, 1000);
  },

  initMobileMenu() {
    const toggleBtn = document.getElementById('menu-toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn && sidebar && backdrop) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }
  },

  closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  },

  initAutomationModal() {
    const statusCard = document.getElementById('automation-status-trigger');
    if (statusCard) {
      statusCard.addEventListener('click', () => {
        const state = window.appStore.getState();
        const urlInput = document.getElementById('cfg-n8n-webhook-url');
        if (urlInput) urlInput.value = state.settings.n8nWebhookUrl;
        this.openModal('modal-n8n-workflow');
      });
    }

    const saveSettingsBtn = document.getElementById('btn-save-n8n-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        const urlInput = document.getElementById('cfg-n8n-webhook-url');
        if (urlInput && urlInput.value.trim()) {
          window.appStore.saveSettings({
            n8nWebhookUrl: urlInput.value.trim(),
            n8nMode: 'auto'
          });
          this.showToast('n8n Webhook Configuration Saved!', 'success');
        }
      });
    }
  },

  initModals() {
    // Backdrop click close
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeModal(modal.id);
        }
      });
    });

    // Close button click
    document.querySelectorAll('.modal-close, .modal-cancel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) this.closeModal(modal.id);
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  handleStateChange() {
    this.updateSidebarBadges();
    if (this.currentView === 'dashboard') {
      window.DashboardController.render();
    } else if (this.currentView === 'inventory') {
      window.InventoryController.render();
    } else if (this.currentView === 'ai-reorder') {
      window.AiReorderController.render();
    }
  },

  updateSidebarBadges() {
    const state = window.appStore.getState();
    const alertCount = state.metrics.aiAlerts;
    const badge = document.getElementById('sidebar-ai-badge');
    if (badge) {
      badge.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        <span>${alertCount}</span>
      `;
      badge.style.display = alertCount > 0 ? 'inline-flex' : 'none';
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    let title = 'Success';

    if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      title = 'Action Failed';
    } else if (type === 'warning') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      title = 'Warning';
    } else if (type === 'ai') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`;
      title = 'AI Automation Triggered';
    } else if (type === 'info') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
      title = 'System Notice';
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${message}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 250);
    }, 4000);
  }
};

window.App = App;

// Bootstrap on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
