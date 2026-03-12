// Render a basic cart page for now.
function showCart(req, res) {
  res.render('cart.njk');
}

module.exports = {
  showCart,
};
