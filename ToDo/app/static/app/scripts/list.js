document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');

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
});