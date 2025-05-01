/* frontend/js/main.js */
import {
  getGames,
  getFavorites,
  addFavorite,
  removeFavorite,
  getRecommendations
} from '../api.js';

/* ---------------- navbar ---------------- */
function updateAuthButtons () {
  const nav = document.querySelector('.navbar__auth');
  const token  = localStorage.getItem('gameRecToken');
  const userId = localStorage.getItem('userId');

  if (token && userId) {
    nav.innerHTML = `<button class="btn btn--primary" id="logoutBtn">Logout</button>`;
    document.getElementById('logoutBtn').onclick = () => {
      localStorage.clear();
      window.location.reload();
    };
  } else {
    nav.innerHTML = `
      <a href="./frontend/html/login.html"    class="btn btn--login">Login</a>
      <a href="./frontend/html/register.html" class="btn btn--primary">Sign Up</a>`;
  }
}

/* ---------------- page sections ---------------- */
const grid   = document.getElementById('recommendGrid');
const intro  = document.createElement('div');    // centered text container
intro.style.gridColumn  = '1 / -1';
intro.style.textAlign   = 'center';
intro.style.margin      = '3rem 0 1rem';
grid.parentNode.insertBefore(intro, grid);       // put before the grid

/* ---------------- render helpers ---------------- */
function renderStars (rating = 0) {
  const full = Math.floor(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function cardHTML (g, favIds) {
  const loved = favIds.has(g._id);
  const icon  = loved ? 'fas' : 'far';
  return `
    <div class="game-card">
      <div class="game-card__image"
           style="background-image:url('${g.cover_url || 'placeholder.jpg'}')"></div>
      <div class="game-card__content">
        <h3 class="game-card__title">
          <span class="game-card__title-text">${g.title}</span>
        </h3>
        <div class="game-card__meta">
          <span class="rating">${(g.rating || 0).toFixed(2)} ${renderStars(g.rating)}</span>
        </div>
        <p class="game-card__description">${(g.genre || '').slice(0, 90)}</p>
        <div class="game-card__actions">
          <button class="btn btn--icon favorite-btn" data-id="${g._id}">
            <i class="${icon} fa-heart"></i>
          </button>
          <a class="btn btn--primary"
             href="./frontend/html/detail.html?id=${g._id}"
             style="text-decoration:none;">Details</a>
        </div>
      </div>
    </div>`;
}

/* ---------------- build the page ---------------- */
async function buildPage() {
  const token   = localStorage.getItem('gameRecToken');
  const userId  = localStorage.getItem('userId');
  const uname   = localStorage.getItem('username') || 'there';

  // Fetch favorites (if any) and all games
  let favs = [];
  if (token && userId) {
    try { favs = await getFavorites(userId); }
    catch (e) { console.warn(e); }
  }
  const allGames = (await getGames()).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const favIds   = new Set(favs.map(f => f._id));

  // Recommendations: only if user has favorites
  let recs = [];
  if (favs.length) {
    try {
      recs = await getRecommendations(userId);  // server returns up to 10, excludes favs
    } catch (e) {
      console.warn('rec error', e);
    }
  }

  // Build the "All Games" list (always shown, excluding favorites)
  const allList = allGames.filter(g => !favIds.has(g._id));

  // --- Clear and build content ---
  grid.innerHTML = '';       // clear all cards
  intro.innerHTML = '';      // clear intro prompt

  // 1) Intro prompt or greeting
  if (!token || !userId) {
    intro.innerHTML = `
      <div class="auth-prompt" style="display:flex;">
        <div class="auth-prompt__content">
          <h2>Welcome to GameRec</h2>
          <p>Log in to get personalized recommendations!</p>
          <a href="./frontend/html/login.html" class="btn btn--primary btn--large">Login Now</a>
        </div>
      </div>`;
  } else if (!favs.length) {
    intro.innerHTML = `
      <div class="auth-prompt" style="display:flex;">
        <div class="auth-prompt__content">
          <h2>Hi ${uname}</h2>
          <p>Add favorites to see tailored recommendations.</p>
          <a href="./frontend/html/favorites.html" class="btn btn--primary btn--large">Go to Favorites</a>
        </div>
      </div>`;
  }

  // 2) Recommendations section (if any)
  if (recs.length) {
    grid.insertAdjacentHTML('beforeend',
      `<h2 style="grid-column:1/-1; margin:2rem 0 1rem;">
        Hi ${uname}!
        Here are the 10 Recommended games personalized for You!
       </h2>`);
    recs.forEach(game => {
      grid.insertAdjacentHTML('beforeend', cardHTML(game, favIds));
    });
  }

  // 3) All Games section
  grid.insertAdjacentHTML('beforeend',
    `<h2 style="grid-column:1/-1; margin:2rem 0 1rem;">
       All Games (sorted by rating, excluding your favorite games)
     </h2>`);
  allList.forEach(game => {
    grid.insertAdjacentHTML('beforeend', cardHTML(game, favIds));
  });

  // 4) Hook favorite toggles
  hookFavouriteButtons(favIds);
}

/* ---------------- hook hearts ---------------- */
function hookFavouriteButtons (favIds) {
  const token  = localStorage.getItem('gameRecToken');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) return;

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const icon   = btn.querySelector('i');
    const gameId = btn.dataset.id;

    btn.onclick = async () => {
      const active = icon.classList.contains('fas');
      try {
        if (!active) {
          await addFavorite(userId, gameId);
          icon.classList.replace('far', 'fas');
          favIds.add(gameId);
        } else {
          await removeFavorite(userId, gameId);
          icon.classList.replace('fas', 'far');
          favIds.delete(gameId);
        }
      } catch {
        alert('Failed to update favourite');
      }
    };
  });
}

/* ---------------- bootstrap ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  updateAuthButtons();
  buildPage();
});
