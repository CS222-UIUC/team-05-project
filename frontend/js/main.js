/* frontend/js/main.js */
import {
  getGames,
  getFavorites,
  addFavorite,
  removeFavorite
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
           style="background-image:url('${g.imageUrl || 'placeholder.jpg'}')"></div>
      <div class="game-card__content">
        <h3 class="game-card__title">${g.title}</h3>
        <div class="game-card__meta">
          <span class="rating">${(g.rating || 0).toFixed(1)} ${renderStars(g.rating)}</span>
          <span class="genre">${g.genre || ''}</span>
        </div>
        <p class="game-card__description">${(g.description || '').slice(0, 90)}…</p>
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
async function buildPage () {
  const token   = localStorage.getItem('gameRecToken');
  const userId  = localStorage.getItem('userId');
  const uname   = localStorage.getItem('username') || 'there';
  const allGames = (await getGames()).sort((a,b) => (b.rating||0) - (a.rating||0));

  let favs = [];
  if (token && userId) {
    try { favs = await getFavorites(userId); } catch { /* ignore */ }
  }

  /* ----- decide intro text ----- */
  if (!token || !userId) {
    intro.innerHTML = `
      <div class="auth-prompt" style="display:flex;">
        <div class="auth-prompt__content">
          <h2>Welcome to GameRec</h2>
          <p>Hi, do you want to log in to get personalized recommendations?</p>
          <a href="./frontend/html/login.html" class="btn btn--primary btn--large">Login Now</a>
        </div>
      </div>`;
  } else if (!favs.length) {
    intro.innerHTML = `
      <div class="auth-prompt" style="display:flex;">
        <div class="auth-prompt__content">
          <h2>Hi ${uname}</h2>
          <p>Add some favourite games to get personalized recommendations!</p>
          <a href="./frontend/html/favorites.html" class="btn btn--primary btn--large">Go to Favorites</a>
        </div>
      </div>`;
  } else {
    intro.innerHTML = `<h2>Hi ${uname}, recommended & high-rated games for you</h2>`;
  }

  /* ----- build recommendation RULES (if any) ----- */
  const rules = favs.map(f => ({ genre: f.genre, rating: f.rating || 0 }));
  const recMap = new Map();
  rules.forEach(({ genre, rating }) => {
    allGames.forEach(g => {
      if (g.genre === genre && (g.rating || 0) >= rating) recMap.set(g._id, g);
    });
  });
  const favIds = new Set(favs.map(f => f._id));

  /* ----- choose list to show under intro ----- */
  const listToShow = recMap.size ? Array.from(recMap.values())
                                 : allGames;   // fallback: every game
  grid.innerHTML   = '';
  listToShow.forEach(g => grid.insertAdjacentHTML('beforeend', cardHTML(g, favIds)));

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
