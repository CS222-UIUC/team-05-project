// favorites.js
import { getFavorites, removeFavorite } from '../api.js';

const BACKEND_URL = 'http://localhost:5000';  // Your backend

// 1. Render ★☆ stars
function renderStars(rating = 0) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

// 2. Single card template, with favIds defaulting to an empty Set
function cardHTML(game, favIds = new Set()) {
  const loved     = favIds.has(game._id);
  const iconClass = loved ? 'fas' : 'far';
  const ratingVal = (game.rating || 0).toFixed(2);

  return `
    <div class="game-card">
      <div class="game-card__image"
           style="background-image:url('${game.cover_url || 'placeholder.jpg'}')"></div>
      <div class="game-card__content">
        <h3 class="game-card__title">
          <span class="game-card__title-text">${game.title}</span>
        </h3>
        <div class="game-card__meta">
          <span class="rating">${ratingVal} ${renderStars(game.rating)}</span>
        </div>
        <p class="game-card__description">${(game.genre||[]).join(', ')}</p>
        <div class="game-card__actions">
          <button class="btn btn--icon favorite-btn" data-id="${game._id}">
            <i class="${iconClass} fa-heart"></i>
          </button>
          <a class="btn btn--primary"
             href="detail.html?id=${game._id}"
             style="text-decoration:none;">
            Details
          </a>
        </div>
      </div>
    </div>`;
}

// 3. Load & render current favorites list
async function loadAndRenderFavorites(userId) {
  const favorites = await getFavorites(userId);
  const container = document.getElementById('favoritesList');
  container.innerHTML = '';

  if (!favorites.length) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-gamepad"></i>
        <p>No favorite games yet</p>
      </div>`;
    return;
  }

  const favIds = new Set(favorites.map(g => g._id));
  container.innerHTML = favorites.map(g => cardHTML(g, favIds)).join('');

  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await removeFavorite(userId, btn.dataset.id);
        await loadAndRenderFavorites(userId);
      } catch {
        alert('Failed to remove favorite');
      }
    });
  });
}

// 4. Load & render Steam library preview
async function loadAndRenderLibrary() {
  const res = await fetch(`${BACKEND_URL}/api/library`, {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Library fetch failed');
  const library = await res.json();

  const container = document.getElementById('libraryList');
  container.innerHTML = library.map(g => cardHTML(g)).join('');
}

// 5. Bulk-add library into favorites
async function bulkAddFavorites(userId) {
  const res = await fetch(`${BACKEND_URL}/api/favorites/bulk-add`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Bulk‐add failed');
  return res.json();
}

// 6. Main
document.addEventListener('DOMContentLoaded', async () => {
  const token         = localStorage.getItem('gameRecToken');
  const userId        = localStorage.getItem('userId');
  const params        = new URLSearchParams(window.location.search);
  const isImportPhase = params.get('imported') === '1';

  const authSection   = document.getElementById('authSection');
  const loginPrompt   = document.getElementById('loginPrompt');
  const favSection    = document.getElementById('favoritesSection');
  const confirmPanel  = document.getElementById('confirmImport');

  // Not logged in?
  if (!(token && userId)) {
    authSection.innerHTML = `
      <a href="login.html" class="btn btn--login">Login</a>
      <a href="register.html" class="btn btn--primary">Sign Up</a>`;
    loginPrompt.style.display = 'flex';
    return;
  }

  // Logged in: show logout button
  authSection.innerHTML = `
    <button id="logoutBtn" class="btn btn--primary">Logout</button>`;
  document.getElementById('logoutBtn').onclick = () => {
    localStorage.clear();
    location.reload();
  };

  loginPrompt.style.display = 'none';

  if (isImportPhase) {
    // Import‐confirmation view
    favSection.style.display   = 'none';
    confirmPanel.style.display = 'block';

    try {
      await loadAndRenderLibrary();
    } catch {
      confirmPanel.innerHTML = '<p>Failed to load your Steam library.</p>';
      return;
    }

    document.getElementById('addAllBtn').onclick = async () => {
      try {
        const { added, totalFavorites } = await bulkAddFavorites(userId);
        alert(`Added ${added} games. Total favorites: ${totalFavorites}.`);
        location.href = 'favorites.html';
      } catch {
        alert('Failed to add all to favorites.');
      }
    };

    document.getElementById('skipBtn').onclick = () => {
      location.href = 'favorites.html';
    };

  } else {
    // Normal favorites list
    confirmPanel.style.display = 'none';
    favSection.style.display   = 'block';

    try {
      await loadAndRenderFavorites(userId);
    } catch {
      alert('Failed to load favorites.');
    }
  }
});
