let products = [];
let categories = [];

const sidebarNav = document.getElementById('sidebarNav');
const sidebarButtons = sidebarNav.querySelectorAll('.nav-item');
const appSections = document.querySelectorAll('.app-section');
const productsPreviewSection = document.getElementById('section-products-previews');

const tableBody = document.getElementById('products-table-body');
const totalProductsEl = document.getElementById('total-products');
const activeProductsEl = document.getElementById('active-products');
const lowStockProductsEl = document.getElementById('low-stock-products');
const draftProductsEl = document.getElementById('draft-products');
const categoriesList = document.getElementById('categories-list');

const productForm = document.getElementById('product-form');
const productCategorySelect = document.getElementById('product-category');
const productFormMessage = document.getElementById('product-form-message');

const filterSearch = document.getElementById('filter-search');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const filterStock = document.getElementById('filter-stock');
const resetFiltersButton = document.getElementById('reset-filters');

function getComputedStatus(product) {
  if (product.status) {
    return product.status;
  }

  if (Number(product.inventory || 0) === 0) {
    return 'Draft';
  }

  if (Number(product.inventory || 0) < 10) {
    return 'Low Stock';
  }

  return 'Active';
}

function getFilteredProducts() {
  const searchValue = filterSearch.value.trim().toLowerCase();
  const categoryValue = filterCategory.value;
  const statusValue = filterStatus.value;
  const stockValue = filterStock.value;

  return products.filter((product) => {
    const name = String(product.name || '').toLowerCase();
    const category = String(product.category || '').toLowerCase();
    const inventory = Number(product.inventory || 0);
    const status = getComputedStatus(product);

    const matchesSearch = !searchValue || name.includes(searchValue) || category.includes(searchValue);
    const matchesCategory = categoryValue === 'all' || product.category === categoryValue;
    const matchesStatus = statusValue === 'all' || status === statusValue;
    const matchesStock = stockValue === 'all'
      || (stockValue === 'in-stock' && inventory > 0)
      || (stockValue === 'low-stock' && inventory > 0 && inventory < 10)
      || (stockValue === 'out-of-stock' && inventory === 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });
}

function getBadgeClass(status) {
  if (status === 'Active') return 'badge--active';
  if (status === 'Draft') return 'badge--draft';
  return 'badge--low';
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


function renderProductThumb(product) {
  if (product.image) {
    return `<img class="thumb thumb--image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" />`;
  }

  return `<div class="thumb" aria-hidden="true">${escapeHtml(String(product.category || 'C').slice(0, 1))}</div>`;
}

function renderProductsTable() {
  const visibleProducts = getFilteredProducts();

  if (visibleProducts.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No products match the current filters. Add a product or reset filters.</td></tr>';
    return;
  }

  tableBody.innerHTML = visibleProducts
    .map((product) => {
      const status = getComputedStatus(product);
      const badgeClass = getBadgeClass(status);
      const inventory = Number(product.inventory || 0);

      return `
        <tr>
          <td>
            <div class="product-cell">
              ${renderProductThumb(product)}
              <div>
                <strong>${escapeHtml(product.name)}</strong>
                <small>${escapeHtml(product.description || 'No description')}</small>
              </div>
            </div>
          </td>
          <td>${escapeHtml(product.category)}</td>
          <td>$${Number(product.price || 0).toFixed(2)}</td>
          <td>${inventory}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(status)}</span></td>
          <td>${escapeHtml(formatDate(product.updated))}</td>
        </tr>
      `;
    })
    .join('');
}

function renderSummaryCards() {
  const total = products.length;
  const active = products.filter((item) => getComputedStatus(item) === 'Active').length;
  const lowStock = products.filter((item) => getComputedStatus(item) === 'Low Stock' || Number(item.inventory || 0) < 10).length;
  const draft = products.filter((item) => getComputedStatus(item) === 'Draft').length;

  totalProductsEl.textContent = String(total);
  activeProductsEl.textContent = String(active);
  lowStockProductsEl.textContent = String(lowStock);
  draftProductsEl.textContent = String(draft);
}

function renderCategoryOptions() {
  const optionsMarkup = categories
    .map((category) => `<option value="${escapeHtml(category.name)}">${escapeHtml(category.name)}</option>`)
    .join('');

  productCategorySelect.innerHTML = optionsMarkup;
  filterCategory.innerHTML = '<option value="all">All Categories</option>' + optionsMarkup;
}

function renderCategoriesSection() {
  if (!categories.length) {
    categoriesList.innerHTML = '<p class="section-note">No categories available.</p>';
    return;
  }

  categoriesList.innerHTML = categories
    .map((category) => {
      const count = products.filter((product) => product.category === category.name).length;
      return `
        <article class="category-admin-card">
          <h3>${escapeHtml(category.name)}</h3>
          <p>${count} product(s) currently assigned.</p>
        </article>
      `;
    })
    .join('');
}

function showSection(sectionName) {
  appSections.forEach((section) => section.classList.remove('is-visible'));

  const target = document.getElementById(`section-${sectionName}`);
  if (target) target.classList.add('is-visible');

  if (sectionName === 'products') {
    productsPreviewSection.classList.add('is-visible');
  } else {
    productsPreviewSection.classList.remove('is-visible');
  }

  sidebarButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.section === sectionName);
  });
}

async function loadData() {
  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/categories')
  ]);

  if (!productsResponse.ok || !categoriesResponse.ok) {
    throw new Error('Failed to load admin data.');
  }

  products = await productsResponse.json();
  categories = await categoriesResponse.json();

  renderCategoryOptions();
  renderProductsTable();
  renderSummaryCards();
  renderCategoriesSection();
}

async function handleProductSubmit(event) {
  event.preventDefault();
  productFormMessage.textContent = 'Saving product...';
  productFormMessage.className = 'form-message';

  const formData = new FormData(productForm);
  const payload = {
    name: formData.get('name'),
    description: formData.get('description'),
    image: formData.get('image'),
    category: formData.get('category'),
    price: Number(formData.get('price') || 0),
    inventory: Number(formData.get('inventory') || 0),
    status: formData.get('status')
  };

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Unable to save product.');
    }

    productForm.reset();
    await loadData();
    productFormMessage.textContent = 'Product saved. It is now available to the storefront.';
    productFormMessage.className = 'form-message form-message--success';
  } catch (error) {
    productFormMessage.textContent = error.message;
    productFormMessage.className = 'form-message form-message--error';
  }
}

function bindFilters() {
  [filterSearch, filterCategory, filterStatus, filterStock].forEach((input) => {
    input.addEventListener('input', renderProductsTable);
    input.addEventListener('change', renderProductsTable);
  });

  resetFiltersButton.addEventListener('click', function () {
    filterSearch.value = '';
    filterCategory.value = 'all';
    filterStatus.value = 'all';
    filterStock.value = 'all';
    renderProductsTable();
  });
}

sidebarNav.addEventListener('click', (event) => {
  const btn = event.target.closest('.nav-item');
  if (!btn) return;
  showSection(btn.dataset.section);
});

productForm.addEventListener('submit', handleProductSubmit);
bindFilters();
showSection('products');
loadData().catch((error) => {
  tableBody.innerHTML = `<tr><td colspan="6" class="empty-state">${escapeHtml(error.message)}</td></tr>`;
  categoriesList.innerHTML = `<p class="section-note">${escapeHtml(error.message)}</p>`;
});
