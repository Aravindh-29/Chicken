const API_URL = "https://script.google.com/macros/s/AKfycbyYHrROAMalP7l3GHBFfjTgGtB4tAMARWK-hui40ygxEzmdS7IszIXRMiXadPxpqwqU/exec";

function showLoader(text = "Processing...") {
  const loader = document.getElementById('loader');
  document.getElementById('loaderText').innerText = text;
  loader.classList.add('active');
}

function hideLoader() {
  document.getElementById('loader').classList.remove('active');
}

function verifyAdmin() {
  const pass = document.getElementById('adminPassword').value;
  if(pass === "chicken123") {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('adminContent').style.display = 'block';
    loadOrders();
  } else {
    document.getElementById('authError').style.display = 'block';
  }
}

function getStatusBadge(status) {
    const s = status.toLowerCase().replace(/ /g, '-');
    return `<span class="badge ${s}">${status}</span>`;
}

async function loadOrders(isRefresh = false){
  if(isRefresh) showLoader("Refreshing orders...");
  else showLoader("Loading dashboard securely...");

  try {
    const response = await fetch(API_URL + "?action=getOrders&_=" + Date.now());
    const data = await response.json();

    let html = "";
    
    if (data.length === 0) {
        html = `<p style="text-align:center; color:var(--text-muted);">No orders placed yet.</p>`;
    }

    data.reverse().forEach(order => {
      html += `
      <div class='order-card glass' style="border-color: rgba(239, 68, 68, 0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <h3 style="margin:0;">${order.orderId}</h3>
            ${getStatusBadge(order.status)}
        </div>

        <p><b>Name:</b> ${order.name}</p>
        <p><b>Phone:</b> ${order.phone}</p>
        <p><b>Items:</b> ${order.items}</p>
        
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <input type='text' id='boy${order.orderId}' placeholder='Delivery Partner Name' value='${order.deliveryBoy || ""}'>
            <input type='text' id='phone${order.orderId}' placeholder='Delivery Partner Phone' value='${order.deliveryPhone || ""}'>
        </div>

        <div class="order-actions" style="margin-top: 20px;">
            <button class="btn btn-success" onclick="updateStatus('${order.orderId}','Accepted')">Accept</button>
            <button class="btn" style="background:var(--bg-color)" onclick="updateStatus('${order.orderId}','Preparing')">Preparing</button>
            <button class="btn" style="background:#f97316" onclick="outForDelivery('${order.orderId}')">Out For Delivery</button>
            <button class="btn" style="background:#22c55e" onclick="updateStatus('${order.orderId}','Delivered')">Delivered</button>
        </div>
      </div>
      `;
    });

    document.getElementById("orders").innerHTML = html;
  } catch(error) {
    console.error(error);
    alert("Failed to fetch orders.");
  } finally {
    hideLoader();
  }
}

async function updateStatus(orderId, status){
  showLoader(`Updating to '${status}'...`);
  try {
    await fetch(API_URL, {
      method:"POST",
      mode: "no-cors",
      body:JSON.stringify({
        action:"updateStatus",
        orderId,
        status
      })
    });
    await loadOrders();
  } catch(err) {
    alert("Failed to update status.");
    hideLoader();
  }
}

async function outForDelivery(orderId){
  const deliveryBoy = document.getElementById("boy" + orderId).value.trim();
  const deliveryPhone = document.getElementById("phone" + orderId).value.trim();

  if(!deliveryBoy || !deliveryPhone) {
      alert("Please provide the delivery partner's name and phone number before assigning.");
      return;
  }

  showLoader("Assigning delivery partner...");
  try {
    await fetch(API_URL, {
      method:"POST",
      mode: "no-cors",
      body:JSON.stringify({
        action:"outForDelivery",
        orderId,
        deliveryBoy,
        deliveryPhone
      })
    });
    await loadOrders();
  } catch(err) {
    alert("Failed to assign delivery.");
    hideLoader();
  }
}
