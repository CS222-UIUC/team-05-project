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

    // Initialize favorite buttons
    initializeFavoriteButtons();
    // Initialize favorites
    initializeFavorites();
});

function logout() {
    localStorage.removeItem('gameRecToken');
    window.location.href = 'index.html';
}

// Initialize favorite buttons
function initializeFavoriteButtons() {
    // Add favorite buttons to all game cards
    document.querySelectorAll('.game-card').forEach(card => {
        const actionsDiv = card.querySelector('.game-card__actions');
        const existingHeartBtn = actionsDiv.querySelector('.btn--icon');
        
        if (existingHeartBtn) {
            // If the heart button already exists, add favorite functionality
            existingHeartBtn.classList.add('favorite-btn');
            existingHeartBtn.dataset.gameId = card.querySelector('.game-card__title').textContent;
            existingHeartBtn.onclick = function() {
                toggleFavorite(this.dataset.gameId, this);
            };
        }
    });
}

// Initialize favorites
function initializeFavorites() {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    updateFavoriteButtons(favorites);
}

// Update all favorite buttons
function updateFavoriteButtons(favorites) {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const gameId = btn.dataset.gameId;
        if (favorites.includes(gameId)) {
            btn.classList.add('active');
            btn.querySelector('i').classList.remove('far');
            btn.querySelector('i').classList.add('fas');
        } else {
            btn.classList.remove('active');
            btn.querySelector('i').classList.remove('fas');
            btn.querySelector('i').classList.add('far');
        }
    });
}

// Handle favorite/unfavorite
function toggleFavorite(gameId, button) {
    if (!localStorage.getItem('gameRecToken')) {
        alert('Please login to favorite games!');
        return;
    }

    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(gameId);

    if (index === -1) {
        // Add favorite
        favorites.push(gameId);
        button.classList.add('active');
        button.querySelector('i').classList.remove('far');
        button.querySelector('i').classList.add('fas');
    } else {
        // Unfavorite
        favorites.splice(index, 1);
        button.classList.remove('active');
        button.querySelector('i').classList.remove('fas');
        button.querySelector('i').classList.add('far');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
}