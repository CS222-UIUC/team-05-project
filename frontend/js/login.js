import { login } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const data = await login(username, password);
            localStorage.setItem('gameRecToken', data.token || 'Logged In');
            localStorage.setItem('userId', data.userId);
            localStorage.setItem('username', data.username);
            alert("Login successful!");
            window.location.href = 'favorites.html';
        } catch (err) {
            alert("Login failed: " + err.message);
        }
    });
});
