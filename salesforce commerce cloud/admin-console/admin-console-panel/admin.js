let products = [];
let categories = [];
let customers = [];
let orders = [];
let selectedAnalyticsCustomerId = 'all';

const CSV_FIELDS = ['name', 'description', 'category', 'price', 'inventory', 'status'];

const sidebarNav = document.getElementById('sidebarNav');
const sidebarButtons = sidebarNav.querySelectorAll('.nav-item');
const appSections = document.querySelectorAll('.app-section');

const tableBody = document.getElementById('products-table-body');
const inventoryTableBody = document.getElementById('inventory-table-body');
const customersTableBody = document.getElementById('customers-table-body');
const totalProductsEl = document.getElementById('total-products');
const activeProductsEl = document.getElementById('active-products');
const lowStockProductsEl = document.getElementById('low-stock-products');
const draftProductsEl = document.getElementById('draft-products');
const dashboardCustomersEl = document.getElementById('dashboard-customers');
const dashboardRetiredProductsEl = document.getElementById('dashboard-retired-products');
const dashboardVisibleProductsEl = document.getElementById('dashboard-visible-products');
const dashboardCategoriesEl = document.getElementById('dashboard-categories');
const categoriesList = document.getElementById('categories-list');
const analyticsSessionCountEl = document.getElementById('analytics-session-count');
const analyticsUniqueVisitorsEl = document.getElementById('analytics-unique-visitors');
const analyticsProductViewsEl = document.getElementById('analytics-product-views');
const analyticsAddToCartEl = document.getElementById('analytics-add-to-cart');
const analyticsCartAbandonmentEl = document.getElementById('analytics-cart-abandonment');
const analyticsCheckoutStartsEl = document.getElementById('analytics-checkout-starts');
const analyticsCompletedPurchasesEl = document.getElementById('analytics-completed-purchases');
const analyticsAvgSessionMinutesEl = document.getElementById('analytics-avg-session-minutes');
const analyticsAvgLoggedInMinutesEl = document.getElementById('analytics-avg-logged-in-minutes');
const analyticsLoginEventsEl = document.getElementById('analytics-login-events');
const analyticsLogoutEventsEl = document.getElementById('analytics-logout-events');
const analyticsCartCheckoutRateEl = document.getElementById('analytics-cart-checkout-rate');
const analyticsCheckoutPurchaseRateEl = document.getElementById('analytics-checkout-purchase-rate');
const exportCustomerAnalyticsCsvButton = document.getElementById('export-customer-analytics-csv');
const analyticsCustomerScopeSelect = document.getElementById('analytics-customer-scope');
const analyticsScopeSummary = document.getElementById('analytics-scope-summary');

const productForm = document.getElementById('product-form');
const productCategorySelect = document.getElementById('product-category');
const productFormMessage = document.getElementById('product-form-message');
const productCsvMessage = document.getElementById('product-csv-message');
const productCsvFileInput = document.getElementById('product-csv-file');
const importCsvButton = document.getElementById('import-csv-button');
const exportCsvButton = document.getElementById('export-csv-button');

const filterSearch = document.getElementById('filter-search');
const filterCategory = document.getElementById('filter-category');
const filterStatus = document.getElementById('filter-status');
const filterStock = document.getElementById('filter-stock');
const resetFiltersButton = document.getElementById('reset-filters');
const inventoryFilterSearch = document.getElementById('inventory-filter-search');
const inventoryFilterStatus = document.getElementById('inventory-filter-status');
const inventoryFilterStorefront = document.getElementById('inventory-filter-storefront');
const inventoryResetFiltersButton = document.getElementById('inventory-reset-filters');
const ordersCards = document.getElementById('orders-cards');
const cartsAbandonedCountEl = document.getElementById('carts-abandoned-count');
const cartsAbandonedListEl = document.getElementById('carts-abandoned-list');

function setMessage(element, text, variant) {
  element.textContent = text;
  element.className = variant ? `form-message form-message--${variant}` : 'form-message';
}

