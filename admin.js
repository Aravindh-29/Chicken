// ==================== CONFIGURATION ====================
const API_URL = "https://script.google.com/macros/s/AKfycbyYHrROAMalP7l3GHBFfjTgGtB4tAMARWK-hui40ygxEzmdS7IszIXRMiXadPxpqwqU/exec";
const ADMIN_PASSWORD = "chicken123";
const AUTO_REFRESH_INTERVAL = 0; // Auto refresh disabled

// ==================== STATE MANAGEMENT ====================
let allOrders = [];
let filteredOrders = [];
let isAuthenticated = false;
let autoRefreshTimer = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

// ==================== AUTHENTICATION ====================
function checkAuthentication() {

    const stored = sessionStorage.getItem('adminAuth');

    if (stored === 'true') {

        isAuthenticated = true;

        showAdminPanel();

        loadOrders();

    } else {

        document.getElementById('loginContainer').style.display = 'flex';

        document.getElementById('adminContainer').style.display = 'none';
    }
}

function handleLogin(event) {

    event.preventDefault();

    const password = document.getElementById('passwordInput').value;

    if (password === ADMIN_PASSWORD) {

        sessionStorage.setItem('adminAuth', 'true');

        isAuthenticated = true;

        document.getElementById('loginContainer').style.display = 'none';

        document.getElementById('adminContainer').style.display = 'block';

        document.getElementById('passwordInput').value = '';

        showToast('Login successful!', 'success');

        loadOrders();

    } else {

        showToast('Incorrect password', 'error');

        document.getElementById('passwordInput').value = '';
    }
}

function handleLogout() {

    if (confirm('Are you sure you want to logout?')) {

        sessionStorage.removeItem('adminAuth');

        isAuthenticated = false;

        clearAutoRefresh();

        document.getElementById('loginContainer').style.display = 'flex';

        document.getElementById('adminContainer').style.display = 'none';

        document.getElementById('passwordInput').value = '';

        document.getElementById('ordersContainer').innerHTML = '';

        document.getElementById('searchOrders').value = '';

        document.getElementById('statusFilter').value = '';

        showToast('Logged out successfully', 'success');
    }
}

function showAdminPanel() {

    document.getElementById('loginContainer').style.display = 'none';

    document.getElementById('adminContainer').style.display = 'block';
}

// ==================== LOAD ORDERS ====================
async function loadOrders() {

    try {

        showLoading(true, 'Loading orders...');

        const response = await fetch(`${API_URL}?action=getOrders`);

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 500));

        showLoading(false);

        if (!Array.isArray(data)) {

            console.error('Invalid response format:', data);

            showToast('Error loading orders', 'error');

            return;
        }

        allOrders = data.sort((a, b) => {

            const timeA = new Date(a.time || 0).getTime();

            const timeB = new Date(b.time || 0).getTime();

            return timeB - timeA;
        });

        filteredOrders = [...allOrders];

        displayOrders();

    } catch (error) {

        console.error('Error:', error);

        showLoading(false);

        showToast('Error loading orders. Please try again.', 'error');
    }
}

