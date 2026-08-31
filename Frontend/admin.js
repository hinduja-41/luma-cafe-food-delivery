// =========================================
// ADMIN LOGIN PROTECTION
// =========================================

const adminLoggedIn =
    localStorage.getItem("adminLoggedIn");

if (adminLoggedIn !== "true") {

    window.location.href =
        "admin-login.html";

}
// =========================================
// ADMIN WELCOME + LOGOUT
// =========================================

const adminWelcome =
    document.getElementById("adminWelcome");

const adminLogoutBtn =
    document.getElementById("adminLogoutBtn");

const adminName =
    localStorage.getItem("adminName");


if (adminWelcome) {

    adminWelcome.textContent =
        `👋 ${adminName || "Admin"}`;

}


if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "adminLoggedIn"
            );

            localStorage.removeItem(
                "adminName"
            );


            alert(
                "Admin logged out successfully! 👋"
            );


            window.location.href =
                "admin-login.html";

        }
    );

}
const ordersContainer = document.getElementById("ordersContainer");
const refreshOrders = document.getElementById("refreshOrders");
let allOrders = [];


// =========================================
// LOAD ORDERS
// =========================================

async function loadOrders() {

    ordersContainer.innerHTML = `
        <p class="loading">Loading orders...</p>
    `;

    try {

        const response = await fetch(
            "http://localhost:5000/api/orders"
        );

        if (!response.ok) {
            throw new Error("Failed to fetch orders");
        }

        const orders = await response.json();
        allOrders = orders;
        updateDashboardStats(orders);

        displayOrders(orders);

    } catch (error) {

        console.error("Error loading orders:", error);

        ordersContainer.innerHTML = `
            <p class="empty-orders">
                Unable to load orders.
            </p>
        `;

    }

}
// =========================================
// DASHBOARD STATISTICS
// =========================================

function updateDashboardStats(orders) {

    const totalOrders =
        document.getElementById("totalOrders");

    const pendingOrders =
        document.getElementById("pendingOrders");

    const deliveredOrders =
        document.getElementById("deliveredOrders");


    const pendingCount =
        orders.filter(
            order => order.status === "Pending"
        ).length;


    const deliveredCount =
        orders.filter(
            order => order.status === "Delivered"
        ).length;


    if (totalOrders) {

        totalOrders.textContent =
            orders.length;

    }


    if (pendingOrders) {

        pendingOrders.textContent =
            pendingCount;

    }


    if (deliveredOrders) {

        deliveredOrders.textContent =
            deliveredCount;

    }

}


// =========================================
// DISPLAY ORDERS
// =========================================

function displayOrders(orders) {
    

    if (orders.length === 0) {

        ordersContainer.innerHTML = `
            <p class="empty-orders">
                No orders yet.
            </p>
        `;

        return;
    }


    ordersContainer.innerHTML = "";


    orders.forEach(order => {

        let itemsHTML = "";


        // Convert stored items JSON into an array
        let items = [];

        try {

            items = typeof order.items === "string"
                ? JSON.parse(order.items)
                : order.items;

        } catch (error) {

            console.error(
                "Unable to read order items:",
                error
            );

        }


        if (Array.isArray(items)) {

            itemsHTML = items.map(item => {

                return `
                    <div class="item-row">

                        <span>
                            ${item.name} × ${item.quantity}
                        </span>

                        <span>
                            ₹${item.price * item.quantity}
                        </span>

                    </div>
                `;

            }).join("");

        }


        const orderCard = document.createElement("div");

        orderCard.className = "order-card";


        orderCard.innerHTML = `

            <div class="order-top">

                <div class="order-id">
                    Order #${order.id}
                </div>

                <div class="order-date">
                    ${new Date(order.created_at).toLocaleString()}
                </div>

            </div>


            <div class="order-info">

                <div class="info-box">

                    <span>Customer</span>

                    <strong>
                        ${order.customer_name}
                    </strong>

                </div>


                <div class="info-box">

                    <span>Phone</span>

                    <strong>
                        ${order.customer_phone}
                    </strong>

                </div>


                <div class="info-box">

                    <span>Address</span>

                    <strong>
                        ${order.customer_address}
                    </strong>

                </div>

            </div>


            <div class="order-items">

                <h3>Ordered Items</h3>

                ${itemsHTML}

            </div>


            <div class="order-bottom">

    <div class="order-total">
        ₹${order.total_amount}
    </div>

    <select
        class="status-select"
        data-order-id="${order.id}"
    >
        <option value="Pending"
            ${order.status === "Pending" ? "selected" : ""}>
            Pending
        </option>

        <option value="Preparing"
            ${order.status === "Preparing" ? "selected" : ""}>
            Preparing
        </option>

        <option value="Out for Delivery"
            ${order.status === "Out for Delivery" ? "selected" : ""}>
            Out for Delivery
        </option>

        <option value="Delivered"
            ${order.status === "Delivered" ? "selected" : ""}>
            Delivered
        </option>
    </select>

</div>

        `;


        ordersContainer.appendChild(orderCard);

    });

}


// =========================================
// REFRESH BUTTON
// =========================================

refreshOrders.addEventListener(
    "click",
    loadOrders
);


// =========================================
// INITIAL LOAD
// =========================================

loadOrders();
// =========================================
// UPDATE ORDER STATUS
// =========================================

ordersContainer.addEventListener("change", async (event) => {

    if (!event.target.classList.contains("status-select")) {
        return;
    }

    const select = event.target;

    const orderId = select.dataset.orderId;
    const newStatus = select.value;

    try {

        const response = await fetch(
            `http://localhost:5000/api/orders/${orderId}/status`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error || "Failed to update status"
            );
        }

        alert(
            `Order #${orderId} status updated to ${newStatus} ✅`
        );

    } catch (error) {

        console.error(
            "Status update error:",
            error
        );

        alert(
            "Unable to update order status."
        );

    }

});
// =========================================
// ORDER FILTERS
// =========================================

const filterButtons =
    document.querySelectorAll(".filter-btn");


filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        // Remove active from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });


        // Add active to clicked button
        button.classList.add("active");


        const selectedStatus =
            button.dataset.status;


        // Show all orders
        if (selectedStatus === "All") {

            displayOrders(allOrders);

            return;

        }


        // Filter orders by status
        const filteredOrders =
            allOrders.filter(
                order =>
                    order.status === selectedStatus
            );


        displayOrders(filteredOrders);

    });

});
// =========================================
// SEARCH ORDERS
// =========================================

const orderSearch =
    document.getElementById("orderSearch");


if (orderSearch) {

    orderSearch.addEventListener(
        "input",
        () => {

            const searchText =
                orderSearch.value
                    .trim()
                    .toLowerCase();


            if (!searchText) {

                displayOrders(allOrders);

                return;

            }


            const filteredOrders =
                allOrders.filter(order => {

                    const orderId =
                        String(order.id).toLowerCase();

                    const customerName =
                        String(order.customer_name || "")
                            .toLowerCase();

                    const phone =
                        String(order.customer_phone || "")
                            .toLowerCase();


                    return (
                        orderId.includes(searchText) ||
                        customerName.includes(searchText) ||
                        phone.includes(searchText)
                    );

                });


            displayOrders(filteredOrders);

        }
    );

}