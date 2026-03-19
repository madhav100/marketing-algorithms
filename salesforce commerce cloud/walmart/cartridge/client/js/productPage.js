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

    function updateAccountLinks() {
        var customer = getCurrentCustomer();
        document.querySelectorAll('[data-account-link]').forEach(function (link) {
            link.textContent = customer ? customer.name : 'Account';
        });
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
        var button = document.getElementById('product-add-to-cart');
        if (!button) {
            return;
        }

        button.addEventListener('click', function () {
            upsertCartItem(buildCartItem(button));
            window.alert('Product added to cart for ' + (getCurrentCustomer() ? getCurrentCustomer().name : 'guest') + '.');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncCartStorageWithServerBoot();
        updateAccountLinks();
        bindAddToCart();
    });
}());
