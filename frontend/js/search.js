/* frontend/js/search.js */
import { request, addFavorite, removeFavorite } from '../api.js';

/* -------------  auth‑buttons (same logic as main.js) ------------- */
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
      // stay on page or redirect as you wish
    });
  } else {
    auth.innerHTML = `
      <a href="login.html"   class="btn btn--login">Login</a>
      <a href="register.html" class="btn btn--primary">Sign Up</a>
    `;
  }
}

/* -------------  search logic ------------- */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButtons();

  ['genreFilter', 'ratingFilter'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      document.getElementById('searchForm').dispatchEvent(new Event('submit'));
    });
  });
  
  document.getElementById('searchForm').addEventListener('submit', async e => {
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

async function searchGames (title, genre, rating) {
  const qs = new URLSearchParams();
  if (title)  qs.append('title',  title);
  if (genre)  qs.append('genre',  genre);
  if (rating) qs.append('rating', rating);
  return await request(`/games?${qs.toString()}`, 'GET');
}

/* ---------------- showing stars ---------------- */
function renderStars(rating = 0) {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

/* -------------  results / favourite toggles ------------- */
function renderSearchResults (games) {
  const root = document.getElementById('searchResults');
  root.innerHTML = games?.length ? '' : '<p>No games found.</p>';

  games.forEach(g => {
    const card = `
      <div class="game-card">
        <div class="game-card__image" style="background-image:url('${g.imageUrl || 'placeholder.jpg'}')"></div>
        <div class="game-card__content">
          <h3 class="game-card__title">${g.title}</h3>
          <div class="game-card__meta">
            <span class="rating">${(g.rating || 0).toFixed(1)} ${renderStars(g.rating)}</span>
            <span class="genre">${g.genre || ''}</span>
          </div>
          <button class="btn btn--icon favorite-btn" data-game-id="${g._id}">
            <i class="far fa-heart"></i>
          </button>
        </div>
      </div>`;
    root.insertAdjacentHTML('beforeend', card);
  });

  // hook favourite buttons
  root.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const token  = localStorage.getItem('gameRecToken');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) {
        alert('Please login!');
        return;
      }
      const icon     = btn.querySelector('i');
      const gameId   = btn.dataset.gameId;
      const isActive = icon.classList.contains('fas');

      try {
        if (!isActive) {
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
