/**
 * State Management & Data Store for Sportswear Inventory Manager
 * Matched with Daniyal Arqam's n8n Workflow & Google Sheets Schema
 */

const STORAGE_KEY = 'sportswear_inventory_v2';
const SETTINGS_KEY = 'sportswear_settings_v2';

// Standard Low Stock Threshold in Daniyal's n8n workflow: stock_quantity <= 5
const LOW_STOCK_THRESHOLD = 5;

// Initial Sample Sportswear Products matching Google Sheets columns
const INITIAL_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Velocity ZoomX Pro Runners',
    sku: 'RUN-001',
    category: 'Footwear',
    size: 'US 10.5',
    price: 8500,
    stock: 24,
    minThreshold: 5,
    supplier: 'Nike Global Logistics',
    createdAt: '2026-08-15T10:30:00Z',
    aiRecommendation: null
  },
  {
    id: 'prod-002',
    name: 'Apex Grip Wrist Support Wrap',
    sku: 'WR-002',
    category: 'Accessories',
    size: 'N/A',
    price: 1200,
    stock: 2,
    minThreshold: 5,
    supplier: 'Gymshark Tech Ltd',
    createdAt: '2026-08-16T11:15:00Z',
    aiRecommendation: {
      urgency: 'critical',
      recommendedUnits: 25,
      reason: 'Critical stock alert (2 units remaining). High training season demand requires immediate replenishment to avoid stockout.'
    }
  },
  {
    id: 'prod-003',
    name: 'Aura Thermal Compression Top',
    sku: 'APP-003',
    category: 'Apparel',
    size: 'L',
    price: 4600,
    stock: 4,
    minThreshold: 5,
    supplier: 'Under Armour PK',
    createdAt: '2026-08-18T14:20:00Z',
    aiRecommendation: {
      urgency: 'high',
      recommendedUnits: 18,
      reason: 'Stock dropped to 4 units (<= 5). Weekly velocity indicates stock exhaustion within 5 days.'
    }
  },
  {
    id: 'prod-004',
    name: 'Kevlar Pro Olympic Lifting Belt',
    sku: 'EQ-004',
    category: 'Training Gear',
    size: 'M',
    price: 9200,
    stock: 1,
    minThreshold: 5,
    supplier: 'Rogue Fitness Supply',
    createdAt: '2026-08-20T09:00:00Z',
    aiRecommendation: {
      urgency: 'critical',
      recommendedUnits: 15,
      reason: 'Stock is critically low (1 unit). Top performing training gear SKU with high profit margin.'
    }
  },
  {
    id: 'prod-005',
    name: 'HydroFlow Matte Sports Flask 1L',
    sku: 'ACC-005',
    category: 'Accessories',
    size: '1000ml',
    price: 2400,
    stock: 35,
    minThreshold: 5,
    supplier: 'Aura Hydro Gear',
    createdAt: '2026-08-21T16:45:00Z',
    aiRecommendation: null
  },
  {
    id: 'prod-006',
    name: 'Aerolight Dry-Fit Track Shorts',
    sku: 'APP-006',
    category: 'Apparel',
    size: 'M',
    price: 3200,
    stock: 5,
    minThreshold: 5,
    supplier: 'Adidas Sourcing Hub',
    createdAt: '2026-08-22T13:10:00Z',
    aiRecommendation: {
      urgency: 'high',
      recommendedUnits: 20,
      reason: 'Stock at threshold boundary (5 units). Suggested batch reorder during regular delivery window.'
    }
  },
  {
    id: 'prod-007',
    name: 'Strike Hex Dumbbell Set (15kg)',
    sku: 'EQ-007',
    category: 'Sports Equipment',
    size: '15kg',
    price: 14500,
    stock: 12,
    minThreshold: 5,
    supplier: 'Titan Athletics',
    createdAt: '2026-08-24T15:00:00Z',
    aiRecommendation: null
  },
  {
    id: 'prod-008',
    name: 'TEST-VALID-001 Pro Tennis Racket',
    sku: 'TEST-VALID-001',
    category: 'Sports Equipment',
    size: 'N/A',
    price: 18900,
    stock: 3,
    minThreshold: 5,
    supplier: 'Wilson Sports Corp',
    createdAt: '2026-08-25T11:40:00Z',
    aiRecommendation: {
      urgency: 'high',
      recommendedUnits: 10,
      reason: 'Stock at 3 units (High Urgency). Replenish to meet tournament season spike.'
    }
  }
];

class Store {
  constructor() {
    this.subscribers = [];
    this.products = this.loadProducts();
    this.settings = this.loadSettings();
  }

