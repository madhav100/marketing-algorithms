'use strict';

var catalogHelpers = require('*/cartridge/scripts/helpers/catalogHelpers');

function buildProductPageModel(productId) {
    return catalogHelpers.findProductById(productId);
}

module.exports = {
    buildProductPageModel: buildProductPageModel
};