function getComputedStatus(product) {
  if (product.retired) {
    return 'Retired';
  }

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
  if (status === 'Retired') return 'badge--retired';
  return 'badge--low';
}

function getStorefrontState(product) {
  if (product.retired) {
    return {
      label: 'Archived',
      description: 'Hidden from storefront',
      badgeClass: 'badge--retired'
    };
  }

  return {
    label: 'Visible',
    description: 'Shown on storefront',
    badgeClass: 'badge--active'
  };
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
    tableBody.innerHTML = '<tr><td colspan="7" class="empty-state">No products match the current filters. Add a product or reset filters.</td></tr>';
    return;
  }

  tableBody.innerHTML = visibleProducts
    .map((product) => {
      const status = getComputedStatus(product);
      const storefrontState = getStorefrontState(product);
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
          <td>
            <span class="badge ${storefrontState.badgeClass}">${escapeHtml(storefrontState.label)}</span>
            <small class="cell-meta">${escapeHtml(storefrontState.description)}</small>
          </td>
          <td>${escapeHtml(formatDate(product.updated))}</td>
        </tr>
      `;
    })
    .join('');
}

function renderSummaryCards() {
  const total = products.length;
  const active = products.filter((item) => getComputedStatus(item) === 'Active').length;
  const lowStock = products.filter((item) => getComputedStatus(item) === 'Low Stock').length;
  const draft = products.filter((item) => getComputedStatus(item) === 'Draft').length;
  const retired = products.filter((item) => item.retired).length;

  totalProductsEl.textContent = String(total);
  activeProductsEl.textContent = String(active);
  lowStockProductsEl.textContent = String(lowStock);
  draftProductsEl.textContent = String(draft);
  dashboardCustomersEl.textContent = String(customers.length);
  dashboardRetiredProductsEl.textContent = String(retired);
  dashboardVisibleProductsEl.textContent = String(total - retired);
  dashboardCategoriesEl.textContent = String(categories.length);
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
      const count = products.filter((product) => product.category === category.name && !product.retired).length;
      return `
        <article class="category-admin-card">
          <h3>${escapeHtml(category.name)}</h3>
          <p>${count} visible product(s) currently assigned.</p>
        </article>
      `;
    })
    .join('');
}

function renderInventoryTable() {
  const visibleProducts = getFilteredInventoryProducts();
  if (!visibleProducts.length) {
    inventoryTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No products available.</td></tr>';
    return;
  }

  inventoryTableBody.innerHTML = visibleProducts.map((product) => {
    const status = getComputedStatus(product);
    const storefrontState = getStorefrontState(product);
    return `
      <tr>
        <td>${escapeHtml(product.name)}</td>
        <td>${Number(product.inventory || 0)}</td>
        <td><span class="badge ${getBadgeClass(status)}">${escapeHtml(status)}</span></td>
        <td>
          <span class="badge ${storefrontState.badgeClass}">${escapeHtml(storefrontState.label)}</span>
          <small class="cell-meta">${escapeHtml(storefrontState.description)}</small>
        </td>
        <td>
          <label class="checkbox-label">
            <input type="checkbox" data-action="toggle-retired" data-product-id="${escapeHtml(product.id)}" ${product.retired ? 'checked' : ''} />
            <span>${product.retired ? 'Archived' : 'Visible'}</span>
          </label>
        </td>
      </tr>
    `;
  }).join('');
}

function getFilteredInventoryProducts() {
  const searchValue = String(inventoryFilterSearch?.value || '').trim().toLowerCase();
  const statusValue = String(inventoryFilterStatus?.value || 'all');
  const storefrontValue = String(inventoryFilterStorefront?.value || 'all');

  return products.filter((product) => {
    const name = String(product.name || '').toLowerCase();
    const category = String(product.category || '').toLowerCase();
    const status = getComputedStatus(product);
    const storefront = product.retired ? 'archived' : 'visible';

    const matchesSearch = !searchValue || name.includes(searchValue) || category.includes(searchValue);
    const matchesStatus = statusValue === 'all' || status === statusValue;
    const matchesStorefront = storefrontValue === 'all' || storefront === storefrontValue;
    return matchesSearch && matchesStatus && matchesStorefront;
  });
}

function renderCustomersSection() {
  if (!customers.length) {
    customersTableBody.innerHTML = '<tr><td colspan="5" class="empty-state">No customer accounts yet.</td></tr>';
    return;
  }

  customersTableBody.innerHTML = customers.map((customer) => `
    <tr>
      <td>${escapeHtml(customer.name)}</td>
      <td>${escapeHtml(customer.phone)}</td>
      <td>${escapeHtml(customer.address)}</td>
      <td>${Number(customer.orderCount || 0)}</td>
      <td>
        <button class="btn" data-action="delete-customer" data-customer-id="${escapeHtml(customer.id)}" type="button">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderOrdersSection() {
  if (!ordersCards) return;
  const visibleOrders = orders.filter((order) => String(order.id || '').startsWith('ord_live_'));

  if (!visibleOrders.length) {
    ordersCards.innerHTML = '<p class="section-note">No orders yet.</p>';
    return;
  }

  ordersCards.innerHTML = visibleOrders.map((order) => `
    <article class="card preview-card">
      <h3>Order ${escapeHtml(order.id)}</h3>
      <p>Customer: ${escapeHtml(customers.find((customer) => String(customer.id) === String(order.customerId))?.name || order.customer || 'Unknown customer')}</p>
      <p>Total: ${formatMoney(order.total || 0)}</p>
      <p>Items: ${Number((order.items || []).length)}</p>
    </article>
  `).join('');
}

function renderCartsSection(metrics) {
  const cartsMetrics = metrics.carts || {};
  cartsAbandonedCountEl.textContent = String(cartsMetrics.abandonedCartCount || 0);
  renderSimpleList(
    cartsAbandonedListEl,
    cartsMetrics.abandonedSessions || [],
    (item) => {
      const customerName = customers.find((customer) => String(customer.id) === String(item.customerId || ''))?.name;
      return `<strong>${escapeHtml(customerName || item.customerId || item.sessionId)}</strong> — ${Number(item.cartItemCount || 0)} item(s), ${formatMoney(item.cartValue || 0)}`;
    }
  );
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatPercent(value) {
  return `${(Number(value || 0) * 100).toFixed(2)}%`;
}

function renderSimpleList(element, items, formatter) {
  if (!element) return;
  if (!items || !items.length) {
    element.innerHTML = '<li class="empty-state">No records yet.</li>';
    return;
  }
  element.innerHTML = items.map((item) => `<li>${formatter(item)}</li>`).join('');
}

function renderAnalyticsDashboard(customerMetrics, marketMetrics) {
  const consumer = customerMetrics.consumer || {};
  const customerScope = customerMetrics.scope || {};
  const marketScope = marketMetrics.scope || {};

  if (analyticsScopeSummary) {
    if (customerScope.customerId && customerScope.customerId !== 'all') {
      const selectedCustomer = customers.find((customer) => String(customer.id) === String(customerScope.customerId));
      analyticsScopeSummary.textContent = selectedCustomer
        ? `Showing analytics for ${selectedCustomer.name}.`
        : `Showing analytics for customer ${customerScope.customerId}.`;
    } else {
      analyticsScopeSummary.textContent = `All customers selected (${Number(marketScope.totalCustomers || customers.length || 0)} total customers).`;
    }
  }

  analyticsSessionCountEl.textContent = String(consumer.sessionCount || 0);
  analyticsUniqueVisitorsEl.textContent = String(consumer.uniqueVisitorsOrCustomers || 0);
  analyticsProductViewsEl.textContent = String(consumer.productViewCount || 0);
  analyticsAddToCartEl.textContent = String(consumer.addToCartCount || 0);
  analyticsCartAbandonmentEl.textContent = String(consumer.cartAbandonmentCount || 0);
  analyticsCheckoutStartsEl.textContent = String(consumer.checkoutStartCount || 0);
  analyticsCompletedPurchasesEl.textContent = String(consumer.completedPurchaseCount || 0);
  analyticsAvgSessionMinutesEl.textContent = String(consumer.avgSessionDurationMinutes || 0);
  analyticsAvgLoggedInMinutesEl.textContent = String(consumer.avgLoggedInMinutes || 0);
  analyticsLoginEventsEl.textContent = String(consumer.loginEventCount || 0);
  analyticsLogoutEventsEl.textContent = String(consumer.logoutEventCount || 0);
  analyticsCartCheckoutRateEl.textContent = formatPercent(consumer.cartToCheckoutRate || 0);
  analyticsCheckoutPurchaseRateEl.textContent = formatPercent(consumer.checkoutToPurchaseRate || 0);

  renderCartsSection(customerMetrics);
}

async function fetchBusinessMetrics(customerId) {
  const query = customerId && customerId !== 'all'
    ? `?customerId=${encodeURIComponent(customerId)}`
    : '';
  const endpoints = [`/admin/api/analytics/business-metrics${query}`, `/api/analytics/business-metrics${query}`];

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint);
    if (response.ok) {
      return response.json();
    }
    if (response.status !== 404) {
      throw new Error('Failed to load analytics dashboard metrics.');
    }
  }

  throw new Error('Analytics endpoint not available in this runtime.');
}

async function exportAnalyticsCsv(type) {
  const endpoints = ['/admin/api/analytics/export-csv', '/api/analytics/export-csv'];

  for (const endpoint of endpoints) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: type || 'all' }),
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status !== 404) {
      throw new Error('Failed to export analytics CSV files.');
    }
  }

  throw new Error('Analytics export endpoint not available in this runtime.');
}

