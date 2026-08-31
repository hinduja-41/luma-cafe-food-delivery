/* =========================================
   LUMA CAFÉ
   INTERACTIVE RESTAURANT WEBSITE
========================================= */


/* =========================================
   BACKEND API
========================================= */

const API_URL = "https://lluma-cafe-backend.onrender.com/api/menu";


/* =========================================
   MENU DATA
   This will now come from the backend.
========================================= */

let menuItems = [];


/* =========================================
   VARIABLES
========================================= */

let currentCategory = "all";

let searchTerm = "";

let cart = [];

let selectedFood = null;


/* =========================================
   DOM ELEMENTS
========================================= */

const menuGrid = document.getElementById("menuGrid");

const categoryList = document.getElementById("categoryList");

const searchInput = document.getElementById("searchInput");

const emptyState = document.getElementById("emptyState");

const cartBtn = document.getElementById("cartBtn");

const cartPanel = document.getElementById("cartPanel");

const closeCart = document.getElementById("closeCart");

const cartOverlay = document.getElementById("cartOverlay");

const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");

const cartTotal = document.getElementById("cartTotal");

const toast = document.getElementById("toast");

const toastText = document.getElementById("toastText");

const foodModal = document.getElementById("foodModal");

const modalOverlay = document.getElementById("modalOverlay");

const modalClose = document.getElementById("modalClose");

const themeBtn = document.getElementById("themeBtn");

const menuToggle = document.getElementById("menuToggle");

const nav = document.getElementById("nav");


/* =========================================
   LOAD MENU FROM BACKEND
========================================= */

