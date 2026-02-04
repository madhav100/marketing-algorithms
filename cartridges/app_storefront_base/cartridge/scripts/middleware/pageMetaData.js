'use strict';

var PageMetaData = require('*/cartridge/models/pageMetaData');

function applyDefaultMetaData(req, res, next) {
    var pageMetaData = new PageMetaData();

    pageMetaData.title = 'SFRA Storefront';
    pageMetaData.description = 'Starter SFRA architecture for Salesforce Commerce Cloud.';

    res.setViewData({
        pageMetaData: pageMetaData
    });

    return next();
}

module.exports = {
    applyDefaultMetaData: applyDefaultMetaData
};