function renderAnalyticsCustomerScopeOptions() {
  if (!analyticsCustomerScopeSelect) return;

  const options = [
    '<option value="all">All customers</option>',
    ...customers.map((customer) => `<option value="${escapeHtml(customer.id)}">${escapeHtml(customer.name)} (${escapeHtml(customer.phone)})</option>`)
  ];

  analyticsCustomerScopeSelect.innerHTML = options.join('');
  if (selectedAnalyticsCustomerId !== 'all' && !customers.some((customer) => String(customer.id) === String(selectedAnalyticsCustomerId))) {
    selectedAnalyticsCustomerId = 'all';
  }
  analyticsCustomerScopeSelect.value = selectedAnalyticsCustomerId;
}

async function loadAnalyticsMetrics() {
  try {
    const [customerMetrics, marketMetrics] = await Promise.all([
      fetchBusinessMetrics(selectedAnalyticsCustomerId),
      fetchBusinessMetrics('all'),
    ]);
    renderAnalyticsDashboard(customerMetrics, marketMetrics);
  } catch (error) {
    renderAnalyticsDashboard({}, {});
    cartsAbandonedListEl.innerHTML = `<li class="empty-state">${escapeHtml(error.message)}</li>`;
  }
}

function bindAnalyticsExports() {
  const handleExportClick = async (type) => {
    try {
      const result = await exportAnalyticsCsv(type);
      const exportedFileNames = (result.files || []).map((entry) => entry.file).join(', ');
      setMessage(productCsvMessage, `Analytics CSV export generated in ${result.directory || 'export folder'}: ${exportedFileNames}`, 'success');
    } catch (error) {
      setMessage(productCsvMessage, error.message, 'error');
    }
  };

  exportCustomerAnalyticsCsvButton?.addEventListener('click', () => handleExportClick('customer'));
}

