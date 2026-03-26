const paymentService = require('../../services/paymentService');

function showCheckout(req, res) {
  return res.render('checkout/checkoutPage.html', {
    stripePublishableKey: paymentService.getPublishableKey(),
  });
}

module.exports = {
  showCheckout,
};
