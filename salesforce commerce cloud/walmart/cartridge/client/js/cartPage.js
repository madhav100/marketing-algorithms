(function () {
    function getCurrentCustomer() {
        try {
            return JSON.parse(window.localStorage.getItem('wmCurrentCustomer') || 'null');
        } catch (error) {
            return null;
        }
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

        if (window.localStorage.getItem(getCartBootKey()) !== serverBootId) {
            window.localStorage.removeItem(getCartItemsKey());
            window.localStorage.setItem(getCartBootKey(), serverBootId);
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

    function saveCartItems(items) {
        syncCartStorageWithServerBoot();
        window.localStorage.setItem(getCartItemsKey(), JSON.stringify(items));
    }

    function formatPrice(value) {
        return '$' + Number(value || 0).toFixed(2);
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function updateAccountLinks() {
        var customer = getCurrentCustomer();
        document.querySelectorAll('[data-account-link]').forEach(function (link) {
            link.textContent = customer ? customer.name : 'Account';
        });
        var ownerLabel = document.getElementById('cart-owner-label');
        if (ownerLabel) {
            ownerLabel.textContent = customer ? customer.name + "'s cart" : 'Guest cart';
        }
    }

    function createCartItemMarkup(item, index) {
        return [
            '<article class="item" data-cart-item data-cart-index="' + index + '">',
            '  <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" width="160" height="106" />',
            '  <div>',
            '    <h3>' + escapeHtml(item.title) + '</h3>',
            '    <p class="variant">Category: ' + escapeHtml(item.categoryName || 'Uncategorized') + '</p>',
            '    <p class="qty">Quantity: ' + Number(item.quantity || 0) + '</p>',
            '    <p class="price">' + formatPrice(item.price) + '</p>',
            '  </div>',
            '  <button class="btn btn-remove" type="button" data-action="remove-cart-item" data-cart-index="' + index + '">Remove</button>',
            '</article>'
        ].join('');
    }

    function renderSummary(items) {
        var subtotal = items.reduce(function (total, item) {
            return total + (Number(item.price || 0) * Number(item.quantity || 0));
        }, 0);
        var subtotalNode = document.getElementById('cart-subtotal');
        var itemCountNode = document.getElementById('cart-item-count');

        if (subtotalNode) {
            subtotalNode.textContent = formatPrice(subtotal);
        }

        if (itemCountNode) {
            itemCountNode.textContent = String(items.reduce(function (total, item) {
                return total + Number(item.quantity || 0);
            }, 0));
        }
    }

    function renderCart() {
        var items = parseCartItems();
        var list = document.getElementById('cart-items');
        var emptyState = document.getElementById('cart-empty-state');

        if (!list || !emptyState) {
            return;
        }

        if (!items.length) {
            list.innerHTML = '';
            emptyState.hidden = false;
            renderSummary([]);
            return;
        }

        emptyState.hidden = true;
        list.innerHTML = items.map(createCartItemMarkup).join('');
        renderSummary(items);
    }


    function bindCheckout() {
        var checkoutButton = document.querySelector('.wm-checkout');
        if (!checkoutButton) {
            return;
        }

        checkoutButton.addEventListener('click', function () {
            window.location.href = '/checkout';
        });
    }

    function bindRemove() {
        document.addEventListener('click', function (event) {
            var removeButton = event.target.closest('[data-action="remove-cart-item"]');
            if (!removeButton) {
                return;
            }

            var index = Number(removeButton.dataset.cartIndex);
            var items = parseCartItems();
            items.splice(index, 1);
            saveCartItems(items);
            renderCart();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncCartStorageWithServerBoot();
        updateAccountLinks();
        renderCart();
        bindCheckout();
        bindRemove();
    });
}());
