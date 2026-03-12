// Render canonical Walmart cart page.
function showCart(req, res) {
  return res.render('cart/cartPage.html', {
    items: [
      {
        title: 'Trail Running Shoes',
        quantity: 1,
        price: '$129.99',
        image: '/client/default/images/products/fresh-apples.svg',
      },
    ],
    subtotal: '$129.99',
  });
}

module.exports = {
  showCart,
};
