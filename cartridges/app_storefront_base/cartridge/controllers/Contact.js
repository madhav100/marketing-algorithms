'use strict';

var server = require('server');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var ContactForm = require('*/cartridge/models/contactForm');

server.get('Show', pageMetaData.applyDefaultMetaData, function (req, res, next) {
    res.render('contact/contact', {
        contact: new ContactForm({})
    });

    return next();
});

module.exports = server.exports();
