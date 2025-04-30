require('dotenv').config();
const path          = require('path');
const express       = require('express');
const cors          = require('cors');
const session       = require('express-session');
const passport      = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const connectDB     = require('./db');
const axios       = require('axios');
const Game        = require('./models/game');
const User        = require('./models/user');
const Review        = require('./models/review');

const app = express();
connectDB();

app.use(express.json());
app.use(cors({
    origin: (origin, cb) => {
    // allow requests from Live-Server, vite, 127.0.0.1, localhost, etc.
    if (!origin || /^(http:\/\/)?(localhost|127\.0\.0\.1):\d{4,5}$/i.test(origin)) {
    return cb(null, true);
    }
    cb(new Error('CORS not allowed from ' + origin));
    },
    credentials: true,
    optionsSuccessStatus: 200 // some older browsers choke on 204
  }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.serializeUser((u, done) => done(null, u));
  passport.deserializeUser((u, done) => done(null, u));
  
  passport.use(new SteamStrategy({
      returnURL: process.env.BASE_URL + '/auth/steam/return',
      realm:     process.env.BASE_URL + '/',
      apiKey:    process.env.STEAM_API_KEY,
      stateless: true
    },
    (identifier, profile, done) => {
      return done(null, { steamId: profile.id, displayName: profile.displayName });
    }
  ));
  
  app.get(
    '/auth/steam',
    (req, res, next) => {
      req.session.returnTo = req.query.returnUrl;
      next();
    },
    passport.authenticate('steam')
  );

  app.get(
    '/auth/steam/return',
    passport.authenticate('steam', { failureRedirect: '/' }),
    async (req, res) => {
        console.log('Steam return, steamId=', req.user.steamId);
        const steamId = req.user.steamId;
        const ownedResp = await axios.get(
          'http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
            params: {
              key: process.env.STEAM_API_KEY,
              steamid: steamId,
              include_appinfo: 1,
              include_played_free_games: 1
            }
          }
        );
        const games = ownedResp.data.response.games || [];
        console.log(`get ${games.length} games`);
        const libraryIds = [];
    
        for (const g of games) {
            const infoResp = await axios.get(
                `https://store.steampowered.com/api/appdetails?appids=${g.appid}&cc=us&l=en`,
                { headers:{ 'User-Agent':'Mozilla/5.0' } }
              );
              const info = infoResp.data[g.appid].data;
              if (!info || !info.name) continue;
        
              const revResp = await axios.get(
                `https://store.steampowered.com/appreviews/${g.appid}` +
                `?json=1&filter=all&num_per_page=1`,
                { headers:{ 'User-Agent':'Mozilla/5.0' } }
              );
              const qs = revResp.data.query_summary || {};
              const ratio = qs.total_reviews
                ? qs.total_positive/qs.total_reviews
                : 0;
              const rating = parseFloat((ratio*5).toFixed(2));
        
              // Upsert by title
              const game = await Game.findOneAndUpdate(
                { title: info.name },
                {
                  $setOnInsert: {
                    steam_appid:  g.appid,
                    genre:        Array.isArray(info.genres)
                                     ? info.genres.map(x=>x.description)
                                     : [],
                    release_date: info.release_date?.date
                                     ? new Date(info.release_date.date)
                                     : null,
                    rating,
                    describe:     info.short_description || '',
                    cover_url:    info.header_image || ''
                  }
                },
                { upsert: true, new: true }
              );
        
              libraryIds.push(game._id);
            }
        
            req.session.libraryGameIds = libraryIds;
        
            res.redirect('http://localhost:5500/frontend/html/favorites.html?imported=1');
          }
        );
    
    app.get('/api/library', (req, res) => {
      const ids = req.session.libraryGameIds || [];
      Game.find({ _id: { $in: ids } })
          .then(games => res.json(games))
          .catch(err => res.status(500).json({ error: err.message }));
    });
    
    app.post('/api/favorites/bulk-add', async (req, res) => {
      const userId = req.body.userId;
      const ids    = req.session.libraryGameIds || [];
      const user = await User.findById(userId);
      user.favorites = Array.from(new Set([
        ...user.favorites.map(x => x.toString()),
        ...ids.map(x => x.toString())
      ]));
      await user.save();
      res.json({ added: ids.length, totalFavorites: user.favorites.length });
    });

// get API router
app.use("/api/games", require("./routes/games"));
app.use("/api/users", require("./routes/users"));
app.use("/api/reviews", require("./routes/reviews"));

app.get("/", (req, res) => {
    res.send("GameRec web API active！");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
