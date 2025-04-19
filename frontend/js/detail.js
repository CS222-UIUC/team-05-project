/* detail.js */

import {
    getGameById,
    getGameReviews,
    createReview,
    addFavorite,
    removeFavorite,
    getFavorites
  } from '../api.js';
  
  /* ----------------- bootstrap ----------------- */
  document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('id');
  
    if (!gameId) {
      alert('No game selected');       // opened without ?id=
      history.back();
      return;
    }
  
    try {
      const game = await getGameById(gameId);
      fillGameInfo(game);
  
      await loadReviews(gameId);
      prepareFavouriteToggle(gameId);
      prepareReviewForm(gameId);
      refreshAuthButtons();            // reuse search/main logic
    } catch (err) {
      alert(err.message);
    }
  });
  
  /* ----------------- UI helpers ----------------- */
  function fillGameInfo(game) {
    document.getElementById('gameImage').style.backgroundImage =
      `url('${game.imageUrl || '../images/placeholder.jpg'}')`;
  
    document.getElementById('gameTitle').textContent       = game.title;
    document.getElementById('gameGenre').textContent       = `Genre: ${game.genre}`;
    document.getElementById('gamePlatform').textContent    = `Platform: ${game.platform || 'N/A'}`;
    const ratingContainer = document.getElementById('gameRating');
    ratingContainer.innerHTML = renderStarRating(game.rating || 0);
    document.getElementById('gameDescription').textContent = game.description || 'No description.';
  }
  
  /* ---------- favourites ---------- */
  async function prepareFavouriteToggle(gameId) {
    const btn    = document.getElementById('favoriteBtn');
    const icon   = btn.querySelector('i');
    const userId = localStorage.getItem('userId');
    const token  = localStorage.getItem('gameRecToken');
  
    let active = false;

    if (token && userId) {
      try {
        const favorites = await getFavorites(userId);
        active = favorites.some(g => g._id === gameId);
      } catch (err) {
        console.warn('Failed to load favorites, falling back to localStorage');
        active = JSON.parse(localStorage.getItem('favorites') || '[]')
                    .includes(gameId);
      }
    }
  
    updateIcon(active);

    btn.addEventListener('click', async () => {
      if (!token || !userId) {
        alert('Please login to favourite games!');
        return;
      }
  
      try {
        if (active) {
          await removeFavorite(userId, gameId);
        } else {
          await addFavorite(userId, gameId);
        }
        active = !active;
        updateIcon(active);
      } catch (err) {
        alert('Failed to update favourite');
      }
    });
  
    function updateIcon(state) {
      if (state) icon.classList.replace('far', 'fas');
      else       icon.classList.replace('fas', 'far');
    }
  }
  
  /* ---------- reviews ---------- */
  async function loadReviews(gameId) {
    const box = document.getElementById('reviewsContainer');
    box.innerHTML = '<p style="color:#888">Loading…</p>';
  
    try {
      const reviews = await getGameReviews(gameId);
      if (!reviews.length) {
        box.innerHTML = '<p style="color:#888">No reviews yet.</p>';
        return;
      }
  
      box.innerHTML = '';
      reviews.forEach(r => {
        const div = document.createElement('div');
        div.className = 'review';
        div.innerHTML = `
          <p class="review__meta">
            <strong>${r.user_id?.username || 'Anon'}</strong>
            – ${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}
          </p>
          <p>${r.review_text}</p>`;
        box.appendChild(div);
      });
    } catch (err) {
      box.innerHTML = '<p style="color:#f66">Failed to load reviews.</p>';
    }
  }
  
  function prepareReviewForm(gameId) {
    const form   = document.getElementById('reviewForm');
    const text   = document.getElementById('reviewText');
    const rating = document.getElementById('reviewRating');
  
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const userId = localStorage.getItem('userId');
      const token  = localStorage.getItem('gameRecToken');
      if (!token || !userId) {
        alert('Please login to submit reviews!');
        return;
      }
  
      if (!rating.value) {
        alert('Please select a rating');
        return;
      }
  
      try {
        await createReview(userId, gameId, Number(rating.value), text.value.trim());
        text.value   = '';
        rating.value = '';
        await loadReviews(gameId);         // refresh list
      } catch (err) {
        alert('Failed to submit review');
      }
    });
  }
  
  /* ---------- auth buttons in navbar ---------- */
  function refreshAuthButtons() {
    const navAuth = document.querySelector('.navbar__auth');
    const token   = localStorage.getItem('gameRecToken');
    const userId  = localStorage.getItem('userId');
  
    if (token && userId) {
      navAuth.innerHTML = `<button class="btn btn--primary" id="logoutBtn">Logout</button>`;
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('gameRecToken');
        localStorage.removeItem('userId');
        refreshAuthButtons();
      });
    } else {
      navAuth.innerHTML = `
        <a href="login.html"    class="btn btn--login">Login</a>
        <a href="register.html" class="btn btn--primary">Sign Up</a>`;
    }
  }

  function renderStarRating(score) {
    const fullStars = Math.floor(score);
    const partial = score - fullStars;
    let starsHTML = '';
  
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHTML += '<i class="fas fa-star star full"></i>';
      } else if (i === fullStars && partial > 0) {
        starsHTML += `<i class="fas fa-star star partial" style="--percent:${partial * 100}%"></i>`;
      } else {
        starsHTML += '<i class="far fa-star star"></i>';
      }
    }
  
    return `Rating: ${starsHTML} <span class="score">${score.toFixed(1)}</span>`;
  }
  