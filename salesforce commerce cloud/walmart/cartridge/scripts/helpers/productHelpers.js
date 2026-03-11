'use strict';

var catalogHelpers = require('*/cartridge/scripts/helpers/catalogHelpers');

function getProductVariants() {
    return [
        { id: 'v-black', label: 'Black' },
        { id: 'v-blue', label: 'Blue' },
        { id: 'v-white', label: 'White' }
    ];
}

function getProductById(productId) {
    var product = catalogHelpers.findProductById(productId);

    return {
        title: product.title,
        image: product.image,
        price: product.price,
        stock: product.stock,
        description: product.description,
        variants: getProductVariants()
    };
}

module.exports = {
    getProductById: getProductById
};
