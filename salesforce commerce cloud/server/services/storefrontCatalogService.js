const CATEGORY_PALETTES = [
  { background: '#dfefff', accent: '#0071ce', text: '#004c91' },
  { background: '#ede7ff', accent: '#7c4dff', text: '#4a2ea6' },
  { background: '#e6f7ef', accent: '#1f9d62', text: '#176c45' },
  { background: '#fff1dd', accent: '#f59e0b', text: '#9a6700' },
  { background: '#ffe5ea', accent: '#e11d48', text: '#9f1239' },
];

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'uncategorized';
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getPalette(categoryName) {
  const slug = slugify(categoryName);
  let hash = 0;

  for (let index = 0; index < slug.length; index += 1) {
    hash += slug.charCodeAt(index);
  }

  return CATEGORY_PALETTES[hash % CATEGORY_PALETTES.length];
}

function buildCategoryImage(categoryName) {
  const palette = getPalette(categoryName);
  const label = String(categoryName || 'Category').trim().slice(0, 28) || 'Category';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" role="img" aria-label="${escapeXml(label)}">
      <rect width="640" height="400" rx="28" fill="${palette.background}" />
      <circle cx="120" cy="110" r="62" fill="${palette.accent}" opacity="0.18" />
      <circle cx="540" cy="300" r="88" fill="${palette.accent}" opacity="0.14" />
      <rect x="88" y="150" width="464" height="132" rx="24" fill="#ffffff" opacity="0.92" />
      <text x="112" y="218" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="${palette.text}">${escapeXml(label)}</text>
      <text x="112" y="258" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="${palette.text}" opacity="0.72">Storefront category</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildProductCard(product) {
  const categoryName = String(product.category || 'Uncategorized').trim() || 'Uncategorized';
  const inventory = Number(product.inventory || 0);

  return {
    id: String(product.id),
    title: product.name,
    description: product.description || 'No description provided yet.',
    price: formatPrice(product.price),
    priceValue: Number(product.price || 0),
    categoryName,
    stock: inventory,
    stockLabel: inventory > 0 ? `${inventory} in stock` : 'Out of stock',
    status: product.status || (inventory > 0 ? 'Active' : 'Draft'),
    updated: product.updated || '',
    image: product.image || buildCategoryImage(categoryName),
  };
}

function buildCategorySections(categories, products) {
  return categories.map((category) => {
    const categoryName = String(category.name || 'Uncategorized').trim() || 'Uncategorized';
    const categoryProducts = products
      .filter((product) => String(product.category || '').trim() === categoryName)
      .map(buildProductCard);

    return {
      id: String(category.id || slugify(categoryName)),
      name: categoryName,
      slug: slugify(categoryName),
      image: buildCategoryImage(categoryName),
      productCount: categoryProducts.length,
      products: categoryProducts,
    };
  });
}

module.exports = {
  buildCategoryImage,
  buildCategorySections,
  buildProductCard,
  formatPrice,
  slugify,
};
