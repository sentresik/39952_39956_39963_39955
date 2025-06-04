// app/static/app/scripts/login.js
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.getElementById("loginBtn").addEventListener("click", function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    errorMsg.textContent = "";

    if (!email) {
        errorMsg.textContent = "Please enter your email address.";
        return;
    }

    if (!validateEmail(email)) {
        errorMsg.textContent = "Please enter a valid email address.";
        return;
    }

    if (!password) {
        errorMsg.textContent = "Please enter your password.";
        return;
    }

    fetch("/api/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        credentials: "include"
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            console.log("Response from API:", data);
            if (data.success) {
                window.location.href = "/index/"; // Przekierowanie
            } else {
                errorMsg.textContent = data.message || "Invalid email or password.";
            }
        })
        .catch(err => {
            console.error("Fetch error:", err);
            errorMsg.textContent = "Login error occurred.";
        });
});