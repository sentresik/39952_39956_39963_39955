document.getElementById("loginBtn").addEventListener("click", function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const errorMsg = document.getElementById("errorMsg");

    // Reset komunikatu
    errorMsg.textContent = "";

    // WALIDACJA frontendowa
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

    // Wyslanie danych do backendu (przykladowy endpoint)
    fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Mozesz zapisac token itp.
                window.location.href = "index.html"; // przekierowanie do aplikacji
            } else {
                errorMsg.textContent = data.message || "Invalid email or password.";
            }
        })
        .catch(err => {
            console.error(err);
            errorMsg.textContent = "Login error occurred.";
        });
});

function validateEmail(email) {
    // Prosty regex do walidacji adresu e-mail
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
