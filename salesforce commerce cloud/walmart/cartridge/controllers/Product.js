'use strict';

var server = require('server');
var productPageModel = require('*/cartridge/models/productPage');

server.get('Show', function (req, res, next) {
    var productId = req.querystring.pid;
    var productData = productPageModel.buildProductPageModel(productId);

    res.render('product/productPage', productData);
    return next();
});

module.exports = server.exports();
