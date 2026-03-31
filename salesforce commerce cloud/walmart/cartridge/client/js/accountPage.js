(function () {
    function getCurrentCustomer() {
        try {
            return JSON.parse(window.localStorage.getItem('wmCurrentCustomer') || 'null');
        } catch (error) {
            return null;
        }
    }

    function setCurrentCustomer(customer) {
        window.localStorage.setItem('wmCurrentCustomer', JSON.stringify(customer));
    }

    function clearCurrentCustomer() {
        window.localStorage.removeItem('wmCurrentCustomer');
    }

    function getServerBootId() {
        return document.body ? document.body.dataset.serverBootId || '' : '';
    }

    function getCartScope() {
        var customer = getCurrentCustomer();
        return customer && customer.id ? customer.id : 'guest';
    }

    function getCartItemsKey() {
        return 'wmCartItems::' + getCartScope();
    }

    function getCartBootKey() {
        return 'wmCartServerBoot::' + getCartScope();
    }

    function syncCartStorageWithServerBoot() {
        var serverBootId = getServerBootId();
        if (!serverBootId) {
            return;
        }

        var bootKey = getCartBootKey();
        if (window.localStorage.getItem(bootKey) !== serverBootId) {
            window.localStorage.removeItem(getCartItemsKey());
            window.localStorage.setItem(bootKey, serverBootId);
        }
    }

    function parseCartItems() {
        syncCartStorageWithServerBoot();

        try {
            return JSON.parse(window.localStorage.getItem(getCartItemsKey()) || '[]');
        } catch (error) {
            return [];
        }
    }

    function setStatusMessage(message, variant) {
        var node = document.getElementById('account-status-message');
        if (!node) {
            return;
        }

        node.textContent = message;
        node.className = variant ? 'account-message account-message--' + variant : 'account-message';
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatPrice(value) {
        return '$' + Number(value || 0).toFixed(2);
    }

    function renderAccountSummary(customer, orders) {
        var introPanel = document.getElementById('account-intro-panel');
        var authForms = document.getElementById('account-auth-forms');
        var summary = document.getElementById('account-summary');
        var ordersList = document.getElementById('account-orders-list');

        if (!authForms || !summary || !ordersList) {
            return;
        }

        var signOutNavButton = document.getElementById('account-sign-out-nav');

        if (!customer) {
            if (introPanel) introPanel.hidden = false;
            if (signOutNavButton) signOutNavButton.hidden = true;
            authForms.hidden = false;
            summary.hidden = true;
            return;
        }

        if (signOutNavButton) signOutNavButton.hidden = false;
        if (introPanel) introPanel.hidden = true;
        authForms.hidden = true;
        summary.hidden = false;
        document.getElementById('account-customer-name').textContent = customer.name;
        document.getElementById('account-customer-phone').textContent = customer.phone;
        document.getElementById('account-customer-address').textContent = customer.address;
        document.getElementById('account-cart-count').textContent = String(parseCartItems().reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0));
        document.getElementById('account-order-count').textContent = String(orders.length);

        if (!orders.length) {
            ordersList.innerHTML = '<p class="empty-state">No orders yet for this account.</p>';
            return;
        }

        ordersList.innerHTML = orders.map(function (order) {
            return [
                '<article class="order-card">',
                '  <h4>Order ' + escapeHtml(order.id) + '</h4>',
                '  <p>Status: ' + escapeHtml(order.status || 'pending') + '</p>',
                '  <p>Total: ' + formatPrice(order.total) + '</p>',
                '  <p>Items: ' + Number((order.items || []).length) + '</p>',
                '</article>'
            ].join('');
        }).join('');
    }

    function bindCustomerDropdown() {
        var toggle = document.getElementById('account-customer-toggle');
        var menu = document.getElementById('account-customer-menu');

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', function () {
            menu.hidden = !menu.hidden;
            toggle.setAttribute('aria-expanded', String(!menu.hidden));
        });

        document.addEventListener('click', function (event) {
            if (!toggle.contains(event.target) && !menu.contains(event.target)) {
                menu.hidden = true;
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    async function fetchOrders(customerId) {
        var response = await fetch('/api/customers/' + encodeURIComponent(customerId) + '/orders');
        if (!response.ok) {
            throw new Error('Unable to load your orders.');
        }

        return response.json();
    }

    async function refreshAccountView() {
        var customer = getCurrentCustomer();

        if (!customer) {
            renderAccountSummary(null, []);
            return;
        }

        renderAccountSummary(customer, []);

        try {
            var orders = await fetchOrders(customer.id);
            renderAccountSummary(customer, orders);
        } catch (error) {
            setStatusMessage(error.message, 'error');
            renderAccountSummary(customer, []);
        }
    }

    async function submitJson(url, payload) {
        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        var body = await response.json();

        if (!response.ok) {
            throw new Error(body.message || 'Request failed.');
        }

        return body;
    }

    function serializeForm(form) {
        var formData = new FormData(form);
        return {
            name: String(formData.get('name') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            address: String(formData.get('address') || '').trim(),
            password: String(formData.get('password') || '').trim()
        };
    }

    function bindForms() {
        var signInForm = document.getElementById('sign-in-form');
        var signUpForm = document.getElementById('sign-up-form');
        var signOutButton = document.getElementById('account-sign-out');
        var signOutNavButton = document.getElementById('account-sign-out-nav');

        signInForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            setStatusMessage('Signing in...', '');

            try {
                var payload = serializeForm(signInForm);
                var customer = await submitJson('/api/customers/sign-in', {
                    phone: payload.phone,
                    password: payload.password
                });
                setCurrentCustomer(customer);
                if (window.SfraAnalyticsSession && typeof window.SfraAnalyticsSession.login === 'function') {
                    window.SfraAnalyticsSession.login(customer.id);
                }
                signInForm.reset();
                setStatusMessage('Signed in successfully.', 'success');
                window.location.href = '/walmart';
            } catch (error) {
                setStatusMessage(error.message, 'error');
            }
        });

        signUpForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            setStatusMessage('Creating account...', '');

            try {
                var customer = await submitJson('/api/customers/sign-up', serializeForm(signUpForm));
                setCurrentCustomer(customer);
                if (window.SfraAnalyticsSession && typeof window.SfraAnalyticsSession.login === 'function') {
                    window.SfraAnalyticsSession.login(customer.id);
                }
                signUpForm.reset();
                setStatusMessage('Account created and signed in.', 'success');
                window.location.href = '/walmart';
            } catch (error) {
                setStatusMessage(error.message, 'error');
            }
        });

        [signOutButton, signOutNavButton].filter(Boolean).forEach(function (button) {
            button.addEventListener('click', function () {
                var customer = getCurrentCustomer();
                if (window.SfraAnalyticsSession && typeof window.SfraAnalyticsSession.logout === 'function') {
                    window.SfraAnalyticsSession.logout(customer && customer.id ? customer.id : 'guest');
                }
                if (window.SfraAnalyticsSession && typeof window.SfraAnalyticsSession.end === 'function') {
                    window.SfraAnalyticsSession.end(customer && customer.id ? customer.id : 'guest');
                }
                clearCurrentCustomer();
                setStatusMessage('Signed out.', '');
                window.location.href = '/walmart';
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        bindForms();
        bindCustomerDropdown();
        refreshAccountView();
    });
}());
