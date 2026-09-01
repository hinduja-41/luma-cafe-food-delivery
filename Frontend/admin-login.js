// =========================================
// ADMIN LOGIN
// =========================================

const adminLoginForm =
    document.getElementById("adminLoginForm");

const adminLoginMessage =
    document.getElementById("adminLoginMessage");


adminLoginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document.getElementById("adminEmail").value.trim();

        const password =
            document.getElementById("adminPassword").value;


        adminLoginMessage.textContent =
            "Logging in...";


        try {

            const response = await fetch(
                "https://luma-cafe-backend.onrender.com/api/admin/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                adminLoginMessage.textContent =
                    data.error || "Invalid admin login.";

                return;

            }


            // =========================================
            // LOGIN SUCCESS
            // =========================================

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );


            localStorage.setItem(
                "adminName",
                data.admin.name
            );


            alert("Admin login successful! ✅");


            window.location.href =
                "admin.html";


        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            adminLoginMessage.textContent =
                "Unable to connect to server.";

        }

    }
);