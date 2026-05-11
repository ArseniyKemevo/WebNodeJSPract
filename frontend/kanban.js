document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('todo')) return;

    const user = getCurrentUser();
    if (user && user.role !== 'admin') {
        const area = document.getElementById('notification-area');
        area.innerHTML = '<div class="notification" style="opacity: 1; background: #ff4d4d;">Внимание: Вы вошли не как Администратор.</div>';
    }

    let tasks = JSON.parse(localStorage.getItem('excursionKanbanTasks')) || [];

    const form = document.getElementById('add-task-form');
    const input = document.getElementById('task-input');
    const prioritySelect = document.getElementById('task-priority');
    const filterSelect = document.getElementById('filter-priority');
    const lists = document.querySelectorAll('.task-list');

    renderTasks();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now().toString(),
            text: input.value,
            priority: prioritySelect.value,
            status: 'todo'
        };
        tasks.push(newTask);
        saveAndRender();
        input.value = '';
        showNotification('Заявка успешно создана!');
    });

    filterSelect.addEventListener('change', renderTasks);

    function saveAndRender() {
        localStorage.setItem('excursionKanbanTasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        lists.forEach(list => list.innerHTML = '');
        let filterValue = filterSelect.value;
        let counts = { todo: 0, 'in-progress': 0, review: 0, done: 0 };

        tasks.forEach(task => {
            if (filterValue !== 'all' && task.priority !== filterValue) return;

            counts[task.status]++;
            const taskEl = document.createElement('div');
            taskEl.className = `task priority-${task.priority}`;
            taskEl.draggable = true;
            taskEl.dataset.id = task.id;
            taskEl.innerHTML = `
                <p><strong>${task.text}</strong></p>
                <div class="task-actions">
                    <button class="btn-edit" onclick="editTask('${task.id}')">Изменить</button>
                    <button class="btn-delete" onclick="deleteTask('${task.id}')">Удалить</button>
                </div>
            `;
            
            taskEl.addEventListener('dragstart', handleDragStart);
            taskEl.addEventListener('dragend', handleDragEnd);

            const targetCol = document.getElementById(task.status);
            if (targetCol) targetCol.appendChild(taskEl);
        });

        document.getElementById('total-tasks').innerText = tasks.length;
        document.getElementById('count-todo').innerText = counts.todo;
        document.getElementById('count-in-progress').innerText = counts['in-progress'];
        document.getElementById('count-review').innerText = counts.review;
        document.getElementById('count-done').innerText = counts.done;
    }

    let draggedTask = null;

    function handleDragStart(e) {
        draggedTask = this;
        setTimeout(() => this.classList.add('dragging'), 0);
    }

    function handleDragEnd() {
        this.classList.remove('dragging');
        draggedTask = null;
    }

    lists.forEach(list => {
        list.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });

        list.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });

        list.addEventListener('drop', function() {
            this.classList.remove('drag-over');
            if (draggedTask) {
                const taskId = draggedTask.dataset.id;
                const newStatus = this.id;
                
                const taskIndex = tasks.findIndex(t => t.id === taskId);
                if (taskIndex > -1) {
                    tasks[taskIndex].status = newStatus;
                    saveAndRender();
                    showNotification(`Перенесено в "${getColName(newStatus)}"`);
                }
            }
        });
    });

    window.deleteTask = function(id) {
        if (confirm('Точно удалить эту экскурсию?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveAndRender();
            showNotification('Удалено');
        }
    }

    window.editTask = function(id) {
        const task = tasks.find(t => t.id === id);
        const newText = prompt('Изменить детали:', task.text);
        if (newText && newText.trim() !== '') {
            task.text = newText;
            saveAndRender();
            showNotification('Сохранено');
        }
    }

    function showNotification(message) {
        const area = document.getElementById('notification-area');
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerText = message;
        area.appendChild(notif);

        setTimeout(() => notif.style.opacity = '1', 10);
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    }

    function getColName(id) {
        const names = { 'todo': 'Заявки', 'in-progress': 'Подготовка', 'review': 'В процессе', 'done': 'Завершены' };
        return names[id] || id;
    }
});