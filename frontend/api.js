// api.js - Core API interaction layer for the GameRec application
const BASE_URL = 'http://localhost:5000/api';

/**
 * Generic request function to handle all API calls
 * @param {string} url - Endpoint path (will be appended to BASE_URL)
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Request payload for POST/PUT requests
 * @returns {Promise<object>} - Response data from the server
 */
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

    try {
        const response = await fetch(`${BASE_URL}${url}`, options);
        const resData = await response.json();

        if (!response.ok) {
            //alert(resData.message || 'Request failed');
            throw new Error(resData.message || 'Request failed');
        }

        return resData;
    } catch (error) {
        console.error('API request error:', error);
        throw error; // Re-throw to allow handling in components
    }
}

// User-related API endpoints
/**
 * Register a new user
 * @param {string} username - User's username
 * @param {string} password - User's password
 */
export const register = (username, password) => request('/users/register', 'POST', { username, password });

/**
 * Log in an existing user
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise<{token: string, userId: string, username: string}>} Authentication data
 */
export const login = (username, password) => request('/users/login', 'POST', { username, password });

/**
 * Add a game to user's favorites
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID to favorite
 */
export const addFavorite = (userId, gameId) => request(`/users/${userId}/favorites`, 'POST', { gameId });

/**
 * Remove a game from user's favorites
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID to unfavorite
 */
export const removeFavorite = (userId, gameId) => request(`/users/${userId}/favorites/${gameId}`, 'DELETE');

/**
 * Get user's favorite games
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of favorite games
 */
export const getFavorites = (userId) => request(`/users/${userId}/favorites`);

/**
 * Get user profile information
 * @param {string} userId - User ID
 * @returns {Promise<object>} User profile data
 */
export const getUser = (userId) => request(`/users/${userId}`);

/**
 * Update user profile information
 * @param {string} userId - User ID
 * @param {object} data - Updated user data
 */
export const updateUser = (userId, data) => request(`/users/${userId}`, 'PUT', data);
/*example uses:
import { updateUser } from '../api.js';

await updateUser(userId, {
    username: "new_username",
    email: "new_email@example.com",
    password: "newpassword123"
});
*/

// Game-related API endpoints
/**
 * Get all games (with optional filtering via query params)
 * @returns {Promise<Array>} List of games
 */
export const getGames = () => request('/games');

/**
 * Get details for a specific game
 * @param {string} gameId - Game ID
 * @returns {Promise<object>} Game details
 */
export const getGameById = (gameId) => request(`/games/${gameId}`);

/**
 * Get game recommendations for a user based on their favorites
 * @param {string} userId - User ID
 * @returns {Promise<Array>} List of recommended games
 */
export const getRecommendedGames = (userId) => request(`/games/recommend/${userId}`);

/**
 * Create a new game
 * @param {object} data - Game data
 * @returns {Promise<object>} Created game
 */
export const createGame = (data) => request('/games', 'POST', data);

/**
 * Update an existing game
 * @param {string} gameId - Game ID
 * @param {object} data - Updated game data
 * @returns {Promise<object>} Updated game
 */
export const updateGame = (gameId, data) => request(`/games/${gameId}`, 'PUT', data);

/**
 * Delete a game
 * @param {string} gameId - Game ID
 */
export const deleteGame = (gameId) => request(`/games/${gameId}`, 'DELETE');

// Review-related API endpoints
/**
 * Get all reviews
 * @returns {Promise<Array>} List of all reviews
 */
export const getReviews = () => request('/reviews');

/**
 * Get reviews for a specific game
 * @param {string} gameId - Game ID
 * @returns {Promise<Array>} List of reviews for the game
 */
export const getGameReviews = (gameId) => request(`/reviews/game/${gameId}`);

/**
 * Create a new review
 * @param {string} user - User ID
 * @param {string} game - Game ID
 * @param {number} rating - Rating (typically 1-5)
 * @param {string} comment - Review text
 * @returns {Promise<object>} Created review
 */
export const createReview = (user, game, rating, comment) => request('/reviews', 'POST', { user, game, rating, comment });

/**
 * Delete a review
 * @param {string} reviewId - Review ID
 */
export const deleteReview = (reviewId) => request(`/reviews/${reviewId}`, 'DELETE');

