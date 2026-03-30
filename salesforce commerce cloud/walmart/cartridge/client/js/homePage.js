(function () {
    function getCurrentCustomer() {
        try {
            return JSON.parse(window.localStorage.getItem('wmCurrentCustomer') || 'null');
        } catch (error) {
            return null;
        }
    }

    function clearCurrentCustomer() {
        window.localStorage.removeItem('wmCurrentCustomer');
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

    function updateAccountUI() {
        var customer = getCurrentCustomer();
        var isAuthenticated = Boolean(customer && customer.id);
        var accountToggle = document.getElementById('account-dropdown-toggle');
        var accountDropdownMenu = document.getElementById('account-dropdown-menu');
        var welcomeUserName = document.getElementById('welcome-user-name');

        if (accountToggle) {
            accountToggle.textContent = customer && customer.name ? customer.name : 'Account';
            accountToggle.dataset.authenticated = isAuthenticated ? 'true' : 'false';
            accountToggle.setAttribute('aria-expanded', 'false');
        }

        if (accountDropdownMenu) {
            accountDropdownMenu.hidden = true;
        }

        if (welcomeUserName) {
            welcomeUserName.textContent = customer && customer.name ? customer.name : '';
            welcomeUserName.hidden = !customer || !customer.name;
        }
    }

    function bindAccountDropdown() {
        var toggle = document.getElementById('account-dropdown-toggle');
        var menu = document.getElementById('account-dropdown-menu');
        if (!toggle || !menu) {
            return;
        }

        function closeMenu() {
            menu.hidden = true;
            toggle.setAttribute('aria-expanded', 'false');
        }

        function openMenu() {
            menu.hidden = false;
            toggle.setAttribute('aria-expanded', 'true');
        }

        function isAuthenticated() {
            return toggle.dataset.authenticated === 'true';
        }

        toggle.addEventListener('click', function () {
            if (!isAuthenticated()) {
                window.location.href = '/account';
                return;
            }
            if (menu.hidden) {
                openMenu();
            } else {
                closeMenu();
            }
        });

        toggle.addEventListener('mouseenter', function () {
            if (isAuthenticated()) {
                openMenu();
            }
        });
        menu.addEventListener('mouseenter', function () {
            if (isAuthenticated()) {
                openMenu();
            }
        });

        var dropdownContainer = document.getElementById('account-dropdown');
        if (dropdownContainer) {
            dropdownContainer.addEventListener('mouseleave', closeMenu);
        }

        document.addEventListener('click', function (event) {
            if (!toggle.contains(event.target) && !menu.contains(event.target)) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
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
                if (window.SfraCartTracker && typeof window.SfraCartTracker.trackAddToCart === 'function') {
                    window.SfraCartTracker.trackAddToCart(
                        button.dataset.productId,
                        button.dataset.productTitle,
                        1,
                        Number(button.dataset.productPrice || 0)
                    );
                }
                renderCartCount();
            });
        });
    }

    function bindCategoryClicks() {
        document.querySelectorAll('.category-navbar__link').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.SfraCategoryTracker && typeof window.SfraCategoryTracker.trackCategoryClick === 'function') {
                    window.SfraCategoryTracker.trackCategoryClick(link.getAttribute('href') || '', link.textContent.trim());
                }
            });
        });
    }

    function bindProductClicks() {
        document.querySelectorAll('.product-link').forEach(function (link) {
            link.addEventListener('click', function () {
                var card = link.closest('.wm-card');
                if (!card) return;
                var titleNode = card.querySelector('h3');
                var button = card.querySelector('[data-action="add-to-cart"]');
                if (window.SfraProductTracker && typeof window.SfraProductTracker.trackProductClick === 'function') {
                    window.SfraProductTracker.trackProductClick(
                        button ? button.dataset.productId : '',
                        titleNode ? titleNode.textContent.trim() : 'Unknown product',
                        'home',
                        'product-grid'
                    );
                }
            });
        });
    }

    function bindSignOut() {
        var signOutButton = document.getElementById('home-sign-out');
        if (!signOutButton) {
            return;
        }

        signOutButton.addEventListener('click', function () {
            var customer = getCurrentCustomer();
            if (window.SfraAnalyticsSession && typeof window.SfraAnalyticsSession.logout === 'function') {
                window.SfraAnalyticsSession.logout(customer && customer.id ? customer.id : 'guest');
            }
            if (window.SfraAnalyticsSession && typeof window.SfraAnalyticsSession.end === 'function') {
                window.SfraAnalyticsSession.end(customer && customer.id ? customer.id : 'guest');
            }
            clearCurrentCustomer();
            window.location.reload();
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

    function bindCarouselControls() {
        document.querySelectorAll('.carousel-arrow').forEach(function (button) {
            button.addEventListener('click', function () {
                var targetId = button.getAttribute('data-carousel-target');
                var carousel = targetId ? document.getElementById(targetId) : null;
                if (!carousel) {
                    return;
                }

                var direction = button.classList.contains('carousel-arrow--prev') ? -1 : 1;
                var scrollAmount = Math.max(260, Math.floor(carousel.clientWidth * 0.75));
                carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncCartStorageWithServerBoot();
        updateAccountUI();
        renderCartCount();
        bindAddToCart();
        bindCategoryClicks();
        bindProductClicks();
        bindSignOut();
        bindAccountDropdown();
        bindSearch();
        bindCarouselControls();
    });
}());
