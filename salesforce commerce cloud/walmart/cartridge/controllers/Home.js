'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var homepageData = {
        storeName: 'Walmart',
        welcomeMessage: 'Save money. Live better.',
        categories: [
            { name: 'Grocery', url: '/category/grocery' },
            { name: 'Electronics', url: '/category/electronics' },
            { name: 'Fashion', url: '/category/fashion' },
            { name: 'Home', url: '/category/home' },
            { name: 'Pharmacy', url: '/category/pharmacy' }
        ],
        featuredProducts: [
            { title: 'Fresh Apples', price: '$4.99', image: '../../../client/default/images/products/fresh-apples.svg' },
            { title: 'Wireless Earbuds', price: '$29.99', image: '../../../client/default/images/products/wireless-earbuds.svg' },
            { title: 'Cotton T-Shirt', price: '$12.99', image: '../../../client/default/images/products/cotton-tshirt.svg' }
        ],
        promoMessage: 'Free pickup today on eligible orders over $35.'
    };

    res.render('home/homePage', homepageData);
    return next();
});

module.exports = server.exports();
