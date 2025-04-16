// main.js

import { addFavorite, removeFavorite } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication status
    const token = localStorage.getItem('gameRecToken');
    const userId = localStorage.getItem('userId');
    const authButtons = document.querySelector('.navbar__auth');

    if (token && userId) {
        // If logged in, show logout button
        authButtons.innerHTML = `
            <button class="btn btn--login" id="logoutBtn">Logout</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }

    // Initialize favorite buttons
    initializeFavoriteButtons();
});

function logout() {
    localStorage.removeItem('gameRecToken');
    localStorage.removeItem('userId');
    // Navigate to a page, e.g.:
    window.location.href = './frontend/html/login.html';
}

// Initialize favorite buttons on any .game-card in the DOM
function initializeFavoriteButtons() {
    document.querySelectorAll('.game-card').forEach(card => {
        const heartBtn = card.querySelector('.btn--icon');
        if (heartBtn) {
            // Put an ID or some unique key. Right now, using the title text as ID is not ideal,
            // but for demonstration it's used in your code. 
            // If you have a real gameId from the DB, store it in data attributes:
            const gameId = card.querySelector('.game-card__title').textContent;
            heartBtn.classList.add('favorite-btn');
            heartBtn.dataset.gameId = gameId;

            heartBtn.onclick = function () {
                toggleFavorite(gameId, heartBtn);
            };
        }
    });
}

// Handle favorite/unfavorite
async function toggleFavorite(gameId, button) {
    const token = localStorage.getItem('gameRecToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
        alert('Please login to favorite games!');
        return;
    }

    // If the button is not yet active, that means we want to ADD favorite
    const isActive = button.classList.contains('active');
    try {
        if (!isActive) {
            // Add favorite to DB
            await addFavorite(userId, gameId);
            button.classList.add('active');
            button.querySelector('i').classList.remove('far');
            button.querySelector('i').classList.add('fas');
        } else {
            // Remove favorite
            // (We don’t actually have a real ID for the game here if you’re using the text as ID,
            // so in a real scenario, gameId should be the DB’s _id. Adjust accordingly!)
            await removeFavorite(userId, gameId);
            button.classList.remove('active');
            button.querySelector('i').classList.remove('fas');
            button.querySelector('i').classList.add('far');
        }
    } catch (error) {
        alert('Failed to update favorite');
    }
}
