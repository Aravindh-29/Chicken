let cart = [];
let total = 0;

const API_URL = "https://script.google.com/macros/s/AKfycbyYHrROAMalP7l3GHBFfjTgGtB4tAMARWK-hui40ygxEzmdS7IszIXRMiXadPxpqwqU/exec";

function showLoader(text = "Processing...") {
  const loader = document.getElementById('loader');
  document.getElementById('loaderText').innerText = text;
  loader.classList.add('active');
}

function hideLoader() {
  document.getElementById('loader').classList.remove('active');
}

function generateOrderId(){
  return 'ORD' + Date.now();
}

function updateCartUI() {
  const cartItems = document.getElementById("cartItems");
  const checkoutForm = document.getElementById("checkoutForm");
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<li style="justify-content: center; color: var(--text-muted); border: none;">Cart is empty</li>';
    checkoutForm.style.display = "none";
  } else {
    cartItems.innerHTML = "";
    cart.forEach((c) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${c.item}</span> <span>₹${c.price}</span>`;
      cartItems.appendChild(li);
    });
    checkoutForm.style.display = "block";
  }
  
  document.getElementById("total").innerText = `Total: ₹${total}`;
}

function addToCart(item, price){
  cart.push({ item, price });
  total += price;
  updateCartUI();
}

async function placeOrder(){
  const name = document.getElementById("customerName").value.trim();
  const phone = document.getElementById("customerPhone").value.trim();
  const message = document.getElementById("customerMessage").value.trim();

  if(cart.length === 0){
    alert("Your cart is empty!");
    return;
  }
  if (!name || !phone) {
    alert("Please provide your name and phone number.");
    return;
  }

  showLoader("Placing your order...");

  const items = cart.map(c => c.item).join(", ");
  const orderId = generateOrderId();

  const data = {
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

  try {
    await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify(data)
    });

    const whatsappNumber = "917093619098";
    const whatsappMessage = `🍗 NEW ORDER\n\nOrder ID: ${orderId}\nName: ${name}\nPhone: ${phone}\nItems: ${items}\nTotal: ₹${total}`;
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Open WA in a new tab smoothly
    window.open(whatsappURL, '_blank');

    alert("Order Placed Successfully!");
    
    // Reset Cart
    cart = [];
    total = 0;
    document.getElementById("customerName").value = "";
    document.getElementById("customerPhone").value = "";
    document.getElementById("customerMessage").value = "";
    updateCartUI();

  } catch (error) {
    alert("Failed to place order. Please try again.");
    console.error(error);
  } finally {
    hideLoader();
  }
}
