# GameRec: Personalized Game Recommendation Platform

## Summary

**GameRec** is a personalized game recommendation web application that integrates with Steam and MongoDB to deliver tailored game suggestions to users.
- When **not logged in**, users are prompted to sign in to access recommendations.
- When **logged in without favorites**, users are encouraged to favorite games.
- When **logged in with favorites**, the system displays up to 10 content-based recommendations (excluding favorited games), followed by a full list of other games sorted by rating.
- Both recommended and all games are visually separated and displayed in responsive grids.

---

## Technical Architecture

![Architecture Diagram](./backend/Project%20Architecture%20Diagram.png)

### 1. Frontend
- Built with **HTML, CSS, and JavaScript**
- Calls:
  - `/api/games/recommend/content/:userId` – to fetch recommended games
  - `/api/users/:userId/favorites` – to get user’s favorite game IDs
  - `/api/games` – to retrieve all game data
- Displays:
  - A recommendation section (up to 10)
  - A complete list of remaining games sorted by rating

### 2. Backend
- **Node.js** with **Express**
- Game data and user data stored in **MongoDB**
- Content-based recommendation engine:
  - Uses favorited games to generate a user genre profile
  - Scores non-favorited games based on genre overlap (70%) and normalized rating (30%)
- Optionally pulls Steam library data using the Steam API

### 3. Data Flow
- User loads `main.html` → script checks login state
- If authenticated → fetch recommendations and favorites
- Display recommended games (if any), then render full game list sorted by rating (excluding already recommended ones)

---

## Environment & Setup

### Requirements
- Node.js v16+
- MongoDB (Atlas or local instance)
- Live Server (VS Code Extension)

### 1. Install dependencies and navigate to your source directory
- Install node.js on *https://nodejs.org/en*.
- Install VS Code extension named **"Live Server"** by *Ritwick Dey*.
- Then direct to the proper directory(The folder which contains `.env` and `main.html`)
```bash
cd YourSourceDirectoryPath
```

### 2. Start backend server
```bash
node backend/server.js
```

### 3. Run frontend
After installed the **"Live Server"** extension in VS Code, right-click on `main.html` and select **"Open with Live Server"**.

---

## Group Members & Roles

- **Jerry Lei** – Frontend UI & frontend-backend integration
- **Henry Xu** – Steam API & MongoDB integration with authentication
- **Ziheng Chen** – Documentation & testing
- **Eric Liu** – Recommendation algorithm & project summary
