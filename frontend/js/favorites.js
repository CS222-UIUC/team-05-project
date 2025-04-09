document.addEventListener('DOMContentLoaded', async () => {
    const currentUser = AuthService.getCurrentUser();
    const authSection = document.getElementById('authSection');
    const loginPrompt = document.getElementById('loginPrompt');
    const favoritesSection = document.getElementById('favoritesSection');

    if (currentUser) {
        authSection.innerHTML = `
            <button class="btn btn--login" onclick="AuthService.logout()">Logout</button>
        `;
        favoritesSection.style.display = 'block';
        await loadFavorites();
    } else {
        authSection.innerHTML = `
            <a href="login.html" class="btn btn--login">Login</a>
        `;
        loginPrompt.style.display = 'flex';
    }
});

async function loadFavorites() {
    try {
        const response = await fetch('http://localhost:5000/api/users/favorites', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('gameRecToken')}`
            }
        });
        
        if (!response.ok) throw new Error();
        
        const favorites = await response.json();
        renderFavorites(favorites);
    } catch (error) {
        alert('Failed to load favorites');
    }
}

function renderFavorites(favorites) {
    const container = document.getElementById('favoritesList');
    container.innerHTML = '';

    if (favorites.length === 0) {
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
                <div class="game-card__image" style="background-image: url('${game.imageUrl}');"></div>
                <div class="game-card__content">
                    <h3 class="game-card__title">${game.title}</h3>
                    <div class="game-card__meta">
                        <span class="rating">${'★'.repeat(game.rating)}</span>
                        <span class="genre">${game.genre}</span>
                    </div>
                    <button class="btn btn--icon active" onclick="removeFavorite('${game._id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', gameCard);
    });
}

async function removeFavorite(gameId) {
    try {
        await fetch(`http://localhost:5000/api/users/favorites/${gameId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('gameRecToken')}`
            }
        });
        location.reload();
    } catch (error) {
        alert('Failed to remove favorite');
    }
}