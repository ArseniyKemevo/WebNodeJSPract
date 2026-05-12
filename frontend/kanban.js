document.addEventListener('DOMContentLoaded', () => {
    let data = JSON.parse(localStorage.getItem('myExcursions')) || [];

    const addBtn = document.getElementById('add-btn');
    const lists = document.querySelectorAll('.list');

    function draw() {
        lists.forEach(l => l.innerHTML = '');
        let filter = document.getElementById('filter-lvl').value;
        let counters = { todo: 0, 'in-progress': 0, review: 0, done: 0 };

        data.forEach(task => {
            if (filter !== 'all' && task.lvl !== filter) return;
            counters[task.status]++;

            const el = document.createElement('div');
            el.className = `item ${task.lvl}`;
            el.draggable = true;
            el.dataset.id = task.id;
            el.innerHTML = `
                <p>${task.txt}</p>
                <div class="item-btns">
                    <button onclick="editItem('${task.id}')">Ред.</button>
                    <button onclick="deleteItem('${task.id}')">Х</button>
                </div>
            `;
            
            el.addEventListener('dragstart', () => {
                el.classList.add('hold');
                localStorage.setItem('dragId', task.id);
            });
            el.addEventListener('dragend', () => el.classList.remove('hold'));

            document.getElementById(task.status).appendChild(el);
        });

        document.getElementById('num-todo').innerText = counters.todo;
        document.getElementById('num-work').innerText = counters['in-progress'];
        document.getElementById('num-test').innerText = counters.review;
        document.getElementById('num-done').innerText = counters.done;
        document.getElementById('total-val').innerText = data.length;
    }

    function save() {
        localStorage.setItem('myExcursions', JSON.stringify(data));
        draw();
    }

    addBtn.onclick = () => {
        const txt = document.getElementById('task-text').value;
        const lvl = document.getElementById('task-lvl').value;
        if (!txt) return alert('Введите текст!');

        data.push({ id: Date.now().toString(), txt, lvl, status: 'todo' });
        document.getElementById('task-text').value = '';
        save();
        notify('Задача добавлена');
    };

    lists.forEach(list => {
        list.ondragover = (e) => {
            e.preventDefault();
            list.classList.add('over');
        };
        list.ondragleave = () => list.classList.remove('over');
        list.ondrop = () => {
            list.classList.remove('over');
            const id = localStorage.getItem('dragId');
            const task = data.find(t => t.id === id);
            if (task) {
                task.status = list.id;
                save();
            }
        };
    });

    window.deleteItem = (id) => {
        data = data.filter(t => t.id !== id);
        save();
        notify('Удалено');
    };

    window.editItem = (id) => {
        const task = data.find(t => t.id === id);
        const newTxt = prompt('Новый текст:', task.txt);
        if (newTxt) {
            task.txt = newTxt;
            save();
        }
    };

    function notify(text) {
        const box = document.getElementById('msg-box');
        const m = document.createElement('div');
        m.className = 'msg';
        m.innerText = text;
        box.appendChild(m);
        setTimeout(() => m.remove(), 2000);
    }

    document.getElementById('filter-lvl').onchange = draw;
    draw();
});