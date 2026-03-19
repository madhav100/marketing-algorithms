(function () {
    function getServerBootId() {
        return document.body ? document.body.dataset.serverBootId || '' : '';
    }

    function syncCartStorageWithServerBoot() {
        var serverBootId = getServerBootId();

        if (!serverBootId) {
            return;
        }

        if (window.localStorage.getItem('wmCartServerBoot') !== serverBootId) {
            window.localStorage.removeItem('wmCartItems');
            window.localStorage.removeItem('wmCartCount');
            window.localStorage.setItem('wmCartServerBoot', serverBootId);
        }
    }

    function parseCartItems() {
        syncCartStorageWithServerBoot();

        try {
            return JSON.parse(window.localStorage.getItem('wmCartItems') || '[]');
        } catch (error) {
            return [];
        }
    }

    function saveCartItems(items) {
        syncCartStorageWithServerBoot();
        window.localStorage.setItem('wmCartItems', JSON.stringify(items));
        window.localStorage.setItem('wmCartCount', String(items.reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0)));
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

    function createCartItemMarkup(item, index) {
        return [
            '<article class="item" data-cart-item data-cart-index="' + index + '">',
            '  <img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '" width="160" height="106" />',
            '  <div>',
            '    <h3>' + escapeHtml(item.title) + '</h3>',
            '    <p class="variant">Variant: ' + escapeHtml(item.variantLabel || 'Standard') + '</p>',
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
        renderCart();
        bindRemove();
    });
}());
