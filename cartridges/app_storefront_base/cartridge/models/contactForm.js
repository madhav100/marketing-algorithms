'use strict';

function ContactForm(formData) {
    this.firstName = formData.firstName || '';
    this.lastName = formData.lastName || '';
    this.email = formData.email || '';
    this.message = formData.message || '';
}

module.exports = ContactForm;
