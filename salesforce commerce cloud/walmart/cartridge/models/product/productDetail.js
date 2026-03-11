'use strict';

var productHelpers = require('*/cartridge/scripts/helpers/productHelpers');

function buildProductDetailModel(productId) {
    return productHelpers.getProductById(productId);
}

module.exports = {
    buildProductDetailModel: buildProductDetailModel
};
