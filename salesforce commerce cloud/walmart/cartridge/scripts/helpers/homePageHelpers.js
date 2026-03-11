'use strict';

var catalogHelpers = require('*/cartridge/scripts/helpers/catalogHelpers');

function getHomeCategories() {
    return [
        { id: 'cat-grocery', name: 'Grocery', url: '/category/grocery' },
        { id: 'cat-electronics', name: 'Electronics', url: '/category/electronics' },
        { id: 'cat-fashion', name: 'Fashion', url: '/category/fashion' },
        { id: 'cat-home', name: 'Home', url: '/category/home' },
        { id: 'cat-pharmacy', name: 'Pharmacy', url: '/category/pharmacy' }
    ];
}

function getFeaturedProducts() {
    return catalogHelpers.getFormattedProducts();
}

module.exports = {
    getHomeCategories: getHomeCategories,
    getFeaturedProducts: getFeaturedProducts
};
