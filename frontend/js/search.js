// frontend/js/search.js
import { request, addFavorite, removeFavorite } from '../api.js';

/* ------------- auth-buttons (same as main.js) ------------- */
function updateAuthButtons () {
  const auth = document.querySelector('.navbar__auth');
  const token  = localStorage.getItem('gameRecToken');
  const userId = localStorage.getItem('userId');

  if (token && userId) {
    auth.innerHTML = `<button class="btn btn--primary" id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('gameRecToken');
      localStorage.removeItem('userId');
      window.location.reload();
    });
  } else {
    auth.innerHTML = `
      <a href="login.html"   class="btn btn--login">Login</a>
      <a href="register.html" class="btn btn--primary">Sign Up</a>
    `;
  }
}

/* ---------------- render helpers ---------------- */
function renderStars(rating = 0) {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function cardHTML(g, favIds) {
  const loved     = favIds.has(g._id);
  const iconClass = loved ? 'fas' : 'far';
  const ratingVal = (g.rating || 0).toFixed(2);

  return `
    <div class="game-card">
      <div class="game-card__image"
           style="background-image:url('${g.cover_url || 'placeholder.jpg'}')"></div>
      <div class="game-card__content">
        <h3 class="game-card__title">
          <span class="game-card__title-text">${g.title}</span>
        </h3>
        <div class="game-card__meta">
          <span class="rating">${ratingVal} ${renderStars(g.rating)}</span>
        </div>
        <p class="game-card__description">${(g.genre || '')}</p>
        <div class="game-card__actions">
          <button class="btn btn--icon favorite-btn" data-id="${g._id}">
            <i class="${iconClass} fa-heart"></i>
          </button>
          <a class="btn btn--primary"
             href="./detail.html?id=${g._id}">
            Details
          </a>
        </div>
      </div>
    </div>`;
}

/* ------------- search logic ------------- */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButtons();

  ['genreFilter', 'ratingFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    });
  });

  document.getElementById('searchForm')
    .addEventListener('submit', async e => {
      e.preventDefault();
      const title  = document.getElementById('searchInput').value.trim();
      const genre  = document.getElementById('genreFilter').value;
      const rating = document.getElementById('ratingFilter').value;

      try {
        const games = await searchGames(title, genre, rating);
        renderSearchResults(games);
      } catch (err) {
        alert(err.message);
      }
    });
});

async function searchGames(title, genre, rating) {
  const qs = new URLSearchParams();
  if (title)  qs.append('title',  title);
  if (genre)  qs.append('genre',  genre);
  if (rating) qs.append('rating', rating);
  return await request(`/games?${qs.toString()}`, 'GET');
}

/* ------------- render results & hook favorites ------------- */
function renderSearchResults(games) {
  const root = document.getElementById('searchResults');
  root.classList.add('recommendGrid');
  root.innerHTML = games?.length
    ? ''
    : '<p>No games found.</p>';

  const favIds = new Set();
  const token  = localStorage.getItem('gameRecToken');
  const userId = localStorage.getItem('userId');
  if (token && userId && games.length) {
    request(`/users/${userId}/favorites`, 'GET')
      .then(list => list.forEach(g => favIds.add(g._id)))
      .finally(() => injectCards(games, favIds));
  } else {
    injectCards(games, favIds);
  }

  function injectCards(list, favSet) {
    list.forEach(g => {
      root.insertAdjacentHTML('beforeend', cardHTML(g, favSet));
    });
    hookFavouriteButtons();
  }
}

function hookFavouriteButtons() {
  const token  = localStorage.getItem('gameRecToken');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const icon   = btn.querySelector('i');
    const gameId = btn.dataset.id;

    btn.addEventListener('click', async () => {
      const isActive = icon.classList.contains('fas');
      try {
        if (!isActive) {
          await addFavorite(userId, gameId);
          icon.classList.replace('far', 'fas');
        } else {
          await removeFavorite(userId, gameId);
          icon.classList.replace('fas', 'far');
        }
      } catch {
        alert('Failed to update favorite');
      }
    });
  });
}
