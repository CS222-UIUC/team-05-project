// favorites.js

import { getFavorites, removeFavorite } from '../api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('gameRecToken');
    const userId = localStorage.getItem('userId');
    const authSection = document.getElementById('authSection');
    const loginPrompt = document.getElementById('loginPrompt');
    const favoritesSection = document.getElementById('favoritesSection');

    if (token && userId) {
        // Show logout button
        authSection.innerHTML = `
            <button class="btn btn--primary" id="logoutBtn">Logout</button>
        `;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('gameRecToken');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        });

        favoritesSection.style.display = 'block';
        await loadFavorites(userId);
    } else {
        authSection.innerHTML = `
            <a href="login.html" class="btn btn--login">Login</a>
            <a href="register.html" class="btn btn--primary">Sign Up</a>
        `;
        loginPrompt.style.display = 'flex';
    }
});

async function loadFavorites(userId) {
    try {
        // Get all favorites for this user
        const favorites = await getFavorites(userId);
        renderFavorites(favorites);
    } catch (error) {
        alert('Failed to load favorites');
    }
}

function renderFavorites(favorites) {
    const container = document.getElementById('favoritesList');
    container.innerHTML = '';

    if (!favorites || favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-gamepad"></i>
                <p>No favorite games yet</p>
            </div>
        `;
        return;
    }

    favorites.forEach(game => {
        // game will be a full object if you used .populate('favorites') in your user route
        // That means game._id, game.title, game.imageUrl, etc. should exist
        const ratingStars = '★'.repeat(game.rating || 0);

        const gameCard = `
            <div class="game-card">
                <div class="game-card__image" style="background-image: url('${game.imageUrl || 'placeholder.jpg'}');"></div>
                <div class="game-card__content">
                    <h3 class="game-card__title">${game.title}</h3>
                    <div class="game-card__meta">
                        <span class="rating">${ratingStars}</span>
                        <span class="genre">${game.genre || ''}</span>
                    </div>
                    <button class="btn btn--icon active" data-game-id="${game._id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', gameCard);
    });

    // Attach remove favorite logic
    document.querySelectorAll('.btn--icon.active').forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                const token = localStorage.getItem('gameRecToken');
                const userId = localStorage.getItem('userId');
                if (!token || !userId) {
                    alert('Please login to remove favorites!');
                    return;
                }
                const gameId = btn.getAttribute('data-game-id');
                await removeFavorite(userId, gameId);
                // reload or remove from the DOM
                btn.closest('.game-card').remove();
            } catch (error) {
                alert('Failed to remove favorite');
            }
        });
    });
}
