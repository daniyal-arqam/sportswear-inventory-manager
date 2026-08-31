/**
 * Category icon set — sportswear-themed SVGs matching dashboard neon style
 */
const CategoryIcons = {
  svgAttrs: 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"',

  icons: {
    Footwear:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 18h18"/>' +
      '<path d="M5 18c0-4 2-7 5-8l2-4h2l1.5 4c3 1 5 4 5 8"/>' +
      '<path d="M8 15h8"/>' +
      '</svg>',

    Apparel:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M16 3h-2l-2 3-2-3H8L4 7v14h16V7l-4-4z"/>' +
      '<path d="M12 6v15"/>' +
      '</svg>',

    Accessories:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<rect x="7" y="7" width="10" height="10" rx="2"/>' +
      '<path d="M9 3v4M15 3v4M9 17v4M15 17v4"/>' +
      '<circle cx="12" cy="12" r="2"/>' +
      '</svg>',

    'Training Gear':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M4 10v4M20 10v4"/>' +
      '<path d="M6 8v8M18 8v8"/>' +
      '<path d="M6 12h12"/>' +
      '</svg>',

    'Sports Equipment':
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="12" cy="12" r="9"/>' +
      '<path d="M12 3a6 6 0 0 1 0 18"/>' +
      '<path d="M3 12h18"/>' +
      '<path d="M5.5 7.5c3 2 10 2 13 0"/>' +
      '<path d="M5.5 16.5c3-2 10-2 13 0"/>' +
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
  }
};

window.CategoryIcons = CategoryIcons;