function bindAnalyticsScopeFilter() {
  analyticsCustomerScopeSelect?.addEventListener('change', async () => {
    selectedAnalyticsCustomerId = analyticsCustomerScopeSelect.value || 'all';
    await loadAnalyticsMetrics();
  });
}

function showSection(sectionName) {
  appSections.forEach((section) => section.classList.remove('is-visible'));

  const target = document.getElementById(`section-${sectionName}`);
  if (target) target.classList.add('is-visible');

  sidebarButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.section === sectionName);
  });
}

async function loadData() {
  const [productsResponse, categoriesResponse, customersResponse, ordersResponse] = await Promise.all([
    fetch('/api/products'),
    fetch('/api/categories'),
    fetch('/api/customers'),
    fetch('/api/orders')
  ]);

  if (!productsResponse.ok || !categoriesResponse.ok || !customersResponse.ok || !ordersResponse.ok) {
    throw new Error('Failed to load admin data.');
  }

  products = await productsResponse.json();
  categories = await categoriesResponse.json();
  customers = await customersResponse.json();
  orders = await ordersResponse.json();

  renderCategoryOptions();
  renderProductsTable();
  renderSummaryCards();
  renderCategoriesSection();
  renderInventoryTable();
  renderCustomersSection();
  renderOrdersSection();
  renderAnalyticsCustomerScopeOptions();
  await loadAnalyticsMetrics();
}

