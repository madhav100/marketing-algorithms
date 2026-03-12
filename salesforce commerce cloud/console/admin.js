// Fetch products from the shared API so admin and storefront stay in sync.
async function loadProducts() {
  const list = document.getElementById('product-list');
  const response = await fetch('/api/products');
  const products = await response.json();

  list.innerHTML = products
    .map((product) => `<article class="card"><strong>${product.name}</strong><br/>$${product.price.toFixed(2)}</article>`)
    .join('');
}

loadProducts().catch((error) => {
  console.error('Failed to load products:', error);
});
