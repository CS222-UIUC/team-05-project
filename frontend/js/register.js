import { register } from '../api.js';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;

    try {
        await register(username, password);
        alert("Register successful!");
        window.location.href = 'login.html';
    } catch (error) {
        alert("Registration failed: " + error.message);
    }
});
