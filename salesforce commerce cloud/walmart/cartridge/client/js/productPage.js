(function () {
    function bindAddToCart() {
        var button = document.getElementById('product-add-to-cart');
        if (!button) {
            return;
        }

        button.addEventListener('click', function () {
            var currentCount = Number(window.localStorage.getItem('wmCartCount') || 0);
            window.localStorage.setItem('wmCartCount', String(currentCount + 1));
            window.alert('Product added to cart');
        });
    }

    document.addEventListener('DOMContentLoaded', bindAddToCart);
}());