async function loadMenu() {

    try {

        menuGrid.innerHTML = `
            <div class="menu-loading">
                <div class="loading-spinner"></div>
                <p>Loading our delicious menu...</p>
            </div>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch menu");
        }

        menuItems = await response.json();

        console.log("Menu loaded from backend:", menuItems);

        displayMenu();

    } catch (error) {

        console.error("Backend connection error:", error);

        menuGrid.innerHTML = `
            <div class="menu-error">
                <div style="font-size: 40px;">⚠️</div>
                <h3>Unable to load menu</h3>
                <p>
                    Please make sure the Luma Café backend
                    server is running.
                </p>
                <button onclick="loadMenu()">
                    Try Again
                </button>
            </div>
        `;

    }

}


/* =========================================
   DISPLAY MENU
========================================= */

function displayMenu() {

    const filteredItems = menuItems.filter(item => {

        const categoryMatch =
            currentCategory === "all" ||
            item.category === currentCategory;

        const searchMatch =
            item.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||

            item.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        return categoryMatch && searchMatch;

    });


    menuGrid.innerHTML = "";


    if (filteredItems.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filteredItems.forEach(item => {

        const card = document.createElement("article");

        card.className = "menu-card reveal visible";


        card.innerHTML = `

            <div class="food-image">

                <img
                    src="${item.image}"
                    alt="${item.name}"
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85'"
                >

                <span class="food-tag">
                    ${item.tag}
                </span>


                <button
                    class="favorite"
                    onclick="toggleFavorite(this)"
                    aria-label="Favourite"
                >
                    ♡
                </button>

            </div>


            <div class="food-info">

                <span class="food-category">
                    ${item.category}
                </span>


                <h3 class="food-title">
                    ${item.name}
                </h3>


                <p class="food-description">
                    ${item.description}
                </p>


                <div class="food-bottom">

                    <strong class="food-price">
                        ₹${item.price}
                    </strong>


                    <div class="food-actions">

                        <button
                            class="view-btn"
                            onclick="openFoodModal(${item.id})"
                        >
                            View
                        </button>


                        <button
                            class="add-btn"
                            onclick="addToCart(${item.id})"
                        >
                            + Add
                        </button>

                    </div>

                </div>

            </div>

        `;


        menuGrid.appendChild(card);

    });

}


/* =========================================
   CATEGORY FILTER
========================================= */

categoryList.addEventListener("click", function(e) {

    const button = e.target.closest(".category");

    if (!button) return;


    document
        .querySelectorAll(".category")
        .forEach(btn => {

            btn.classList.remove("active");

        });


    button.classList.add("active");


    currentCategory = button.dataset.category;


    displayMenu();

});


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener("input", function() {

    searchTerm = this.value;

    displayMenu();

});


/* =========================================
   CART
========================================= */

function addToCart(id) {

    const item = menuItems.find(food => food.id === id);


    if (!item) {

        console.error("Food item not found:", id);

        return;

    }


    const existing = cart.find(food => food.id === id);


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            ...item,

            quantity: 1

        });

    }


    updateCart();

    showToast(item.name);

}


/* =========================================
   UPDATE CART
========================================= */

function updateCart() {

    cartItems.innerHTML = "";


    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="cart-empty">

                <div>🛍️</div>

                <h4>Your cart is empty</h4>

                <p>Add something delicious.</p>

            </div>

        `;

    }


    let total = 0;

    let count = 0;


    cart.forEach(item => {

        total += item.price * item.quantity;

        count += item.quantity;


        const element = document.createElement("div");

        element.className = "cart-item";


        element.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >


            <div>

                <h4>
                    ${item.name}
                </h4>

                <p>
                    ₹${item.price}
                </p>


                <div class="quantity">

                    <button
                        onclick="changeQuantity(${item.id}, -1)"
                    >
                        −
                    </button>


                    <span>
                        ${item.quantity}
                    </span>


                    <button
                        onclick="changeQuantity(${item.id}, 1)"
                    >
                        +
                    </button>

                </div>

            </div>


            <strong>
                ₹${item.price * item.quantity}
            </strong>

        `;


        cartItems.appendChild(element);

    });


    cartCount.textContent = count;

    cartTotal.textContent = `₹${total}`;

}


/* =========================================
   CHANGE QUANTITY
========================================= */

function changeQuantity(id, amount) {

    const item = cart.find(food => food.id === id);

    if (!item) return;


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart = cart.filter(food => food.id !== id);

    }


    updateCart();

}


/* =========================================
   OPEN CART
========================================= */

cartBtn.addEventListener("click", () => {

    cartPanel.classList.add("open");

    cartOverlay.classList.add("show");

});


closeCart.addEventListener("click", closeCartPanel);

cartOverlay.addEventListener("click", closeCartPanel);


function closeCartPanel() {

    cartPanel.classList.remove("open");

    cartOverlay.classList.remove("show");

}


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(name) {

    toastText.textContent =
        `${name} added successfully.`;


    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}


/* =========================================
   FOOD MODAL
========================================= */

function openFoodModal(id) {

    const item =
        menuItems.find(food => food.id === id);


    if (!item) return;


    selectedFood = item;


    document.getElementById("modalImage").src =
        item.image;


    document.getElementById("modalImage").alt =
        item.name;


    document.getElementById("modalCategory").textContent =
        item.category;


    document.getElementById("modalTitle").textContent =
        item.name;


    document.getElementById("modalDescription").textContent =
        item.description;


    document.getElementById("modalPrice").textContent =
        `₹${item.price}`;


    foodModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeFoodModal() {

    foodModal.classList.remove("show");

    document.body.style.overflow = "";

}


modalClose.addEventListener(
    "click",
    closeFoodModal
);


modalOverlay.addEventListener(
    "click",
    closeFoodModal
);


document
    .getElementById("modalAdd")
    .addEventListener("click", () => {

        if (!selectedFood) return;


        addToCart(selectedFood.id);

        closeFoodModal();

    });


/* =========================================
   FAVOURITE
========================================= */

function toggleFavorite(button) {

    button.classList.toggle("active");


    button.textContent =
        button.classList.contains("active")
            ? "♥"
            : "♡";

}


/* =========================================
   DARK MODE
========================================= */

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");


    if (document.body.classList.contains("dark")) {

        themeBtn.textContent = "☀";

    } else {

        themeBtn.textContent = "☾";

    }

});


/* =========================================
   MOBILE MENU
========================================= */

menuToggle.addEventListener("click", () => {

    nav.classList.toggle("open");

});


document
    .querySelectorAll(".nav-link")
    .forEach(link => {

        link.addEventListener("click", () => {

            nav.classList.remove("open");

        });

    });


/* =========================================
   HEADER SCROLL
========================================= */

window.addEventListener("scroll", () => {

    const header =
        document.getElementById("header");


    if (window.scrollY > 50) {

        header.classList.add("scrolled");

    } else {

        header.classList.remove("scrolled");

    }

});


/* =========================================
   SCROLL REVEAL
========================================= */

const observer =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },

        {
            threshold: .12
        }

    );


document
    .querySelectorAll(".reveal")
    .forEach(element => {

        observer.observe(element);

    });


/* =========================================
   NAV ACTIVE STATE
========================================= */

const sections =
    document.querySelectorAll("section[id]");


window.addEventListener("scroll", () => {

    let current = "";


    sections.forEach(section => {

        const sectionTop =
            section.offsetTop - 150;


        if (window.scrollY >= sectionTop) {

            current =
                section.getAttribute("id");

        }

    });


    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.classList.remove("active");


            if (
                link.getAttribute("href")
                === `#${current}`
            ) {

                link.classList.add("active");

            }

        });

});


