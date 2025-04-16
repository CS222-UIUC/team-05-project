// search.js

import { request, addFavorite, removeFavorite } from '../api.js';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;
        const genre = document.getElementById('genreFilter').value;
        const minRating = document.getElementById('ratingFilter').value;

        try {
            // This calls GET /games?title=...&genre=...&rating=...
            // using the "request" helper from api.js:
            const games = await searchGames(searchTerm, genre, minRating);
            renderSearchResults(games);
        } catch (error) {
            alert('Failed to search games');
        }
    });
});

/**
 * Example of a "searchGames" function that calls our "request" from api.js
 * If your backend doesn't handle query params, you'll need to implement it
 */
async function searchGames(title, genre, rating) {
    // Build query string
    const qs = new URLSearchParams();
    if (title) qs.append('title', title);
    if (genre) qs.append('genre', genre);
    if (rating) qs.append('rating', rating);

    // call request('/games?title=xxx&genre=xxx&rating=xxx')
    return await request(`/games?${qs.toString()}`, 'GET');
}

function renderSearchResults(games) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    if (!games || !games.length) {
        resultsContainer.innerHTML = '<p>No games found.</p>';
        return;
    }

    games.forEach(game => {
        const gameId = game._id;
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
                    <button class="btn btn--icon favorite-btn" data-game-id="${gameId}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        resultsContainer.insertAdjacentHTML('beforeend', gameCard);
    });

    // Attach favorite logic
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const token = localStorage.getItem('gameRecToken');
            const userId = localStorage.getItem('userId');
            if (!token || !userId) {
                alert('Please login to favorite games!');
                return;
            }
            const gameId = btn.dataset.gameId;
            const icon = btn.querySelector('i');
            const isFavorited = icon.classList.contains('fas');

            try {
                if (!isFavorited) {
                    // add favorite
                    await addFavorite(userId, gameId);
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    // remove favorite
                    await removeFavorite(userId, gameId);
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            } catch (error) {
                alert('Failed to update favorite');
            }
        });
    });
}
