'use strict';

var server = require('server');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');

server.get('Show', pageMetaData.applyDefaultMetaData, function (req, res, next) {
    res.render('home/home', {
        message: 'Welcome to the SFRA storefront skeleton.'
    });

    return next();
});

module.exports = server.exports();
