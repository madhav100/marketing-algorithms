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

    function getCartCount() {
        return parseCartItems().reduce(function (total, item) {
            return total + Number(item.quantity || 0);
        }, 0);
    }

    function updateAccountLinks() {
        var customer = getCurrentCustomer();
        document.querySelectorAll('[data-account-link]').forEach(function (link) {
            link.textContent = customer ? customer.name : 'Account';
        });
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
            categoryName: button.dataset.categoryName || 'Uncategorized',
            quantity: 1,
            customerId: getCartScope()
        };
    }

    function upsertCartItem(nextItem) {
        var items = parseCartItems();
        var existingItem = items.find(function (item) {
            return item.id === nextItem.id;
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
        updateAccountLinks();
        renderCartCount();
        bindAddToCart();
        bindSearch();
    });
}());
