// codigo modificado para agregar lista de tasks completados, y para ordenar por fecha y prioridad


document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    document.getElementById('addTaskButton').addEventListener('click', addTask);
});

const taskInput = document.getElementById('taskInput');
const priorityInput = document.getElementById('priorityInput');
const taskList = document.getElementById('taskList');
const completedList = document.getElementById('completedList');

function loadTasksFromStorage() {
    const tasks = getTasksFromLocalStorage('tasks') || [];
    const completedTasks = getTasksFromLocalStorage('completedTasks') || [];

    tasks.forEach(task => addTaskToDOM(task, false));
    completedTasks.forEach(task => addTaskToDOM(task, true));
}

function addTask() {
    const taskText = taskInput.value.trim();
    const priority = priorityInput.value;

    if (taskText === '') {
        Swal.fire('Por favor, ingresa una tarea.');
        return;
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        fechaCreacion: new Date().toLocaleString(),
        prioridad: priority
    };

    addTaskToDOM(task, false);
    saveTaskToStorage(task, 'tasks');

    taskInput.value = '';
    priorityInput.value = 'Media';
}

function addTaskToDOM(task, isCompleted) {
    const li = document.createElement('li');
    li.textContent = `${task.text} (Prioridad: ${task.prioridad}, Creado: ${task.fechaCreacion})`;
    li.setAttribute('data-id', task.id);
    li.classList.toggle('completed', task.completed);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => deleteTask(task.id, isCompleted));

    const toggleButton = document.createElement('button');
    toggleButton.textContent = isCompleted ? 'Restaurar' : 'Completar';
    toggleButton.classList.add('toggle-button');
    toggleButton.addEventListener('click', () => toggleTaskCompletion(task.id, isCompleted));

    li.appendChild(toggleButton);
    li.appendChild(deleteButton);

    if (isCompleted) {
        completedList.appendChild(li);
    } else {
        taskList.appendChild(li);
    }
}

function saveTaskToStorage(task, key) {
    const tasks = getTasksFromLocalStorage(key) || [];
    tasks.push(task);
    localStorage.setItem(key, JSON.stringify(tasks));
}

function getTasksFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}

function deleteTask(taskId, isCompleted) {
    const key = isCompleted ? 'completedTasks' : 'tasks';
    let tasks = getTasksFromLocalStorage(key);
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem(key, JSON.stringify(tasks));
    document.querySelector(`[data-id="${taskId}"]`).remove();
}

function toggleTaskCompletion(taskId, isCompleted) {
    const sourceKey = isCompleted ? 'completedTasks' : 'tasks';
    const targetKey = isCompleted ? 'tasks' : 'completedTasks';

    let tasks = getTasksFromLocalStorage(sourceKey);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const [task] = tasks.splice(taskIndex, 1);
    task.completed = !task.completed;
    saveTaskToStorage(task, targetKey);

    localStorage.setItem(sourceKey, JSON.stringify(tasks));
    document.querySelector(`[data-id="${taskId}"]`).remove();
    addTaskToDOM(task, !isCompleted);
}

function sortTasks(criteria) {
    const tasks = getTasksFromLocalStorage('tasks') || [];
    tasks.sort((a, b) => {
        if (criteria === 'prioridad') {
            const prioridades = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
            return prioridades[a.prioridad] - prioridades[b.prioridad];
        } else if (criteria === 'fecha') {
            return new Date(a.fechaCreacion) - new Date(b.fechaCreacion);
        }
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    taskList.innerHTML = '';
    tasks.forEach(task => addTaskToDOM(task, false));
}