  loadProducts() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved inventory data', e);
      }
    }
    return INITIAL_PRODUCTS;
  }

  saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
    this.notify();
  }

  loadSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      n8nMode: 'live', // 'auto' (hybrid) | 'live' (real HTTP webhook) | 'mock'
      n8nWebhookUrl: 'https://daniyal-arqam.app.n8n.cloud/webhook/Inventory',
      googleSheetDocId: '1KsaEzJnn4Q0NIaOEBlLWyEp6tjH3TW3wlKe-Tn2yOiE',
      googleSheetName: 'Sheet1',
      googleSheetAlerts: 'Reorder_Alerts',
      currency: 'Rs. ',
      theme: 'dark'
    };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    this.notify();
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.subscribers.forEach(cb => cb(this.getState()));
  }

  getState() {
    return {
      products: [...this.products],
      settings: { ...this.settings },
      metrics: this.calculateMetrics()
    };
  }

  calculateMetrics() {
    const total = this.products.length;
    let inStock = 0;
    let lowStock = 0;
    let critical = 0;
    let aiAlerts = 0;
    let totalUnitsRecommended = 0;

    this.products.forEach(p => {
      const status = this.getProductStatus(p.stock);
      if (status === 'IN STOCK') inStock++;
      else if (status === 'LOW STOCK') lowStock++;
      else if (status === 'CRITICAL') critical++;

      if (p.aiRecommendation) {
        aiAlerts++;
        totalUnitsRecommended += p.aiRecommendation.recommendedUnits || 0;
      }
    });

    return {
      totalProducts: total,
      inStock,
      lowStock,
      critical,
      aiAlerts,
      totalUnitsRecommended
    };
  }

  getProductStatus(stock) {
    if (stock <= 2) return 'CRITICAL';
    if (stock <= 5) return 'LOW STOCK';
    return 'IN STOCK';
  }

  getUrgencyLevel(stock) {
    if (stock <= 2) return 'critical';
    if (stock <= 5) return 'high';
    if (stock <= 10) return 'medium';
    return 'low';
  }

  isDuplicateSku(sku, excludeId = null) {
    const cleanSku = sku.trim().toUpperCase();
    return this.products.some(p => p.sku.toUpperCase() === cleanSku && p.id !== excludeId);
  }

  addProduct(productData) {
    const cleanSku = productData.sku.trim().toUpperCase();
    const stockQty = parseInt(productData.stock || productData.stock_quantity, 10);
    const priceVal = parseFloat(productData.price);

    const newProduct = {
      id: 'prod-' + Date.now(),
      name: (productData.name || productData.item_name).trim(),
      sku: cleanSku,
      category: productData.category.trim(),
      size: (productData.size && productData.size.trim()) ? productData.size.trim() : 'N/A',
      price: priceVal,
      stock: stockQty,
      minThreshold: 5,
      supplier: (productData.supplier && productData.supplier.trim()) ? productData.supplier.trim() : 'Unknown',
      createdAt: new Date().toISOString(),
      aiRecommendation: null
    };

    // Low stock trigger: stock_quantity <= 5 (Matched with n8n workflow)
    if (newProduct.stock <= 5) {
      const urgency = this.getUrgencyLevel(newProduct.stock);
      const recommendedUnits = Math.max(10, (12 - newProduct.stock) * 2);
      newProduct.aiRecommendation = {
        urgency,
        recommendedUnits,
        reason: `Groq AI Agent: Stock (${newProduct.stock} units) <= 5. Urgency classified as ${urgency.toUpperCase()}. Appended to Reorder_Alerts sheet with ${recommendedUnits} suggested units.`
      };
    }

    this.products.unshift(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateStock(productId, newStock) {
    const p = this.products.find(item => item.id === productId);
    if (p) {
      p.stock = Math.max(0, parseInt(newStock, 10));
      
      if (p.stock <= 5) {
        const urgency = this.getUrgencyLevel(p.stock);
        const recommendedUnits = Math.max(10, (15 - p.stock) * 2);
        p.aiRecommendation = {
          urgency,
          recommendedUnits,
          reason: `Groq AI Agent: Stock updated to ${p.stock} units (<= 5). Urgency classified as ${urgency.toUpperCase()}.`
        };
      } else {
        p.aiRecommendation = null;
      }

      this.saveProducts();
    }
  }

  deleteProduct(productId) {
    this.products = this.products.filter(p => p.id !== productId);
    this.saveProducts();
  }

  runAiAudit() {
    this.products.forEach(p => {
      if (p.stock <= 5) {
        const urgency = this.getUrgencyLevel(p.stock);
        const recommendedUnits = Math.max(10, (14 - p.stock) * 2);
        p.aiRecommendation = {
          urgency,
          recommendedUnits,
          reason: `Groq AI Agent Stock Audit: Low stock verified (${p.stock} units <= 5). Reorder recommendation saved for ${p.supplier}.`
        };
      }
    });
    this.saveProducts();
  }

  resetToDefault() {
    this.products = [...INITIAL_PRODUCTS];
    this.saveProducts();
  }
}

window.appStore = new Store();
