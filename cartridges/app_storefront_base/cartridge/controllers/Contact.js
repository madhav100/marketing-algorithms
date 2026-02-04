'use strict';

var server = require('server');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var ContactForm = require('*/cartridge/models/contactForm');
var validationHelpers = require('*/cartridge/scripts/helpers/validationHelpers');

server.get('Show', pageMetaData.applyDefaultMetaData, function (req, res, next) {
    res.setViewData({
        pageMetaData: {
            title: 'Contact Us',
            description: 'Get in touch with our storefront team.'
        }
    });

    res.render('contact/contact', {
        contact: new ContactForm({}),
        errors: {},
        submitted: false
    });

    return next();
});

server.post('Submit', pageMetaData.applyDefaultMetaData, function (req, res, next) {
    var formData = {
        firstName: req.form.firstName,
        lastName: req.form.lastName,
        email: req.form.email,
        message: req.form.message
    };

    var errors = validationHelpers.validateContactForm(formData);
    var hasErrors = Object.keys(errors).length > 0;

    res.setViewData({
        pageMetaData: {
            title: 'Contact Us',
            description: 'Get in touch with our storefront team.'
        }
    });

    res.render('contact/contact', {
        contact: new ContactForm(formData),
        errors: errors,
        submitted: !hasErrors
    });

    return next();
});

module.exports = server.exports();