/* =========================================
   CHECKOUT
========================================= */

// =========================================
// CHECKOUT
// =========================================

const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutModal = document.getElementById("checkoutModal");

const checkoutOverlay = document.getElementById("checkoutOverlay");

const checkoutClose = document.getElementById("checkoutClose");

const checkoutForm = document.getElementById("checkoutForm");

const checkoutTotal = document.getElementById("checkoutTotal");


// Open checkout modal
checkoutBtn.addEventListener("click", () => {

    if (cart.length === 0) {

        showToast("Your cart is empty");

        return;

    }


    // Calculate current cart total
    const total = cart.reduce((sum, item) => {

        return sum + (item.price * item.quantity);

    }, 0);


    // Show current cart total
    checkoutTotal.textContent = `₹${total}`;

    checkoutModal.classList.add("active");

});


// Close checkout modal
checkoutClose.addEventListener("click", () => {

    checkoutModal.classList.remove("active");

});


// Close when clicking outside the modal
checkoutOverlay.addEventListener("click", () => {

    checkoutModal.classList.remove("active");

});


// =========================================
// PLACE ORDER
// =========================================

checkoutForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const customerName =
        document.getElementById("customerName").value.trim();


    const customerPhone =
        document.getElementById("customerPhone").value.trim();


    const customerAddress =
        document.getElementById("customerAddress").value.trim();


    if (
        !customerName ||
        !customerPhone ||
        !customerAddress
    ) {

        showToast("Please fill in all details");

        return;

    }


    // Calculate cart total again for the order
    const total = cart.reduce((sum, item) => {

        return sum + (item.price * item.quantity);

    }, 0);
    const customerId =
    localStorage.getItem("customerId");

if (!customerId) {

    showToast("Please login before placing an order");

    return;
}


    const orderData = {
         customer_id: Number(customerId),

        customer_name: customerName,

        customer_phone: customerPhone,

        customer_address: customerAddress,

        items: cart,

        total_amount: total

    };


    const submitButton =
        checkoutForm.querySelector(".checkout-submit");


    submitButton.disabled = true;

    submitButton.textContent = "Placing Order...";


    try {

        const response = await fetch(
            "https://lluma-cafe-backend.onrender.com/api/orders",
            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(orderData)

            }
        );


        const result = await response.json();


        if (!response.ok) {

            throw new Error(
                result.error || "Failed to place order"
            );

        }


        // Success

        // Show order confirmation
        document.getElementById("successOrderId").textContent =
            `#${result.orderId}`;


        document.getElementById("successOrderTotal").textContent =
            `₹${total}`;


        checkoutModal.classList.remove("active");


        document
            .getElementById("orderSuccessModal")
            .classList.add("active");


        startOrderStatusTracking(result.orderId);


        // Show current order status
        // Get current order status from MySQL
        const successStatus =
            document.getElementById("successOrderStatus");


        if (successStatus) {

            try {

                const statusResponse = await fetch(
                    `https://lluma-cafe-backend.onrender.com/api/orders/${result.orderId}`
                );


                const order =
                    await statusResponse.json();


                if (statusResponse.ok) {

                    successStatus.textContent =
                        order.status || "Pending";

                }

            } catch (error) {

                console.error(
                    "Unable to fetch order status:",
                    error
                );


                successStatus.textContent = "Pending";

            }

        }


        // Clear cart
        cart = [];

        updateCart();


        // Reset form
        checkoutForm.reset();


        // Close checkout modal
        checkoutModal.classList.remove("active");


        // Close cart panel
        closeCartPanel();

    } catch (error) {

        console.error("Order error:", error);

        alert(
            "Unable to place your order. Please try again."
        );

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Place Order →";

    }

});
   


