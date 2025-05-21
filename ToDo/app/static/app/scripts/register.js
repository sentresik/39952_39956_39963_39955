document.getElementById("registerBtn").addEventListener("click", function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    let errorMsg;
    errorMsg = document.getElementById("errorMsg");

    errorMsg.textContent = ""; // wyczysc komunikaty

    // WALIDACJA formularza
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

    if (
        password.length < 6 ||
        password.length > 20 ||
        !/[a-z]/.test(password) ||
        !/[A-Z]/.test(password) ||
        !/\d/.test(password)
    ) {
        errorMsg.textContent = "Password must be 6 to 20 characters long and include a lowercase letter, an uppercase letter, and a number.";
        return;
    }

    if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords are not the same.";
        return;
    }

    // Wyslanie danych do backendu
    fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, confirmPassword })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Registration successful! You can now log in.");
                window.location.href = "/start/";
            } else {
                errorMsg.textContent = data.message || "A registration error has occurred.";
            }
        })
        .catch(err => {
            console.error(err);
            errorMsg.textContent = "Server connection error.";
        });
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
