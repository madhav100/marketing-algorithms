'use strict';

/**
 * Home page purpose:
 * Introduce the store, guide product discovery, and let shoppers start shopping fast.
 */

var server = require('server');
var homePageModel = require('*/cartridge/models/homePage');

server.get('Show', function (req, res, next) {
    var homepageData = homePageModel.buildHomePageModel();

    res.render('home/homePage', homepageData);
    return next();
});

module.exports = server.exports();
