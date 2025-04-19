/* frontend/js/main.js */
import {
    getGames,
    addFavorite,
    removeFavorite,
    getFavorites
  } from '../api.js';
  
  /* ---------------- auth buttons ---------------- */
  function updateAuthButtons () {
    const nav = document.querySelector('.navbar__auth');
    const token  = localStorage.getItem('gameRecToken');
    const userId = localStorage.getItem('userId');
  
    if (token && userId) {
      nav.innerHTML = `<button class="btn btn--primary" id="logoutBtn">Logout</button>`;
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('gameRecToken');
        localStorage.removeItem('userId');
        window.location.reload();
      });
    } else {
      nav.innerHTML = `
        <a href="./frontend/html/login.html"    class="btn btn--login">Login</a>
        <a href="./frontend/html/register.html" class="btn btn--primary">Sign Up</a>`;
    }
  }
  
  /* ---------------- games list ---------------- */
  async function loadGames () {
    const grid = document.querySelector('.game-grid');
    grid.innerHTML = '<p style="color:#888">Loading…</p>';
  
    try {
      const games = await getGames();
      if (!games.length) {
        grid.innerHTML = '<p style="color:#888">No games in database.</p>';
        return;
      }
  
      grid.innerHTML = '';            // clear placeholder
      games.forEach(g => {
        grid.insertAdjacentHTML('beforeend', `
          <div class="game-card">
            <div class="game-card__image"
                 style="background-image:url('${g.imageUrl || 'placeholder.jpg'}')"></div>
            <div class="game-card__content">
              <h3 class="game-card__title">${g.title}</h3>
              <div class="game-card__meta">
                <span class="rating">${(g.rating || 0).toFixed(1)} ${renderStars(g.rating)}</span>
                <span class="genre">${g.genre || ''}</span>
              </div>
              <p class="game-card__description">
                ${(g.description || '').slice(0, 90)}…
              </p>
              <div class="game-card__actions">
                <button class="btn btn--icon favorite-btn" data-id="${g._id}">
                  <i class="far fa-heart"></i>
                </button>
                <a class="btn btn--primary"
                   style="text-decoration:none"
                   href="./frontend/html/detail.html?id=${g._id}">
                   Details
                </a>
              </div>
            </div>
          </div>`);
      });
  
      hookFavouriteButtons();         // after DOM is in place
    } catch (err) {
      grid.innerHTML = `<p style="color:#f66">${err.message}</p>`;
    }
  }

  /* ---------------- showing stars ---------------- */
  function renderStars(rating = 0) {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  }
  
  /* ---------------- favourites ---------------- */
  async function hookFavouriteButtons () {
    const token  = localStorage.getItem('gameRecToken');
    const userId = localStorage.getItem('userId');
  
    let favoriteIds = [];
  
    if (token && userId) {
      try {
        const favorites = await getFavorites(userId);
        favoriteIds = favorites.map(f => f._id);
      } catch (err) {
        console.warn('Failed to load favorites, fallback to empty list');
      }
    }
  
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      const gameId = btn.dataset.id;
      const icon   = btn.querySelector('i');
  
      const isFavorite = favoriteIds.includes(gameId);
      if (isFavorite) icon.classList.replace('far', 'fas');
  
      btn.addEventListener('click', async () => {
        if (!token || !userId) {
          window.location.href = `./frontend/html/favorites.html?redirect=main`;
          return;
        }
  
        const active = icon.classList.contains('fas');
        try {
          if (!active) {
            await addFavorite(userId, gameId);
            icon.classList.replace('far', 'fas');
          } else {
            await removeFavorite(userId, gameId);
            icon.classList.replace('fas', 'far');
          }
        } catch (err) {
          alert('Failed to update favourite');
        }
      });
    });
  }
  
  
  /* ---------------- bootstrap ---------------- */
  document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtons();
    loadGames();
  });