'use strict';

var formatting = require('*/cartridge/scripts/util/formatting');

function getSampleProducts() {
    return [
        {
            id: 'sku-1001',
            title: 'Fresh Apples',
            priceValue: 4.99,
            image: '../../../client/default/images/products/fresh-apples.svg',
            stock: 'In stock',
            description: 'Crisp apples for daily snacks and recipes.'
        },
        {
            id: 'sku-1002',
            title: 'Wireless Earbuds',
            priceValue: 29.99,
            image: '../../../client/default/images/products/wireless-earbuds.svg',
            stock: 'In stock',
            description: 'Compact wireless earbuds for calls and music.'
        },
        {
            id: 'sku-1003',
            title: 'Cotton T-Shirt',
            priceValue: 12.99,
            image: '../../../client/default/images/products/cotton-tshirt.svg',
            stock: 'In stock',
            description: 'Soft cotton t-shirt for everyday comfort.'
        }
    ];
}

function getFormattedProducts() {
    return getSampleProducts().map(function (product) {
        return {
            id: product.id,
            title: product.title,
            price: formatting.formatPrice(product.priceValue),
            image: product.image,
            stock: product.stock,
            description: product.description
        };
    });
}

function findProductById(productId) {
    var products = getFormattedProducts();
    return products.find(function (product) {
        return product.id === productId;
    }) || products[1];
}

module.exports = {
    getFormattedProducts: getFormattedProducts,
    findProductById: findProductById
};
