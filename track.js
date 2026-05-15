// ==================== CONFIGURATION ====================
const API_URL = "https://script.google.com/macros/s/AKfycbyYHrROAMalP7l3GHBFfjTgGtB4tAMARWK-hui40ygxEzmdS7IszIXRMiXadPxpqwqU/exec";
const AUTO_REFRESH_INTERVAL = 5000; // 5 seconds

// ==================== STATE MANAGEMENT ====================
let autoRefreshTimer = null;
let currentPhone = null;
let currentOrderId = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    
    // Check if phone number is in URL params
    const params = new URLSearchParams(window.location.search);
    const phoneParam = params.get('phone');
    
    if (phoneParam) {
        document.getElementById('trackPhone').value = phoneParam;
        trackOrder();
    }
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    const trackForm = document.querySelector('.track-form');
    if (trackForm) {
        trackForm.addEventListener('submit', handleTrack);
    }
}

async function handleTrack(event) {
    if (event) event.preventDefault();
    await trackOrder();
}

// ==================== TRACK ORDER FUNCTION ====================
async function trackOrder() {
    const phone = document.getElementById('trackPhone').value.trim();
    
    if (!phone) {
        showToast('Please enter a phone number', 'error');
        return;
    }

    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, ''))) {
        showToast('Please enter a valid 10-digit phone number', 'error');
        return;
    }

    try {
        showLoading(true, 'Tracking your order...');
        clearAutoRefresh();

        const response = await fetch(`${API_URL}?action=track&phone=${encodeURIComponent(phone)}`);
        
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        showLoading(false);

        if (!data.success) {
            document.getElementById('trackResult').innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                    <p style="font-size: 18px; color: #666;">No orders found for this phone number</p>
                    <p style="color: #999; margin-top: 10px;">Try placing an order first</p>
                </div>
            `;
            return;
        }

        currentPhone = phone;
        currentOrderId = data.orderId;
        displayOrderDetails(data);

        // Start auto-refresh
        startAutoRefresh();

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        showToast('Error tracking order. Please try again.', 'error');
    }
}

// ==================== DISPLAY ORDER DETAILS ====================
function displayOrderDetails(order) {
    const timeline = getStatusTimeline(order.status);
    
    const html = `
        <div class="order-details">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.orderId}</div>
                    <div class="order-card-time">${new Date().toLocaleDateString()}</div>
                </div>
                <span class="status-badge status-${getStatusClass(order.status)}">
                    ${order.status}
                </span>
            </div>

            <div class="order-detail-row">
                <span class="order-detail-label">Order ID</span>
                <span class="order-detail-value">${order.orderId}</span>
            </div>

            <div class="order-detail-row">
                <span class="order-detail-label">Items</span>
                <span class="order-detail-value">${order.items}</span>
            </div>

            <div class="order-detail-row">
                <span class="order-detail-label">Total Amount</span>
                <span class="order-detail-value">₹${order.total}</span>
            </div>

            <div class="order-detail-row">
                <span class="order-detail-label">Status</span>
                <span class="order-detail-value">${order.status}</span>
            </div>

            ${order.deliveryBoy ? `
                <div class="order-detail-row">
                    <span class="order-detail-label">Delivery Partner</span>
                    <span class="order-detail-value">${order.deliveryBoy}</span>
                </div>
            ` : ''}

            ${order.deliveryPhone ? `
                <div class="order-detail-row">
                    <span class="order-detail-label">Delivery Contact</span>
                    <span class="order-detail-value">
                        <a href="tel:${order.deliveryPhone}" style="color: var(--primary); text-decoration: none;">
                            ${order.deliveryPhone}
                        </a>
                    </span>
                </div>
            ` : ''}
        </div>

        <div class="status-timeline">
            <h3 style="margin-bottom: 20px; color: var(--dark);">Order Timeline</h3>
            ${timeline}
        </div>

        ${order.status === 'Pending' ? `
            <div class="order-actions">
                <button class="action-btn" onclick="cancelOrder('${order.orderId}')">
                    <i class="fas fa-times"></i> Cancel Order
                </button>
                <button class="action-btn" onclick="addExtraItem('${order.orderId}')">
                    <i class="fas fa-plus"></i> Add Item
                </button>
            </div>
        ` : ''}
    `;

    document.getElementById('trackResult').innerHTML = html;
}

// ==================== STATUS TIMELINE ====================
function getStatusTimeline(currentStatus) {
    const statuses = [
        { label: 'Order Placed', status: 'Pending', icon: '📋' },
        { label: 'Accepted', status: 'Accepted', icon: '✅' },
        { label: 'Preparing', status: 'Preparing', icon: '👨‍🍳' },
        { label: 'Out for Delivery', status: 'Out For Delivery', icon: '🚗' },
        { label: 'Delivered', status: 'Delivered', icon: '🎉' }
    ];

    const currentIndex = statuses.findIndex(s => s.status === currentStatus);

    return statuses.map((s, index) => `
        <div class="timeline-item ${index <= currentIndex ? 'completed' : ''}">
            <div class="timeline-dot">${s.icon}</div>
            <div class="timeline-content">
                <div class="timeline-title">${s.label}</div>
                <div class="timeline-time">${index <= currentIndex ? '✓ Completed' : 'Pending'}</div>
            </div>
        </div>
    `).join('');
}

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

// ==================== ORDER ACTIONS ====================
async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
        showLoading(true, 'Cancelling order...');

        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'cancelOrder',
                orderId
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        await new Promise(resolve => setTimeout(resolve, 1000));
        showLoading(false);
        showToast('Order cancelled successfully', 'success');

        // Refresh order status
        await trackOrder();

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        showToast('Error cancelling order. Please try again.', 'error');
    }
}

async function addExtraItem(orderId) {
    const extra = prompt('Enter the extra item you want to add:');
    if (!extra) return;

    try {
        showLoading(true, 'Adding item...');

        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'addExtraItem',
                orderId,
                extra: extra.trim()
            })
        });

        if (!response.ok) throw new Error('Network response was not ok');

        await new Promise(resolve => setTimeout(resolve, 1000));
        showLoading(false);
        showToast('Extra item added successfully', 'success');

        // Refresh order status
        await trackOrder();

    } catch (error) {
        console.error('Error:', error);
        showLoading(false);
        showToast('Error adding item. Please try again.', 'error');
    }
}

// ==================== AUTO REFRESH ====================
function startAutoRefresh() {
    // Refresh every 5 seconds while order is being prepared
    autoRefreshTimer = setInterval(async () => {
        if (currentPhone) {
            const response = await fetch(`${API_URL}?action=track&phone=${encodeURIComponent(currentPhone)}`);
            const data = await response.json();
            
            if (data.success) {
                displayOrderDetails(data);
            }
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
