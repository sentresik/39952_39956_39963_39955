document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const logoutBtn = document.getElementById('logoutBtn');

    fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include" // Ważne dla ciasteczek
    })
        .then(res => {
            if (!res.ok) {
                if (res.status === 401) {
                    console.error("Unauthorized, redirecting to login");
                    window.location.href = "/start/";
                }
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then(tasks => {
            taskList.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                const taskSpan = document.createElement('span');
                taskSpan.textContent = task.title;
                li.appendChild(taskSpan);
                taskList.appendChild(li);
            });
        })
        .catch(err => {
            console.error('Failed to load tasks:', err);
            window.location.href = "/start/";
        });

    // Obsługa przycisku logout
    logoutBtn.addEventListener('click', () => {
        fetch('http://127.0.0.1:8000/api/logout/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include" // Ważne dla ciasteczek
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    console.log("Logout successful");
                    // Wyczyść ciasteczka po stronie klienta (na wszelki wypadek)
                    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    // Przekieruj na stronę logowania
                    window.location.href = '/start/';
                } else {
                    console.error("Logout failed:", data.message);
                }
            })
            .catch(err => {
                console.error('Failed to logout:', err);
                window.location.href = '/start/';
            });
    });
});