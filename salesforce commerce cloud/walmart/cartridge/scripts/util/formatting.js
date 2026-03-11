'use strict';

function formatPrice(value) {
    return '$' + Number(value).toFixed(2);
}

module.exports = {
    formatPrice: formatPrice
};