// =========================================
// ORDER SUCCESS - CONTINUE SHOPPING
// =========================================

const successContinue =
    document.getElementById("successContinue");

const orderSuccessModal =
    document.getElementById("orderSuccessModal");


successContinue.addEventListener("click", () => {

    orderSuccessModal.classList.remove("active");

});


// =========================================
// AUTO UPDATE ORDER STATUS
// =========================================

let statusInterval = null;


function startOrderStatusTracking(orderId) {

    // Check every 5 seconds
    statusInterval = setInterval(async () => {

        try {

            const response = await fetch(
                `https://lluma-cafe-backend.onrender.com/api/orders/${orderId}`
            );


            if (!response.ok) {

                return;

            }


            const order =
                await response.json();


            const successStatus =
                document.getElementById(
                    "successOrderStatus"
                );


            if (successStatus) {

                successStatus.textContent =
                    order.status || "Pending";

            }


            // Stop checking once delivered
            if (order.status === "Delivered") {

                clearInterval(statusInterval);

                statusInterval = null;

            }


        } catch (error) {

            console.error(
                "Status tracking error:",
                error
            );

        }

    }, 5000);

}


/* =========================================
   SCROLL TO MENU
========================================= */

function scrollToMenu() {

    document
        .getElementById("menu")
        .scrollIntoView({

            behavior: "smooth"

        });

}


/* =========================================
   INITIALIZE
========================================= */

loadMenu();

updateCart();


// =========================================
// MY ORDERS
// =========================================

function getOrderItemsHTML(items) {

    try {

        const parsedItems =
            typeof items === "string"
                ? JSON.parse(items)
                : items;


        return parsedItems.map(item => `

            <div class="order-item">

                <span>
                    ${item.name}
                </span>


                <span>
                    × ${item.quantity}
                </span>

            </div>

        `).join("");


    } catch (error) {

        console.error(
            "Error reading order items:",
            error
        );


        return "<p>Unable to display items.</p>";

    }

}


// =========================================
// LOAD MY ORDERS
// =========================================

async function loadMyOrders() {

    const ordersList =
        document.getElementById("ordersList");


    // =========================================
    // GET LOGGED-IN CUSTOMER ID
    // =========================================

    const customerId =
        localStorage.getItem("customerId");


    // If customer is not logged in
    if (!customerId) {

        ordersList.innerHTML =
            "<p>Please login to view your orders.</p>";

        return;

    }


    try {

        // =========================================
        // GET ORDERS USING CUSTOMER ID
        // =========================================

        const response = await fetch(
            `https://lluma-cafe-backend.onrender.com/api/orders/customer/${customerId}`
        );


        if (!response.ok) {

            throw new Error(
                "Failed to load orders"
            );

        }


        const orders =
            await response.json();


        // =========================================
        // NO ORDERS
        // =========================================

        if (orders.length === 0) {

            ordersList.innerHTML =
                "<p>No orders found.</p>";

            return;

        }


        // Clear previous orders
        ordersList.innerHTML = "";


        // =========================================
        // DISPLAY ORDERS
        // =========================================

        orders.forEach(order => {

            const orderCard =
                document.createElement("div");


            orderCard.className =
                "order-card";


            // =========================================
            // CANCEL BUTTON
            // Only show while order is Pending
            // =========================================

            const cancelButton =
                order.status === "Pending"
                    ? `
                        <button
                            class="cancel-order-btn"
                            data-order-id="${order.id}">
                            Cancel Order
                        </button>
                      `
                    : "";


            // =========================================
            // ORDER CARD
            // =========================================

            orderCard.innerHTML = `

                <h3>Order #${order.id}</h3>


                <div class="order-items">

                    <strong>Items:</strong>


                    <div class="order-items-list">

                        ${getOrderItemsHTML(order.items)}

                    </div>

                </div>


                <p>

                    <strong>Total:</strong>

                    ₹${order.total_amount}

                </p>


                <p>

                    <strong>Status:</strong>


                    <span class="order-status status-${order.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}">

                        ${order.status}

                    </span>

                </p>


                ${cancelButton}

            `;


            // =========================================
            // CANCEL ORDER BUTTON
            // =========================================

            const cancelBtn =
                orderCard.querySelector(
                    ".cancel-order-btn"
                );


            if (cancelBtn) {

                cancelBtn.addEventListener(
                    "click",
                    async () => {

                        const confirmCancel =
                            confirm(
                                "Are you sure you want to cancel this order?"
                            );


                        if (!confirmCancel) {

                            return;

                        }


                        try {

                            const response =
                                await fetch(
                                    `https://lluma-cafe-backend.onrender.com/api/orders/${order.id}/cancel`,
                                    {
                                        method: "PUT"
                                    }
                                );


                            const data =
                                await response.json();


                            if (!response.ok) {

                                alert(
                                    data.error ||
                                    "Unable to cancel order"
                                );

                                return;

                            }


                            alert(
                                "Order cancelled successfully! ✅"
                            );


                            // Reload orders so the
                            // Cancel button disappears
                            loadMyOrders();


                        } catch (error) {

                            console.error(
                                "Cancel order error:",
                                error
                            );


                            alert(
                                "Unable to cancel order"
                            );

                        }

                    }
                );

            }


            // Add order card to page
            ordersList.appendChild(orderCard);

        });


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        ordersList.innerHTML =
            "<p>Unable to load your orders.</p>";

    }

}


