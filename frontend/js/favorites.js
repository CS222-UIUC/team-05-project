// favorites.js
import { getFavorites, removeFavorite } from '../api.js';

// 把这俩函数也抄过来——和 main.js 完全一样
function renderStars(rating = 0) {
  const full = Math.floor(rating);
  const empty = 5 - full;
  return '★'.repeat(full) + '☆'.repeat(empty);
}

function cardHTML (g, favIds) {
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
             href="detail.html?id=${g._id}"
             style="text-decoration: none;">
            Details
          </a>
        </div>
      </div>
    </div>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('gameRecToken');
  const userId = localStorage.getItem('userId');
  const favoritesSection = document.getElementById('favoritesSection');
  const loginPrompt      = document.getElementById('loginPrompt');

  if (!(token && userId)) {
    // 未登录逻辑
    document.getElementById('authSection').innerHTML = `
      <a href="login.html" class="btn btn--login">Login</a>
      <a href="register.html" class="btn btn--primary">Sign Up</a>`;
    loginPrompt.style.display = 'flex';
    return;
  }

  // 已登录，加载 favorites
  document.getElementById('authSection').innerHTML = `
    <button class="btn btn--primary" id="logoutBtn">Logout</button>`;
  document.getElementById('logoutBtn').onclick = () => {
    localStorage.clear();
    window.location.reload();
  };

  favoritesSection.style.display = 'block';
  try {
    const favs = await getFavorites(userId);
    renderFavorites(favs);
  } catch {
    alert('Failed to load favorites');
  }
});

function renderFavorites(favorites) {
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

  // 构造一个 Set，用来标记哪些卡片要显示实心心
  const favIds = new Set(favorites.map(g => g._id));

  // 生成卡片
  favorites.forEach(game => {
    container.insertAdjacentHTML('beforeend', cardHTML(game, favIds));
  });

  // 给心形按钮加点击事件
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.onclick = async () => {
      const gameId = btn.dataset.id;
      try {
        await removeFavorite(localStorage.getItem('userId'), gameId);
        btn.closest('.game-card').remove();
      } catch {
        alert('Failed to remove favorite');
      }
    };
  });
}
