'use strict';

function isEmpty(value) {
    return !value || !value.trim();
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateContactForm(formData) {
    var errors = {};

    if (isEmpty(formData.firstName)) {
        errors.firstName = 'First name is required.';
    }

    if (isEmpty(formData.lastName)) {
        errors.lastName = 'Last name is required.';
    }

    if (isEmpty(formData.email) || !isValidEmail(formData.email)) {
        errors.email = 'A valid email is required.';
    }

    if (isEmpty(formData.message)) {
        errors.message = 'Message is required.';
    }

    return errors;
}

module.exports = {
    validateContactForm: validateContactForm
};
