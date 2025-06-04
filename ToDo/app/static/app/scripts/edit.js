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
                    // Uzyj task.title zamiast task.name
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span contenteditable="true" class="editable">${task.title}</span>
                        <button class="deleteBtn">Delete</button>
                        <button class="saveBtn">Save</button>
                    `;

                    const span = li.querySelector('.editable');
                    const deleteBtn = li.querySelector('.deleteBtn');
                    const saveBtn = li.querySelector('.saveBtn');

                    // Obsluga usuwania
                    deleteBtn.addEventListener('click', () => deleteTask(task.id));

                    // Obsluga zapisywania edycji
                    saveBtn.addEventListener('click', () => updateTask(task.id, span.textContent));

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
        fetch(`http://127.0.0.1:8000/api/tasks/${id}/`, {

            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        }).then(() => {
            loadTasks();
            showNotification("Task updated successfully!");
        });
    };

    loadTasks();
});

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}