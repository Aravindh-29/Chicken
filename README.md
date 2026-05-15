# 🍗 Aravindh Chicken Shop - Professional Ordering System

A modern, professional-grade online ordering system for chicken restaurants with real-time order tracking, admin management, and beautiful UI with glassmorphism design.

## ✨ Features

### Customer Features
- **Modern Product Catalog**: Beautiful product cards with images, descriptions, and pricing
- **Smart Cart System**: Add/remove items, cart persistence using localStorage
- **Real-time Order Tracking**: Track orders with live status updates and timeline
- **Auto-refresh**: Orders automatically refresh every 5 seconds while tracking
- **WhatsApp Integration**: Automatic WhatsApp notification for admin when order placed
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Loading States**: Professional loading indicators and animations
- **Toast Notifications**: Real-time feedback for user actions

### Admin Features
- **Secure Authentication**: Password-protected admin dashboard
- **Order Management**: View all orders with complete details
- **Status Updates**: Update order status from Pending → Accepted → Preparing → Out For Delivery → Delivered
- **Delivery Assignment**: Assign delivery partners with name and phone number
- **Advanced Filtering**: Filter orders by status and search by order ID or phone
- **Auto-refresh**: Orders list refreshes automatically every 10 seconds
- **Order Details**: View customer info, items, messages, and delivery details

### Technical Features
- **Google Sheets Integration**: All data stored securely in Google Sheets
- **No Database Required**: Uses Google Apps Script as backend
- **Real-time Sync**: Auto-refresh every 5-10 seconds
- **Error Handling**: Comprehensive error handling and user feedback
- **Offline Support**: Cart persists even if user closes the browser
- **Modern Stack**: Pure HTML, CSS, JavaScript - no dependencies needed

## 📁 File Structure

```
aravindh-chicken-shop/
├── index.html          # Main landing page
├── track.html          # Order tracking page
├── admin.html          # Admin dashboard
├── styles.css          # All CSS styles (glassmorphism design)
├── app.js              # Main app logic (products, cart)
├── track.js            # Order tracking logic
├── admin.js            # Admin dashboard logic
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Extract Files
Extract all files from the ZIP to a folder on your server or local machine.

### 2. Setup (No configuration needed!)
The system is pre-configured with:
- **Google Sheets ID**: `1zRKBu_5BRvtOteanZYnUev3syuWRrK2z4Bd2yX2hB6g`
- **Google Apps Script URL**: Already linked in all JS files
- **Admin Password**: `chicken123`

### 3. Upload to Server (Optional)
You can host this on:
- Netlify (Free)
- Vercel (Free)
- GitHub Pages
- Any web server
- Or open `index.html` locally

### 4. Start Using
- **Customer**: Open `index.html` to browse and order
- **Admin**: Open `admin.html` to manage orders
- **Track**: Open `track.html` or use "Track Order" link

## 📱 Pages Overview

### `index.html` - Main Store Page
- Hero section with call-to-action
- Product grid with 5 items
- Shopping cart sidebar
- Checkout form
- About section with features
- Responsive navigation

**Features:**
- Add items to cart
- View cart with real-time updates
- Enter delivery details
- Place order with validation
- Cart persists in browser

### `track.html` - Order Tracking
- Enter phone number to track
- Real-time order status with timeline
- Display delivery partner details
- Action buttons for Pending orders:
  - Cancel Order
  - Add Extra Item
- Auto-refresh every 5 seconds

**Status Timeline:**
- 📋 Order Placed (Pending)
- ✅ Accepted
- 👨‍🍳 Preparing
- 🚗 Out for Delivery
- 🎉 Delivered

### `admin.html` - Admin Dashboard
- Password-protected login
- View all orders in card grid
- Search by Order ID or Phone
- Filter by Status
- Update order status
- Assign delivery partner
- Auto-refresh every 10 seconds

**Admin Password**: `chicken123`

## 🎨 Design Features

### Color Scheme
- **Primary**: #d62828 (Red)
- **Secondary**: #25D366 (Green - WhatsApp)
- **Background**: #f5f5f5 (Light Gray)
- **Text**: #1a1a1a (Dark)

### Modern Elements
- Glassmorphism effects
- Smooth animations and transitions
- Hover effects on all interactive elements
- Gradient backgrounds
- Box shadows and depth
- Responsive grid layouts
- Professional typography

### Accessibility
- Semantic HTML
- Color contrast compliance
- Touch-friendly buttons
- Keyboard navigation support
- Mobile-optimized layouts

## 🔧 Customization

### Change Products
Edit the `products` array in `app.js`:

```javascript
const products = [
    {
        id: 1,
        name: "Your Item",
        price: 120,
        description: "Item description",
        image: "image-url"
    }
];
```

### Change Colors
Edit CSS variables in `styles.css`:

```css
:root {
    --primary: #your-color;
    --secondary: #your-color;
    /* ... etc */
}
```

### Change Admin Password
In `admin.js`, update:

```javascript
const ADMIN_PASSWORD = "your-new-password";
```

### Change WhatsApp Number
In `app.js`, update:

```javascript
const whatsappNumber = "919876543210"; // Your number
```

### Change Auto-Refresh Interval
- Customer tracking: `track.js` - `AUTO_REFRESH_INTERVAL = 5000`
- Admin dashboard: `admin.js` - `AUTO_REFRESH_INTERVAL = 10000`

## 📊 Google Sheets Structure

Your Google Sheet should have columns:
1. Order ID
2. Time
3. Name
4. Phone
5. Items
6. Total
7. Message
8. Status
9. Delivery Boy
10. Delivery Phone

The system handles all updates automatically!

## 🔐 Security Features

- ✅ Password-protected admin dashboard
- ✅ Client-side validation
- ✅ HTTPS recommended for production
- ✅ No sensitive data in frontend code
- ✅ All data stored in Google Sheets (secure)

## 📞 Contact Information

For support:
- **Admin WhatsApp**: `+91 7093619098`
- **Shop Name**: Aravindh Chicken Shop
- **Items**: Fresh Spicy Chicken Starters

## 🎯 Order Status Flow

```
Customer Places Order
         ↓
    Pending (Yellow)
         ↓
   Accepted (Blue) ← Admin clicks Accept
         ↓
   Preparing (Gray) ← Admin clicks Preparing
         ↓
