document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('taskList');

    fetch('/api/tasks')
        .then(res => res.json())
        .then(tasks => {
            taskList.innerHTML = '';
            tasks.forEach(task => {
                const li = document.createElement('li');
                const taskSpan = document.createElement('span');
                taskSpan.textContent = task.name; // Pobierz nazwe z backendu
                li.appendChild(taskSpan);
                taskList.appendChild(li);
            });
        })
        .catch(err => console.error('Failed to load tasks:', err));
});
