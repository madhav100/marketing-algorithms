'use strict';

var homePageHelpers = require('*/cartridge/scripts/helpers/homePageHelpers');

function buildHomePageModel() {
    return {
        storeName: 'Walmart',
        welcomeMessage: 'Shop everyday essentials',
        categories: homePageHelpers.getHomeCategories(),
        featuredProducts: homePageHelpers.getFeaturedProducts()
    };
}

module.exports = {
    buildHomePageModel: buildHomePageModel
};
