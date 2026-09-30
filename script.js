const PRODUCTS = {
    "torta-chocolate": {
        id: "torta-chocolate",
        name: "Torta de Chocolate",
        description: "Clásica y deliciosa",
        price: 25000,
        image: "img/torta1.jpg"
    },
    "tarta-frutilla": {
        id: "tarta-frutilla",
        name: "Tarta de Frutilla",
        description: "Fresca y artesanal",
        price: 20000,
        image: "img/torta2.jpg"
    },
    "cupcakes": {
        id: "cupcakes",
        name: "Cupcakes",
        description: "Ideales para eventos",
        price: 15000,
        image: "img/torta3.jpg"
    }
};

const WHATSAPP_NUMBER = "5493804507584";
const STORAGE_KEY = "tu-pasteleria-carrito";

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

const cartPanel = document.getElementById("cartPanel");
const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");
const checkoutWhatsApp = document.getElementById("checkoutWhatsApp");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

function formatPrice(value) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(value);
}

function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function getCartEntries() {
    return Object.values(cart).filter(item => item.quantity > 0);
}

function getCartCount() {
    return getCartEntries().reduce((total, item) => total + item.quantity, 0);
}

function getCartTotal() {
    return getCartEntries().reduce(
        (total, item) => total + (item.price * item.quantity),
        0
    );
}

function addToCart(productId) {
    const product = PRODUCTS[productId];

    if (!product) {
        return;
    }

    if (cart[productId]) {
        cart[productId].quantity += 1;
    } else {
        cart[productId] = {
            ...product,
            quantity: 1
        };
    }

    saveCart();
    renderCart();
    openCart();
}

function changeQuantity(productId, amount) {
    if (!cart[productId]) {
        return;
    }

    cart[productId].quantity += amount;

    if (cart[productId].quantity <= 0) {
        delete cart[productId];
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    delete cart[productId];
    saveCart();
    renderCart();
}

function clearCart() {
    cart = {};
    saveCart();
    renderCart();
}

function renderCart() {
    const entries = getCartEntries();
    const count = getCartCount();
    const total = getCartTotal();

    cartCount.textContent = count;
    cartTotal.textContent = formatPrice(total);

    if (entries.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Tu carrito está vacío</h3>
                <p>Agregá algunos productos para comenzar tu pedido.</p>
            </div>
        `;

        checkoutWhatsApp.classList.add("disabled");
        checkoutWhatsApp.href = "#";
        return;
    }

    cartItems.innerHTML = entries.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>

            <div class="cart-item-main">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${formatPrice(item.price)} por unidad</div>

                <div class="cart-item-actions">
                    <div>
                        <div class="quantity-control">
                            <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Disminuir cantidad">−</button>
                            <span>${item.quantity}</span>
                            <button type="button" data-action="increase" data-id="${item.id}" aria-label="Aumentar cantidad">+</button>
                        </div>

                        <button class="remove-item" type="button" data-action="remove" data-id="${item.id}">
                            Eliminar
                        </button>
                    </div>

                    <span class="item-subtotal">
                        ${formatPrice(item.price * item.quantity)}
                    </span>
                </div>
            </div>
        </div>
    `).join("");

    checkoutWhatsApp.classList.remove("disabled");
    checkoutWhatsApp.href = buildWhatsAppLink();
}

function buildWhatsAppLink() {
    const entries = getCartEntries();

    let message = "Hola! Quiero hacer el siguiente pedido:%0A%0A";

    entries.forEach(item => {
        const subtotal = item.price * item.quantity;
        message += `• ${item.name} x${item.quantity} - ${formatPrice(subtotal)}%0A`;
    });

    message += `%0A*Total: ${formatPrice(getCartTotal())}*`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function openCart() {
    cartPanel.classList.add("active");
    cartOverlay.classList.add("active");
    cartPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
}

function closeCart() {
    cartPanel.classList.remove("active");
    cartOverlay.classList.remove("active");
    cartPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

document.querySelectorAll(".add-cart").forEach(button => {
    button.addEventListener("click", () => {
        addToCart(button.dataset.id);
    });
});

cartItems.addEventListener("click", event => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const { action, id } = button.dataset;

    if (action === "increase") {
        changeQuantity(id, 1);
    }

    if (action === "decrease") {
        changeQuantity(id, -1);
    }

    if (action === "remove") {
        removeFromCart(id);
    }
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.getElementById("clearCart").addEventListener("click", () => {
    if (getCartEntries().length === 0) {
        return;
    }

    clearCart();
});

menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("active");
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCart();
        navLinks.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    }
});

renderCart();