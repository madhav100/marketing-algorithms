'use strict';

var server = require('server');
var cartPageModel = require('*/cartridge/models/cartPage');

server.get('Show', function (req, res, next) {
    var cartData = cartPageModel.buildCartPageModel();

    res.render('cart/cartPage', cartData);
    return next();
});

module.exports = server.exports();