function createProductPayload(formData) {
  return {
    name: String(formData.get('name') || '').trim(),
    description: String(formData.get('description') || '').trim(),
    image: String(formData.get('image') || '').trim(),
    category: String(formData.get('category') || '').trim(),
    price: Number(formData.get('price') || 0),
    inventory: Number(formData.get('inventory') || 0),
    status: String(formData.get('status') || 'Draft').trim() || 'Draft',
    retired: false
  };
}

async function saveProduct(payload, productId) {
  const response = await fetch(productId ? `/api/products/${productId}` : '/api/products', {
    method: productId ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Unable to save product.');
  }

  return response.json();
}

async function deleteCustomer(customerId) {
  const response = await fetch(`/api/customers/${customerId}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Unable to delete customer.');
  }
}

async function handleProductSubmit(event) {
  event.preventDefault();
  setMessage(productFormMessage, 'Saving product...', '');

  try {
    const payload = createProductPayload(new FormData(productForm));
    await saveProduct(payload);
    productForm.reset();
    await loadData();
    setMessage(productFormMessage, 'Product saved. It is now available to the storefront.', 'success');
  } catch (error) {
    setMessage(productFormMessage, error.message, 'error');
  }
}

function parseCsvText(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(current);
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  row.push(current);
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function buildCsvValue(value) {
  const normalized = String(value ?? '');
  if (/[,"\n]/.test(normalized)) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}

function buildExportRows() {
  return products.map((product) => CSV_FIELDS.map((field) => buildCsvValue(product[field] ?? '')));
}

function downloadCsvFile(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function normalizeCsvPayload(headers, row) {
  const record = headers.reduce((accumulator, header, index) => {
    accumulator[header] = String(row[index] || '').trim();
    return accumulator;
  }, {});

  return {
    name: record.name,
    description: record.description,
    image: '',
    category: record.category,
    price: Number(record.price || 0),
    inventory: Number(record.inventory || 0),
    status: record.status || 'Draft',
    retired: false
  };
}

async function handleCsvImport(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  setMessage(productCsvMessage, `Importing ${file.name}...`, '');

  try {
    const rows = parseCsvText(await file.text());
    if (rows.length < 2) {
      throw new Error('CSV must include a header row and at least one product row.');
    }

    const headers = rows[0].map((header) => String(header || '').trim().toLowerCase());
    const hasAllFields = CSV_FIELDS.every((field) => headers.includes(field));
    if (!hasAllFields) {
      throw new Error(`CSV headers must include: ${CSV_FIELDS.join(', ')}`);
    }

    const dataRows = rows.slice(1);
    let importedCount = 0;

    for (const row of dataRows) {
      const payload = normalizeCsvPayload(headers, row);
      if (!payload.name || !payload.description || !payload.category) {
        continue;
      }

      await saveProduct(payload);
      importedCount += 1;
    }

    await loadData();
    if (!importedCount) {
      throw new Error('No valid product rows were found in the CSV file.');
    }

    setMessage(productCsvMessage, `${importedCount} product(s) imported from CSV.`, 'success');
  } catch (error) {
    setMessage(productCsvMessage, error.message, 'error');
  } finally {
    event.target.value = '';
  }
}

function handleCsvExport() {
  const headerRow = CSV_FIELDS.join(',');
  const rows = buildExportRows().map((cells) => cells.join(','));
  downloadCsvFile('products-export.csv', [headerRow, ...rows].join('\n'));
  setMessage(productCsvMessage, 'Products exported to CSV.', 'success');
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

function bindInventoryFilters() {
  [inventoryFilterSearch, inventoryFilterStatus, inventoryFilterStorefront].forEach((input) => {
    input?.addEventListener('input', renderInventoryTable);
    input?.addEventListener('change', renderInventoryTable);
  });

  inventoryResetFiltersButton?.addEventListener('click', () => {
    if (inventoryFilterSearch) inventoryFilterSearch.value = '';
    if (inventoryFilterStatus) inventoryFilterStatus.value = 'all';
    if (inventoryFilterStorefront) inventoryFilterStorefront.value = 'all';
    renderInventoryTable();
  });
}

function bindInventoryRetireToggle() {
  document.addEventListener('change', async function (event) {
    const checkbox = event.target.closest('[data-action="toggle-retired"]');
    if (!checkbox) {
      return;
    }

    const product = products.find((item) => String(item.id) === String(checkbox.dataset.productId));
    if (!product) {
      return;
    }

    try {
      const updatedProduct = await saveProduct({ ...product, retired: checkbox.checked }, product.id);
      await loadData();
      setMessage(
        productCsvMessage,
        checkbox.checked
          ? `${updatedProduct.name} is archived and hidden from the storefront.`
          : `${updatedProduct.name} is visible on the storefront again.`,
        'success'
      );
    } catch (error) {
      checkbox.checked = !checkbox.checked;
      setMessage(productCsvMessage, error.message, 'error');
    }
  });
}

function bindCustomerActions() {
  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action="delete-customer"]');
    if (!button) return;

    const customerId = button.dataset.customerId;
    const customer = customers.find((item) => String(item.id) === String(customerId));
    if (!customer) return;

    const confirmed = window.confirm(`Delete customer ${customer.name}? This permanently removes them from the database.`);
    if (!confirmed) return;

    try {
      await deleteCustomer(customerId);
      await loadData();
      setMessage(productCsvMessage, `Deleted customer ${customer.name}.`, 'success');
    } catch (error) {
      setMessage(productCsvMessage, error.message, 'error');
    }
  });
}

sidebarNav.addEventListener('click', (event) => {
  const btn = event.target.closest('.nav-item');
  if (!btn) return;
  showSection(btn.dataset.section);
});

productForm.addEventListener('submit', handleProductSubmit);
importCsvButton.addEventListener('click', () => productCsvFileInput.click());
exportCsvButton.addEventListener('click', handleCsvExport);
productCsvFileInput.addEventListener('change', handleCsvImport);
bindFilters();
bindInventoryFilters();
bindInventoryRetireToggle();
bindCustomerActions();
bindAnalyticsExports();
bindAnalyticsScopeFilter();
showSection('products');
loadData().catch((error) => {
  tableBody.innerHTML = `<tr><td colspan="7" class="empty-state">${escapeHtml(error.message)}</td></tr>`;
  inventoryTableBody.innerHTML = `<tr><td colspan="5" class="empty-state">${escapeHtml(error.message)}</td></tr>`;
  customersTableBody.innerHTML = `<tr><td colspan="6" class="empty-state">${escapeHtml(error.message)}</td></tr>`;
  categoriesList.innerHTML = `<p class="section-note">${escapeHtml(error.message)}</p>`;
  setMessage(productCsvMessage, error.message, 'error');
});
