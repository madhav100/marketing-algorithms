(function () {
    function bindRemove() {
        var removeButton = document.getElementById('cart-remove-item');
        if (!removeButton) {
            return;
        }

        removeButton.addEventListener('click', function () {
            var row = document.querySelector('[data-cart-item]');
            if (row) {
                row.style.display = 'none';
            }
            window.localStorage.setItem('wmCartCount', '0');
            var subtotal = document.getElementById('cart-subtotal');
            if (subtotal) {
                subtotal.textContent = '$0.00';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', bindRemove);
}());
