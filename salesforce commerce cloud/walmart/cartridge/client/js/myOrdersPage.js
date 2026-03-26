(function () {
    function getCurrentCustomer() {
        try {
            return JSON.parse(window.localStorage.getItem('wmCurrentCustomer') || 'null');
        } catch (error) {
            return null;
        }
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

    function renderOrders(orders) {
        var list = document.getElementById('my-orders-list');
        if (!list) return;

        if (!orders.length) {
            list.innerHTML = '<p class="empty-state">No orders yet.</p>';
            return;
        }

        list.innerHTML = orders.map(function (order) {
            var itemsMarkup = (order.items || []).map(function (item) {
                return [
                    '<article class="order-card">',
                    '  <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" width="120" height="80" />',
                    '  <h4>' + escapeHtml(item.title) + '</h4>',
                    '  <p>Product details: ' + escapeHtml(item.categoryName || 'N/A') + '</p>',
                    '  <p>Item count: ' + Number(item.quantity || 0) + '</p>',
                    '  <p>Product price: ' + formatPrice(item.price) + '</p>',
                    '</article>'
                ].join('');
            }).join('');

            return [
                '<section class="panel" style="margin-bottom:12px;">',
                '  <h3>Order ' + escapeHtml(order.id) + '</h3>',
                '  <p>Payment status: ' + escapeHtml(order.paymentStatus || order.status || 'pending') + '</p>',
                '  <p>Order total: ' + formatPrice(order.total) + '</p>',
                itemsMarkup,
                '</section>'
            ].join('');
        }).join('');
    }

    async function loadOrders() {
        var message = document.getElementById('orders-status-message');
        var customer = getCurrentCustomer();

        if (!customer || !customer.id) {
            if (message) message.textContent = 'Please sign in to view your orders.';
            renderOrders([]);
            return;
        }

        try {
            var response = await fetch('/api/customers/' + encodeURIComponent(customer.id) + '/orders');
            var orders = await response.json();
            if (!response.ok) {
                throw new Error('Unable to load orders.');
            }

            renderOrders(orders.filter(function (order) {
                return ['paid', 'processing', 'failed', 'refunded', 'pending_payment'].includes(order.paymentStatus || order.status);
            }));
        } catch (error) {
            if (message) message.textContent = error.message;
            renderOrders([]);
        }
    }

    document.addEventListener('DOMContentLoaded', loadOrders);
}());
