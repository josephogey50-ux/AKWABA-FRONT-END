const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  renderApp();
});

function renderApp() {
  const root = document.getElementById('root');
  
  root.innerHTML = `
    <header>
      <h1>AKWABA</h1>
    </header>
    <div class="container">
      <div id="auth-form">
        ${renderAuthForm()}
      </div>
    </div>
  `;

  attachEventListeners();
}

function renderAuthForm() {
  return `
    <form id="register-form">
      <h2>Register</h2>
      <input 
        type="text" 
        id="username" 
        placeholder="Username" 
        required
      />
      <input 
        type="email" 
        id="email" 
        placeholder="Email" 
        required
      />
      <input 
        type="password" 
        id="password" 
        placeholder="Password" 
        required
      />
      <input 
        type="password" 
        id="confirmPassword" 
        placeholder="Confirm Password" 
        required
      />
      <button type="submit">Register</button>
    </form>
    <form id="login-form" style="display:none;">
      <h2>Login</h2>
      <input 
        type="email" 
        id="login-email" 
        placeholder="Email" 
        required
      />
      <input 
        type="password" 
        id="login-password" 
        placeholder="Password" 
        required
      />
      <button type="submit">Login</button>
    </form>
    <div id="message-container"></div>
    <button id="toggle-form" style="margin-top: 1rem; padding: 0.5rem 1rem;">
      Go to Login
    </button>
  `;
}

function attachEventListeners() {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const toggleButton = document.getElementById('toggle-form');

  registerForm.addEventListener('submit', handleRegister);
  loginForm.addEventListener('submit', handleLogin);
  toggleButton.addEventListener('click', toggleForms);
}

function toggleForms() {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const toggleButton = document.getElementById('toggle-form');

  if (registerForm.style.display === 'none') {
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
    toggleButton.textContent = 'Go to Login';
  } else {
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    toggleButton.textContent = 'Go to Register';
  }
}

async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  try {
    const response = await fetch(`${API_URL}/register/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();
    showMessage(data.message || data.error, response.ok ? 'success' : 'error');

    if (response.ok) {
      localStorage.setItem('token', data.token);
      setTimeout(() => {
        alert('Registration successful! Logged in.');
        // Redirect to dashboard or home page
      }, 1500);
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await fetch(`${API_URL}/register/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    showMessage(data.message || data.error, response.ok ? 'success' : 'error');

    if (response.ok) {
      localStorage.setItem('token', data.token);
      setTimeout(() => {
        alert('Login successful!');
        // Redirect to dashboard or home page
      }, 1500);
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

function showMessage(message, type) {
  const messageContainer = document.getElementById('message-container');
  messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
  setTimeout(() => {
    messageContainer.innerHTML = '';
  }, 5000);
}
