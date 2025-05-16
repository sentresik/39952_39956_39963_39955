console.log("App loaded");

// Funkcja do edytowania zadania
function editTask(taskSpan) {
    const currentText = taskSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';

    const parentLi = taskSpan.parentElement;

    // Usuwamy stary span i editBtn, zostawiamy li
    parentLi.innerHTML = ""; // czyscimy zawartosc li

    parentLi.appendChild(input);
    parentLi.appendChild(saveBtn);

    input.focus();

    function saveChanges() {
        const newSpan = document.createElement('span');
        newSpan.textContent = input.value;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
            editTask(newSpan);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            parentLi.remove();
        });

        parentLi.innerHTML = ""; // czyscimy z inputa i saveBtn
        parentLi.appendChild(newSpan);
        parentLi.appendChild(editBtn);
        parentLi.appendChild(deleteBtn);
    }

    // Opcja 1: klikniecie Save
    saveBtn.addEventListener('click', saveChanges);

    // Opcja 2: nacisniecie Enter
    input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            saveChanges();
        }
    });
}

// Funkcja dodawania nowego zadania
function addNewTask() {
    const taskInput = document.getElementById('newTaskInput');
    const taskText = taskInput.value.trim();

    if (taskText !== "") {
        const taskList = document.getElementById('taskList');
        const li = document.createElement('li');

        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', function () {
            editTask(taskSpan);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', function () {
            li.remove();
        });

        li.appendChild(taskSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);

        taskInput.value = ""; // wyczysc input
    }
}

// Po kliknieciu "Add Task"
document.getElementById('addTaskBtn').addEventListener('click', addNewTask);

// Po wcisnieciu Enter w polu input
document.getElementById('newTaskInput').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addNewTask();
    }
});
