const API_URL = 'http://localhost:3000/api';

async function registerUser(event) {
  event.preventDefault();

  const full_name = document.getElementById('full_name').value;
  const email = document.getElementById('email').value;
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name, email, login, password, role })
    });

    const data = await response.json();

    document.getElementById('message').textContent = 
      data.message || data.error || 'Ошибка регистрации';

    if (response.ok && data.message === 'Регистрация успешна') {
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1000);
    }
  } catch (error) {
    console.error('Ошибка подключения к серверу:', error);
    document.getElementById('message').textContent = 'Сервер недоступен. Проверь, запущен ли backend.';
  }
}

async function loginUser(event) {
    event.preventDefault();

    const login = document.getElementById('login').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            
            document.getElementById('message').textContent = `Добро пожаловать, ${data.user.full_name} (${data.user.role})`;
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            document.getElementById('message').textContent = data.message || data.error || 'Ошибка входа';
        }
    } catch (error) {
        console.error('Ошибка подключения к серверу:', error);
        document.getElementById('message').textContent = 'Сервер недоступен. Проверь, запущен ли backend.';
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        alert('Сначала войдите в аккаунт.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function showUserInfo() {
    const userBlock = document.getElementById('user-info');
    if (!userBlock) return;

    const user = getCurrentUser();

    if (user) {
        userBlock.innerHTML = `
            <p><strong>Пользователь:</strong> ${user.full_name}</p>
            <p><strong>Роль:</strong> ${user.role}</p>
            <button onclick="logout()">Выйти</button>
        `;
    } else {
        userBlock.innerHTML = `
            <p>Вы не вошли в систему</p>
            <a href="login.html" style="color: #ffffff; text-decoration: underline;">Войти</a>
        `;
    }
}

async function loadLocations() {
    if (!requireAuth()) return; 

    try {
        // Обращаемся к правильному роуту бэкенда
        const response = await fetch(`${API_URL}/data/locations`);
        const result = await response.json();

        const container = document.getElementById('locations-list');
        if (!container) return;
        container.innerHTML = '';

        if (result.data && result.data.length > 0) {
            result.data.forEach((loc) => {
                container.innerHTML += `
                    <div class="card">
                        <h3>${loc.title}</h3>
                        <p><strong>Описание:</strong> ${loc.description || 'Нет описания'}</p>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<p>Локаций пока нет.</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки локаций:', error);
        const container = document.getElementById('locations-list');
        if (container) container.innerHTML = '<p>Не удалось загрузить локации.</p>';
    }
}

async function loadExcursions() {
    if (!requireAuth()) return;

    try {
        const response = await fetch(`${API_URL}/data/excursions`);
        const result = await response.json();

        const container = document.getElementById('excursions-list');
        if (!container) return;
        container.innerHTML = '';

        if (result.excursions && result.excursions.length > 0) {
            result.excursions.forEach((item) => {
                const dateStr = new Date(item.scheduled_time).toLocaleString('ru-RU');
                container.innerHTML += `
                    <div class="card">
                        <h3>Локация: ${item.location_name}</h3>
                        <p><strong>Гид:</strong> ${item.guide_name || 'Не назначен'}</p>
                        <p><strong>Время:</strong> ${dateStr}</p>
                        <p><strong>Макс. участников:</strong> ${item.max_participants}</p>
                    </div>
                `;
            });
        } else {
            container.innerHTML = '<p>Экскурсий пока нет.</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки экскурсий:', error);
        const container = document.getElementById('excursions-list');
        if (container) container.innerHTML = '<p>Не удалось загрузить экскурсии.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showUserInfo();

    if (document.getElementById('locations-list')) {
        loadLocations();
    }

    if (document.getElementById('excursions-list')) {
        loadExcursions();
    }
});