// ==================== DISPLAY ORDERS ====================
function displayOrders() {

    const container = document.getElementById('ordersContainer');

    if (filteredOrders.length === 0) {

        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; grid-column: 1/-1;">
                <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <p style="font-size: 18px; color: #666;">No orders found</p>
                <p style="color: #999; margin-top: 10px;">Orders will appear here when customers place them</p>
            </div>
        `;

        return;
    }

    container.innerHTML = filteredOrders.map(order => `

        <div class="order-card" data-order-id="${order.orderId}">

            <div class="order-card-header">

                <div>
                    <div class="order-card-id">${order.orderId}</div>
                    <div class="order-card-time">${formatTime(order.time)}</div>
                </div>

                <span class="status-badge status-${getStatusClass(order.status)}">
                    ${order.status}
                </span>

            </div>

            <div class="order-card-row">
                <span class="order-card-label">Customer Name</span>
                <span class="order-card-value">${escapeHtml(order.name)}</span>
            </div>

            <div class="order-card-row">
                <span class="order-card-label">Phone</span>
                <span class="order-card-value">
                    <a href="tel:${order.phone}" style="color: var(--primary); text-decoration: none;">
                        ${order.phone}
                    </a>
                </span>
            </div>

            <div class="order-card-row">
                <span class="order-card-label">Items</span>
                <span class="order-card-value">${escapeHtml(order.items)}</span>
            </div>

            <div class="order-card-row">
                <span class="order-card-label">Total</span>
                <span class="order-card-value">₹${order.total}</span>
            </div>

            ${order.message ? `
                <div class="order-card-row">
                    <span class="order-card-label">Message</span>
                    <span class="order-card-value">${escapeHtml(order.message)}</span>
                </div>
            ` : ''}

            ${order.status !== 'Delivered' && order.status !== 'Cancelled' ? `
                <div class="delivery-info">

                    <h4>Assign Delivery Partner</h4>

                    <input
                        type="text"
                        data-boy="${order.orderId}"
                        placeholder="Delivery Boy Name"
                        value="${order.deliveryBoy || ''}"
                    >

                    <input
                        type="tel"
                        data-phone="${order.orderId}"
                        placeholder="Delivery Boy Phone"
                        value="${order.deliveryPhone || ''}"
                    >

                </div>
            ` : ''}

            ${order.deliveryBoy ? `
                <div class="order-card-row">
                    <span class="order-card-label">Delivery Partner</span>
                    <span class="order-card-value">${escapeHtml(order.deliveryBoy)}</span>
                </div>
            ` : ''}

            ${order.deliveryPhone ? `
                <div class="order-card-row">
                    <span class="order-card-label">Delivery Contact</span>
                    <span class="order-card-value">
                        <a href="tel:${order.deliveryPhone}" style="color: var(--primary); text-decoration: none;">
                            ${order.deliveryPhone}
                        </a>
                    </span>
                </div>
            ` : ''}

            <div class="order-actions">

                ${order.status === 'Pending' ? `
                    <button class="status-btn btn-accept"
                        onclick="updateStatus('${order.orderId}','Accepted')">
                        <i class="fas fa-check"></i> Accept
                    </button>
                ` : ''}

                ${['Pending', 'Accepted'].includes(order.status) ? `
                    <button class="status-btn btn-preparing"
                        onclick="updateStatus('${order.orderId}','Preparing')">
                        <i class="fas fa-utensils"></i> Preparing
                    </button>
                ` : ''}

                ${['Preparing', 'Accepted'].includes(order.status) ? `
                    <button class="status-btn btn-out"
                        onclick="outForDelivery('${order.orderId}')">
                        <i class="fas fa-truck"></i> Out For Delivery
                    </button>
                ` : ''}

                ${order.status !== 'Delivered' && order.status !== 'Cancelled' ? `
                    <button class="status-btn btn-delivered"
                        onclick="updateStatus('${order.orderId}','Delivered')">
                        <i class="fas fa-check-double"></i> Delivered
                    </button>
                ` : ''}

                ${order.status !== 'Cancelled' && order.status !== 'Delivered' ? `
                    <button class="status-btn btn-cancel"
                        onclick="updateStatus('${order.orderId}','Cancelled')">
                        <i class="fas fa-ban"></i> Cancel
                    </button>
                ` : ''}

            </div>

        </div>

    `).join('');
}

// ==================== UPDATE ORDER STATUS ====================
async function updateStatus(orderId, status) {

    try {

        showLoading(true, `Updating status to ${status}...`);

        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateStatus',
                orderId,
                status
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        await new Promise(resolve => setTimeout(resolve, 1000));

        showLoading(false);

        showToast(`Order status updated to ${status}`, 'success');

        await loadOrders();

    } catch (error) {

        console.error('Error:', error);

        showLoading(false);

        showToast('Error updating order status', 'error');
    }
}

// ==================== OUT FOR DELIVERY ====================
async function outForDelivery(orderId) {

    const boyInput = document.querySelector(`[data-boy="${orderId}"]`);

    const phoneInput = document.querySelector(`[data-phone="${orderId}"]`);

    if (!boyInput || !phoneInput) {

        showToast('Delivery input fields not found', 'error');

        return;
    }

    const deliveryBoy = boyInput.value.trim();

    const deliveryPhone = phoneInput.value.trim();

    if (!deliveryBoy || !deliveryPhone) {

        showToast('Please enter delivery boy name and phone', 'error');

        return;
    }

    if (!/^[0-9]{10}$/.test(deliveryPhone)) {

        showToast('Please enter valid 10-digit phone number', 'error');

        return;
    }

    try {

        showLoading(true, 'Assigning delivery...');

        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'outForDelivery',
                orderId,
                deliveryBoy,
                deliveryPhone
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        await new Promise(resolve => setTimeout(resolve, 1000));

        showLoading(false);

        showToast('Order assigned for delivery', 'success');

        await loadOrders();

    } catch (error) {

        console.error(error);

        showLoading(false);

        showToast('Error assigning delivery', 'error');
    }
}

// ==================== FILTER & SEARCH ====================
function filterOrders() {

    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();

    const statusFilter = document.getElementById('statusFilter').value;

    filteredOrders = allOrders.filter(order => {

        const matchesSearch =
            !searchTerm ||
            order.orderId.toLowerCase().includes(searchTerm) ||
            order.phone.includes(searchTerm) ||
            order.name.toLowerCase().includes(searchTerm);

        const matchesStatus =
            !statusFilter ||
            order.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    displayOrders();
}

// ==================== AUTO REFRESH ====================
function startAutoRefresh() {

    autoRefreshTimer = setInterval(async () => {

        if (isAuthenticated) {

            await loadOrders();
        }

    }, AUTO_REFRESH_INTERVAL);
}

function clearAutoRefresh() {

    if (autoRefreshTimer) {

        clearInterval(autoRefreshTimer);

        autoRefreshTimer = null;
    }
}

// ==================== UTILITY FUNCTIONS ====================
function getStatusClass(status) {

    const statusMap = {
        'Pending': 'pending',
        'Accepted': 'accepted',
        'Preparing': 'preparing',
        'Out For Delivery': 'out',
        'Delivered': 'delivered',
        'Cancelled': 'cancelled'
    };

    return statusMap[status] || 'pending';
}

function formatTime(dateString) {

    if (!dateString) return 'N/A';

    try {

        const date = new Date(dateString);

        return date.toLocaleString('en-IN');

    } catch (e) {

        return 'N/A';
    }
}

function escapeHtml(text) {

    const div = document.createElement('div');

    div.textContent = text;

    return div.innerHTML;
}

function showLoading(show, message = 'Processing...') {

    const overlay = document.getElementById('loadingOverlay');

    const text = overlay.querySelector('p');

    if (show) {

        overlay.classList.add('active');

        text.textContent = message;

    } else {

        overlay.classList.remove('active');
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

// Cleanup on page unload
window.addEventListener('beforeunload', () => {

    clearAutoRefresh();
});

// ==================== MANUAL REFRESH ====================
async function manualRefresh() {

    showToast('Refreshing orders...', 'success');

    await loadOrders();
}
