document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const logoutBtn = document.getElementById('logoutBtn');

    // Zaladuj zadania
    fetch('http://127.0.0.1:8000/api/tasks/', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include" // Wazne dla ciasteczek
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

                // Checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', () => {
                    toggleCompleted(task.id, checkbox.checked);
                    li.classList.toggle('completed', checkbox.checked);
                });

                // Tytul
                const taskSpan = document.createElement('span');
                taskSpan.textContent = task.title;

                li.appendChild(checkbox);
                li.appendChild(taskSpan);

                if (task.completed) {
                    li.classList.add('completed');
                }

                taskList.appendChild(li);
            });
        })
        .catch(err => {
            console.error('Failed to load tasks:', err);
            window.location.href = "/start/";
        });

    // Obsluga przycisku logout
    logoutBtn.addEventListener('click', () => {
        fetch('http://127.0.0.1:8000/api/logout/', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include" // Wazne dla ciasteczek
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
                    // Wyczysc ciasteczka po stronie klienta (na wszelki wypadek)
                    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    // Przekieruj na strone logowania
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
    function toggleCompleted(taskId, completed) {
        fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ completed: completed })
        })
            .then(res => {
                if (!res.ok) throw new Error("Update failed");
                return res.json();
            })
            .then(() => {
                loadTasks(); //jesli masz funkcje do odswiezania
            })
            .catch(err => console.error("Update error:", err));
    }
});
