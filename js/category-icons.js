/**
 * Category icon set — sportswear-themed SVGs (neon cyan outline style)
 */
const CategoryIcons = {
  categories: ['Footwear', 'Apparel', 'Accessories', 'Training Gear', 'Sports Equipment'],

  icons: {
    Footwear:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 17h16"/>' +
      '<path d="M6 17c0-3.5 1.5-6 4-7.5l1.5-3.5h2L15 9c2.5 1.5 4 4 4 8"/>' +
      '<path d="M9 14h6"/>' +
      '</svg>',

    Apparel:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 2.5h-2l-2.5 3.5L9 2.5H7L3.5 7v14h17V7L16 2.5z"/>' +
      '<path d="M12 6v15"/>' +
      '</svg>',

    Accessories:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="14" r="5"/>' +
      '<path d="M12 9V5"/>' +
      '<path d="M9 5h6"/>' +
      '<path d="M12 14v3"/>' +
      '</svg>',

    'Training Gear':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M6 9h12v6H6z"/>' +
      '<path d="M4 11v2M20 11v2"/>' +
      '<path d="M6 7V5M18 7V5M6 19v-2M18 19v-2"/>' +
      '</svg>',

    'Sports Equipment':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 3v18"/>' +
      '<path d="M3 12h18"/>' +
      '<path d="M5.5 8.5c2.5 1.5 10.5 1.5 13 0"/>' +
      '<path d="M5.5 15.5c2.5-1.5 10.5-1.5 13 0"/>' +
      '</svg>'
  },

  get(category) {
    return this.icons[category] || this.icons['Sports Equipment'];
  },

  wrap(category, className = 'cat-icon') {
    return `<span class="${className}" aria-hidden="true">${this.get(category)}</span>`;
  },

  wrapAvatar(category, className = 'product-avatar-icon') {
    return `<div class="${className}" aria-hidden="true">${this.get(category)}</div>`;
  },

  setSelectedIcon(category) {
    const iconEl = document.getElementById('selected-category-icon');
    if (iconEl) iconEl.innerHTML = this.get(category);
  }
};

window.CategoryIcons = CategoryIcons;
