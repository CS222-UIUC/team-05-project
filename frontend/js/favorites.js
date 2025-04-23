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
            window.location.reload();
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
        const gameCard = `
            <div class="game-card">
                <div class="game-card__image" style="background-image:url('${game.imageUrl || 'placeholder.jpg'}')"></div>
                <div class="game-card__content">
                    <h3 class="game-card__title">${game.title}</h3>
                    <div class="game-card__meta">
                        <span class="rating">${(game.rating || 0).toFixed(1)} ${renderStars(game.rating)}</span>
                        <span class="genre">${game.genre || ''}</span>
                    </div>
                    <p class="game-card__description">
                        ${(game.description || '').slice(0, 90)}…
                    </p>
                    <div class="game-card__actions">
                        <button class="btn btn--icon favorite-btn" data-id="${game._id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <a class="btn btn--primary" href="./detail.html?id=${game._id}" style="text-decoration: none;">Details</a>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', gameCard);
    });

    // Attach remove favorite logic
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const token = localStorage.getItem('gameRecToken');
            const userId = localStorage.getItem('userId');
            if (!token || !userId) {
                alert('Please login to remove favorites!');
                return;
            }
            const gameId = btn.getAttribute('data-id');
            try {
                await removeFavorite(userId, gameId);
                btn.closest('.game-card').remove();
            } catch (error) {
                alert('Failed to remove favorite');
            }
        });
    });
}

function renderStars(rating = 0) {
    const full = Math.floor(rating);
    const empty = 5 - full;
    return '★'.repeat(full) + '☆'.repeat(empty);
}
