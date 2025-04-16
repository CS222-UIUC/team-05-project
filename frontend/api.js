// api.js
const BASE_URL = 'http://localhost:5000/api';

export async function request(url, method = 'GET', data) {
    const token = localStorage.getItem('gameRecToken');

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : undefined,
        },
        body: data ? JSON.stringify(data) : undefined,
    };

    const response = await fetch(`${BASE_URL}${url}`, options);
    const resData = await response.json();

    if (!response.ok) {
        //alert(resData.message || 'Request failed');
        throw new Error(resData.message || 'Request failed');
    }

    return resData;
}

// user related
export const register = (username, password) => request('/users/register', 'POST', { username, password });
export const login = (username, password) => request('/users/login', 'POST', { username, password });
export const addFavorite = (userId, gameId) => request(`/users/${userId}/favorites`, 'POST', { gameId });
export const removeFavorite = (userId, gameId) => request(`/users/${userId}/favorites/${gameId}`, 'DELETE');
export const getFavorites = (userId) => request(`/users/${userId}/favorites`);
export const getUser = (userId) => request(`/users/${userId}`);
export const updateUser = (userId, data) => request(`/users/${userId}`, 'PUT', data);
/*example uses:
import { updateUser } from '../api.js';

await updateUser(userId, {
    username: "new_username",
    email: "new_email@example.com",
    password: "newpassword123"
});
*/

// game related
export const getGames = () => request('/games');
export const getGameById = (gameId) => request(`/games/${gameId}`);
export const createGame = (data) => request('/games', 'POST', data);
export const updateGame = (gameId, data) => request(`/games/${gameId}`, 'PUT', data);
export const deleteGame = (gameId) => request(`/games/${gameId}`, 'DELETE');

// review related
export const getReviews = () => request('/reviews');
export const getGameReviews = (gameId) => request(`/reviews/game/${gameId}`);
export const createReview = (user, game, rating, comment) => request('/reviews', 'POST', { user, game, rating, comment });
export const deleteReview = (reviewId) => request(`/reviews/${reviewId}`, 'DELETE');

