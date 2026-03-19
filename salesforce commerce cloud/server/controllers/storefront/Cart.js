// Render canonical Walmart cart page shell. Items are hydrated from local storage.
function showCart(req, res) {
  return res.render('cart/cartPage.html');
}

module.exports = {
  showCart,
};
