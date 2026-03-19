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

    function getCartCount() {
        return parseCartItems().reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0);
    }

    function renderCartCount() {
        var cartCountNode = document.getElementById('cart-count');
        if (cartCountNode) {
            cartCountNode.textContent = String(getCartCount());
        }
    }

    function buildCartItem(button) {
        return {
            id: button.dataset.productId,
            title: button.dataset.productTitle,
            image: button.dataset.productImage,
            price: Number(button.dataset.productPrice || 0),
            displayPrice: button.dataset.productDisplayPrice,
            quantity: 1,
            variant: 'standard',
            variantLabel: 'Standard'
        };
    }

    function upsertCartItem(nextItem) {
        var items = parseCartItems();
        var existingItem = items.find(function (item) {
            return item.id === nextItem.id && item.variant === nextItem.variant;
        });

        if (existingItem) {
            existingItem.quantity = Number(existingItem.quantity || 0) + 1;
        } else {
            items.push(nextItem);
        }

        saveCartItems(items);
    }

    function bindAddToCart() {
        var buttons = document.querySelectorAll('[data-action="add-to-cart"]');
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                upsertCartItem(buildCartItem(button));
                renderCartCount();
            });
        });
    }

    function bindSearch() {
        var form = document.getElementById('home-search-form');
        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = document.getElementById('search');
            if (input && input.value.trim()) {
                window.alert('Search requested for: ' + input.value.trim());
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncCartStorageWithServerBoot();
        renderCartCount();
        bindAddToCart();
        bindSearch();
    });
}());
