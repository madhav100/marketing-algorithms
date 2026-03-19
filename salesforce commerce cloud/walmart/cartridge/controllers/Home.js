'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    var homepageData = {
        storeName: 'Walmart',
        welcomeMessage: 'Browse products managed from the admin catalog.',
        categories: [
            { name: 'Footwear', url: '/category/footwear' },
            { name: 'Apparel', url: '/category/apparel' },
            { name: 'Electronics', url: '/category/electronics' },
            { name: 'Accessories', url: '/category/accessories' },
            { name: 'Fitness', url: '/category/fitness' }
        ],
        featuredProducts: [],
        promoMessage: 'Storefront catalog data should come from the admin-managed database.'
    };

    res.render('home/homePage', homepageData);
    return next();
});

module.exports = server.exports();
