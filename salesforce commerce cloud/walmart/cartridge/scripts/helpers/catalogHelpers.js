'use strict';

function getSampleProducts() {
    return [];
}

function getFormattedProducts() {
    return getSampleProducts();
}

function findProductById(productId) {
    var products = getFormattedProducts();
    return products.find(function (product) {
        return product.id === productId;
    }) || null;
}

module.exports = {
    getFormattedProducts: getFormattedProducts,
    findProductById: findProductById
};
