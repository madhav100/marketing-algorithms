'use strict';

var server = require('server');

server.get('Show', function (req, res, next) {
    res.render('category/categoryPage', {
        storeName: 'Walmart',
        selectedCategorySlug: req.querystring.category || ''
    });
    return next();
});

module.exports = server.exports();
