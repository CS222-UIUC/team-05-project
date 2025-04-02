import { AuthService } from '../auth.js';

const API_BASE = 'http://localhost:5000/api/games';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchTerm = document.getElementById('searchInput').value;
        const genre = document.getElementById('genreFilter').value;
        const minRating = document.getElementById('ratingFilter').value;

        try {
            const response = await fetch(`${API_BASE}?title=${searchTerm}&genre=${genre}&rating=${minRating}`);
            const games = await response.json();
            renderSearchResults(games);
        } catch (error) {
            alert('Failed to search games');
        }
    });
});

function renderSearchResults(games) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    games.forEach(game => {
        const gameCard = `
            <div class="game-card">
                <div class="game-card__image" style="background-image: url('${game.imageUrl}');"></div>
                <div class="game-card__content">
                    <h3 class="game-card__title">${game.title}</h3>
                    <div class="game-card__meta">
                        <span class="rating">${'★'.repeat(game.rating)}</span>
                        <span class="genre">${game.genre}</span>
                    </div>
                    <button class="btn btn--icon favorite-btn" data-game-id="${game._id}">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        resultsContainer.insertAdjacentHTML('beforeend', gameCard);
    });

    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.onclick = async () => {
            if (!AuthService.getCurrentUser()) {
                alert('Please login to favorite games!');
                return;
            }
            await toggleFavorite(btn.dataset.gameId, btn);
        };
    });
}

async function toggleFavorite(gameId, button) {
    try {
        const response = await fetch(`http://localhost:5000/api/users/favorites/${gameId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('gameRecToken')}`
            }
        });

        if (response.ok) {
            button.querySelector('i').classList.toggle('far');
            button.querySelector('i').classList.toggle('fas');
        }
    } catch (error) {
        alert('Failed to update favorite');
    }
}