// =========================================
// MY ORDERS BUTTON
// =========================================

const myOrdersBtn =
    document.getElementById("myOrdersBtn");


if (myOrdersBtn) {

    myOrdersBtn.addEventListener(
        "click",
        () => {

            loadMyOrders();

        }
    );

}


// =========================================
// AUTO REFRESH MY ORDERS
// =========================================

setInterval(() => {

    const ordersSection =
        document.getElementById("myOrders");


    if (

        ordersSection &&

        ordersSection.getBoundingClientRect().top <
        window.innerHeight &&

        ordersSection.getBoundingClientRect().bottom > 0

    ) {

        loadMyOrders();

    }

}, 5000);
// =========================================
// LOGIN / LOGOUT / CUSTOMER STATE
// =========================================

const loginBtn =
    document.getElementById("loginBtn");

const customerWelcome =
    document.getElementById("customerWelcome");

const logoutBtn =
    document.getElementById("logoutBtn");


// =========================================
// CHECK LOGIN STATUS
// =========================================

function updateCustomerState() {

    const customerId =
        localStorage.getItem("customerId");

    const customerName =
        localStorage.getItem("customerName");


    // =========================================
    // LOGGED IN
    // =========================================

    if (customerId) {

        // Hide Login
        if (loginBtn) {
            loginBtn.style.display = "none";
        }


        // Show My Orders
        if (myOrdersBtn) {
            myOrdersBtn.style.display = "";
        }


        // Show customer name
        if (customerWelcome) {

            customerWelcome.style.display = "";

            customerWelcome.textContent =
                `👋 ${customerName || "Customer"}`;

        }


        // Show Logout
        if (logoutBtn) {
            logoutBtn.style.display = "";
        }

    }


    // =========================================
    // NOT LOGGED IN
    // =========================================

    else {

        // Show Login
        if (loginBtn) {
            loginBtn.style.display = "";
        }


        // Hide My Orders
        if (myOrdersBtn) {
            myOrdersBtn.style.display = "none";
        }


        // Hide customer name
        if (customerWelcome) {
            customerWelcome.style.display = "none";
        }


        // Hide Logout
        if (logoutBtn) {
            logoutBtn.style.display = "none";
        }

    }

}


// =========================================
// LOGOUT
// =========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem("customerId");
            localStorage.removeItem("customerName");
            localStorage.removeItem("customerEmail");
            localStorage.removeItem("customerPhone");


            alert(
                "You have been logged out successfully! 👋"
            );


            window.location.href =
                "login.html";

        }
    );

}


// =========================================
// INITIAL CUSTOMER STATE
// =========================================

updateCustomerState();