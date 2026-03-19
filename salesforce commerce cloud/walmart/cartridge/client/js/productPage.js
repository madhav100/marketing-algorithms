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

    function buildCartItem(button) {
        return {
            id: button.dataset.productId,
            title: button.dataset.productTitle,
            image: button.dataset.productImage,
            price: Number(button.dataset.productPrice || 0),
            displayPrice: button.dataset.productDisplayPrice,
            categoryName: button.dataset.categoryName || 'Uncategorized',
            quantity: 1
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
            window.alert('Product added to cart');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncCartStorageWithServerBoot();
        bindAddToCart();
    });
}());
