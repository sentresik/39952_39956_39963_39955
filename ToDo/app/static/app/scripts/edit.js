document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');

    // Zaladuj istniejace zadania
    function loadTasks() {
        fetch('http://127.0.0.1:8000/api/tasks/')
            .then(res => res.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    // Użyj task.title zamiast task.name
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span contenteditable="true">${task.title}</span>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                        <button onclick="updateTask(${task.id}, this.previousElementSibling.textContent)">Save</button>
                    `;
                    taskList.appendChild(li);
                });
            });
    }

    // Dodaj nowe zadanie
    addTaskBtn.addEventListener('click', () => {
        const title = newTaskInput.value.trim();
        if (title) {
            fetch('http://127.0.0.1:8000/api/tasks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title })
            }).then(loadTasks);
            newTaskInput.value = '';
        }
    });

    // Funkcje globalne (musza byc w window)
    window.deleteTask = (id) => {
        fetch(`http://127.0.0.1:8000/api/tasks/${id}`, { method: 'DELETE' }).then(loadTasks);
    };

    window.updateTask = (id, title) => {
        fetch(`http://127.0.0.1:8000/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        }).then(loadTasks);
    };

    loadTasks();
});