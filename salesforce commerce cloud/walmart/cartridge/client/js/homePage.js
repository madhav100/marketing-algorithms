(function () {
    function parseCartItems() {
        try {
            return JSON.parse(window.localStorage.getItem('wmCartItems') || '[]');
        } catch (error) {
            return [];
        }
    }

    function getCartCount() {
        var items = parseCartItems();

        if (items.length) {
            return items.reduce(function (total, item) {
                return total + Number(item.quantity || 0);
            }, 0);
        }

        return Number(window.localStorage.getItem('wmCartCount') || 0);
    }

    function setCartCount(count) {
        window.localStorage.setItem('wmCartCount', String(count));
    }

    function renderCartCount() {
        var cartCountNode = document.getElementById('cart-count');
        if (cartCountNode) {
            cartCountNode.textContent = String(getCartCount());
        }
    }

    function bindAddToCart() {
        var buttons = document.querySelectorAll('[data-action="add-to-cart"]');
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                var nextCount = getCartCount() + 1;
                setCartCount(nextCount);
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
        renderCartCount();
        bindAddToCart();
        bindSearch();
    });
}());
