// ==================== CONFIGURATION ====================
const API_URL = "https://script.google.com/macros/s/AKfycbyYHrROAMalP7l3GHBFfjTgGtB4tAMARWK-hui40ygxEzmdS7IszIXRMiXadPxpqwqU/exec";

// ==================== PRODUCTS DATA ====================
const products = [
    {
        id: 1,
        name: "Chicken 65",
        price: 120,
        description: "Crispy and tangy chicken pieces seasoned with aromatic spices",
        image: "https://images.unsplash.com/photo-1604503468506-a8da13d82291?w=800&h=600&fit=crop"
    },
    {
        id: 2,
        name: "Chicken Wings",
        price: 180,
        description: "Tender chicken wings marinated and fried to golden perfection",
        image: "https://images.unsplash.com/photo-1562967916-eb82221dfb92?w=800&h=600&fit=crop"
    },
    {
        id: 3,
        name: "Chicken Lollipop",
        price: 200,
        description: "Drumsticks with meat pulled to resemble lollipops, spiced and fried",
        image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&h=600&fit=crop"
    },
    {
        id: 4,
        name: "Dragon Chicken",
        price: 220,
        description: "Fiery spiced chicken with bold flavors and extra heat",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&h=600&fit=crop"
    },
    {
        id: 5,
        name: "Pepper Chicken",
        price: 250,
        description: "Black pepper chicken with a perfect blend of spices",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop"
    }
];

// ==================== STATE MANAGEMENT ====================
let cart = [];
let isLoading = false;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
    loadCartFromStorage();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Prevent form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => e.preventDefault());
    }

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartIcon = document.querySelector('.cart-icon');
        
        if (cartSidebar && cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            !cartIcon.contains(e.target)) {
            toggleCart();
        }
    });
}

// ==================== PRODUCT LOADING ====================
function loadProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    grid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div style="position: relative;">
                <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/800x600?text=${encodeURIComponent(product.name)}'">
                <span class="product-badge">🍗 Fresh</span>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-footer">
                    <span class="price">₹${product.price}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== CART MANAGEMENT ====================
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    cart.push({
        ...product,
        cartItemId: Date.now() // Unique ID for cart item
    });

    updateCartUI();
    saveCartToStorage();
    showToast(`${product.name} added to cart!`, 'success');
    
    // Auto-open cart
    if (!document.getElementById('cartSidebar').classList.contains('active')) {
        toggleCart();
    }
}

function removeFromCart(cartItemId) {
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    updateCartUI();
    saveCartToStorage();
    showToast('Item removed from cart', 'success');
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartSummary = document.getElementById('cartSummary');
    const checkoutForm = document.getElementById('checkoutForm');

    // Update count
    cartCount.textContent = cart.length;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (cartSummary) cartSummary.style.display = 'none';
        if (checkoutForm) checkoutForm.style.display = 'none';
        return;
    }

    // Update cart items
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.cartItemId})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');

    // Update summary
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const delivery = subtotal > 500 ? 'Free' : '₹50';
    const deliveryCharge = subtotal > 500 ? 0 : 50;
    const total = subtotal + deliveryCharge;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('delivery').textContent = delivery;
    document.getElementById('total').textContent = `₹${total}`;

    if (cartSummary) cartSummary.style.display = 'block';
    if (checkoutForm) checkoutForm.style.display = 'flex';
}

function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// ==================== ORDER PLACEMENT ====================
async function placeOrder() {
    if (cart.length === 0) {
        showToast('Please add items to cart', 'error');
        return;
    }

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const message = document.getElementById('customerMessage').value.trim();

    if (!name || !phone) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    try {
        showLoading(true, 'Placing your order...');

        const orderId = generateOrderId();
        const items = cart.map(item => item.name).join(', ');
        const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
        const delivery = subtotal > 500 ? 0 : 50;
        const total = subtotal + delivery;

        const orderData = {
            action: "placeOrder",
            orderId,
            name,
            phone,
            items,
            total,
            message,
            status: "Pending",
            deliveryBoy: "",
            deliveryPhone: ""
        };

        // Submit to Google Sheets
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (!response.ok) throw new Error('Network response was not ok');

        // Wait a moment for the backend
        await new Promise(resolve => setTimeout(resolve, 1000));

        showLoading(false);
        showToast('Order placed successfully!', 'success');

        // Send WhatsApp notification
        const whatsappNumber = "917093619098";
        const whatsappMessage = `🍗 NEW ORDER\n\nOrder ID: ${orderId}\nName: ${name}\nPhone: ${phone}\nItems: ${items}\nTotal: ₹${total}`;
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

        // Clear cart
        cart = [];
        updateCartUI();
        saveCartToStorage();

        // Reset form
        document.getElementById('customerName').value = '';
        document.getElementById('customerPhone').value = '';
        document.getElementById('customerMessage').value = '';

        // Show success and redirect to track page
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
            setTimeout(() => {
                window.location.href = `track.html?phone=${encodeURIComponent(phone)}`;
            }, 500);
        }, 500);

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        showToast('Error placing order. Please try again.', 'error');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function generateOrderId() {
    return 'ORD' + Date.now();
}

function showLoading(show, message = 'Processing...') {
    const overlay = document.getElementById('loadingOverlay');
    const text = overlay.querySelector('p');
    
    if (show) {
        overlay.classList.add('active');
        text.textContent = message;
        isLoading = true;
    } else {
        overlay.classList.remove('active');
        isLoading = false;
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast active ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}
