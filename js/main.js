document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    const token = localStorage.getItem('gameRecToken');
    const authButtons = document.querySelector('.navbar__auth');

    if (token) {
        // If logged in, show logout button
        authButtons.innerHTML = `
            <button class="btn btn--login" onclick="logout()">Logout</button>
        `;
    }

    // Add other main page JavaScript logic here
});

function logout() {
    localStorage.removeItem('gameRecToken');
    window.location.href = 'index.html';
}