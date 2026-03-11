'use strict';

var formatting = require('*/cartridge/scripts/util/formatting');
var catalogHelpers = require('*/cartridge/scripts/helpers/catalogHelpers');

function buildCartPageModel() {
    var selectedProducts = [catalogHelpers.findProductById('sku-1002')];

    var items = selectedProducts.map(function (product) {
        return {
            id: product.id,
            title: product.title,
            quantity: 1,
            price: product.price,
            image: product.image
        };
    });

    var subtotalValue = selectedProducts.reduce(function (sum, product) {
        var numericPrice = Number(product.price.replace('$', ''));
        return sum + numericPrice;
    }, 0);

    return {
        items: items,
        subtotal: formatting.formatPrice(subtotalValue)
    };
}

module.exports = {
    buildCartPageModel: buildCartPageModel
};
