document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');

    // Zaladuj istniejace zadania
    function loadTasks() {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span contenteditable="true">${task.name}</span>
                        <button onclick="deleteTask(${task.id})">Delete</button>
                        <button onclick="updateTask(${task.id}, this.previousElementSibling.textContent)">Save</button>
                    `;
                    taskList.appendChild(li);
                });
            });
    }

    // Dodaj nowe zadanie
    addTaskBtn.addEventListener('click', () => {
        const name = newTaskInput.value.trim();
        if (name) {
            fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            }).then(loadTasks);
            newTaskInput.value = '';
        }
    });

    // Funkcje globalne (musza by� w window)
    window.deleteTask = (id) => {
        fetch(`/api/tasks/${id}`, { method: 'DELETE' }).then(loadTasks);
    };

    window.updateTask = (id, name) => {
        fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        }).then(loadTasks);
    };

    loadTasks();
});
