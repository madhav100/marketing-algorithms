'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    res.render('home/home', {
        message: 'Welcome to the SFRA storefront skeleton.'
    });

    return next();
});

module.exports = server.exports();
