const productService = require('../../services/productService');
const categoryService = require('../../services/categoryService');

const categoryLinks = {
  Footwear: '/?category=footwear',
  Apparel: '/?category=apparel',
  Electronics: '/?category=electronics',
  Accessories: '/?category=accessories',
  Fitness: '/?category=fitness',
};

function getProductImage(product) {
  if (product.category === 'Electronics') {
    return '/client/default/images/products/wireless-earbuds.svg';
  }

  if (product.category === 'Apparel') {
    return '/client/default/images/products/cotton-tshirt.svg';
  }

  return '/client/default/images/products/fresh-apples.svg';
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

// Render Walmart homepage with shared product and category data.
async function showHome(req, res, next) {
  try {
    const products = await productService.getAllProducts();
    const categories = await categoryService.getAllCategories();
    const featuredProducts = products.slice(0, 3).map((product) => ({
      title: product.name,
      price: formatPrice(product.price),
      image: getProductImage(product),
    }));

    const categoryTiles = categories.slice(0, 5).map((category) => ({
      name: category.name,
      url: categoryLinks[category.name] || '/',
    }));

    return res.render('home/homePage.html', {
      storeName: 'Walmart',
      welcomeMessage: 'Shop everyday essentials from our canonical Walmart storefront.',
      promoMessage: 'Fast local simulation: storefront, admin console, and APIs all wired together.',
      categories: categoryTiles,
      featuredProducts,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  showHome,
};