Out For Delivery (Purple) ← Admin assigns delivery partner
         ↓
  Delivered (Green) ← Admin confirms delivery
```

## 💡 Tips

1. **Mobile-First**: The design works great on phones
2. **Cart Persistence**: Customer's cart is saved in browser
3. **Auto-Refresh**: Tracking page updates every 5 seconds automatically
4. **WhatsApp Notifications**: Admin gets instant WhatsApp notification
5. **No Backend**: Everything works with just Google Sheets!

## 🔄 Backend Integration

All backend operations use Google Apps Script:
- `doGet()`: Retrieves order data
- `doPost()`: Updates order data

Every request includes action parameter:
- `action: "getOrders"` - Fetch all orders
- `action: "track"` - Track specific order by phone
- `action: "placeOrder"` - Create new order
- `action: "updateStatus"` - Update order status
- `action: "outForDelivery"` - Assign delivery
- `action: "cancelOrder"` - Cancel pending order
- `action: "addExtraItem"` - Add item to pending order

## 📈 Analytics

You can track:
- Total orders placed
- Average order value
- Popular items
- Delivery success rate
- Customer retention

All data is in Google Sheets - analyze directly!

## 🎓 Learning Resources

This project demonstrates:
- Modern JavaScript (ES6+)
- Async/Await patterns
- DOM manipulation
- CSS Grid & Flexbox
- Google Apps Script integration
- Form validation
- Local storage usage
- API integration

## 📝 License

This project is created for Aravindh Chicken Shop.

## 🤝 Support

For any issues or questions:
1. Check browser console for errors (F12)
2. Verify Google Sheets link is correct
3. Check internet connection
4. Clear browser cache if needed
5. Try incognito mode to test

## ✅ Checklist Before Launch

- [ ] Verify Google Sheets ID in all JS files
- [ ] Test order placement
- [ ] Test order tracking
- [ ] Test admin login
- [ ] Test status updates
- [ ] Check mobile responsiveness
- [ ] Test WhatsApp notification
- [ ] Update contact information
- [ ] Update product items and prices
- [ ] Change admin password to secure one
- [ ] Update delivery charges if needed

## 🚀 Production Deployment

### Option 1: Netlify (Recommended - Free)
1. Create account on netlify.com
2. Drag and drop folder
3. Get live URL instantly

### Option 2: Vercel
1. Create account on vercel.com
2. Import project
3. Deploy with one click

### Option 3: Your Own Server
1. Upload files via FTP
2. Ensure all files are in same directory
3. Open index.html

### Option 4: GitHub Pages
1. Create GitHub repository
2. Push files
3. Enable GitHub Pages in settings

---

**Made with ❤️ for Aravindh Chicken Shop**

Enjoy your professional ordering system! 🍗
