const API_URL = "https://script.google.com/macros/s/AKfycbyYHrROAMalP7l3GHBFfjTgGtB4tAMARWK-hui40ygxEzmdS7IszIXRMiXadPxpqwqU/exec";

function showLoader(text = "Loading...") {
  const loader = document.getElementById('loader');
  document.getElementById('loaderText').innerText = text;
  loader.classList.add('active');
}

function hideLoader() {
  document.getElementById('loader').classList.remove('active');
}

function getStatusBadge(status) {
    const s = status.toLowerCase().replace(/ /g, '-');
    return `<span class="badge ${s}">${status}</span>`;
}

async function trackOrder() {
  const phone = document.getElementById("trackPhone").value.trim();
  
  if (!phone) {
      alert("Please enter a phone number.");
      return;
  }

  showLoader("Tracking your active order...");

  try {
    const response = await fetch(API_URL + "?action=track&phone=" + phone + "&_=" + Date.now());
    const data = await response.json();

    if(data.success === false){
      document.getElementById("result").innerHTML = "<h3 style='text-align:center;color:var(--primary);'>No Active Order Found</h3>";
      return;
    }

    let html = `
    <div class='order-card glass'>
      <h2>Order ID: ${data.orderId}</h2>
      <p><b>Status:</b> ${getStatusBadge(data.status)}</p>
      <p><b>Items:</b> ${data.items}</p>
      <p><b>Total:</b> ₹${data.total}</p>
    `;

    if (data.deliveryBoy) {
        html += `<p><b>Delivery Partner:</b> ${data.deliveryBoy}</p>`;
    }
    if (data.deliveryPhone) {
        html += `<p><b>Partner Phone:</b> ${data.deliveryPhone}</p>`;
    }

    if(data.status === "Pending"){
      html += `
      <div class="order-actions">
        <button class="btn btn-success" onclick="addExtraItem('${data.orderId}')">➕ Add Item</button>
        <button class="btn" style="background:var(--bg-color);" onclick="cancelOrder('${data.orderId}')">❌ Cancel Order</button>
      </div>
      `;
    }

    html += `</div>`;
    document.getElementById("result").innerHTML = html;
  } catch (err) {
    document.getElementById("result").innerHTML = "<h3 style='text-align:center;color:var(--primary);'>Error finding order. Try again.</h3>";
    console.error(err);
  } finally {
    hideLoader();
  }
}

async function cancelOrder(orderId){
  const confirmCancel = confirm("Are you sure you want to cancel this order?");
  if(!confirmCancel) return;

  showLoader("Cancelling order...");
  try {
    await fetch(API_URL, {
      method:"POST",
      mode: "no-cors",
      body:JSON.stringify({
        action:"cancelOrder",
        orderId
      })
    });

    alert("Order Cancelled Successfully");
    trackOrder();
  } catch (err) {
    alert("Failed to cancel order.");
  } finally {
    hideLoader();
  }
}

async function addExtraItem(orderId){
  const extra = prompt("Enter the extra item you'd like to add:");
  if(!extra) return;

  showLoader("Adding extra item...");
  try {
    await fetch(API_URL, {
      method:"POST",
      mode: "no-cors",
      body:JSON.stringify({
        action:"addExtraItem",
        orderId,
        extra
      })
    });

    alert("Extra Item Added Successfully");
    trackOrder();
  } catch (err) {
    alert("Failed to add item.");
  } finally {
    hideLoader();
  }
}
