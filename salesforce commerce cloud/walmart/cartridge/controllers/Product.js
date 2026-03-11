'use strict';

var server = require('server');
var productDetailModel = require('*/cartridge/models/product/productDetail');

server.get('Show', function (req, res, next) {
    var productId = req.querystring.pid;
    var productData = productDetailModel.buildProductDetailModel(productId);

    res.render('product/productPage', productData);
    return next();
});

module.exports = server.exports();
