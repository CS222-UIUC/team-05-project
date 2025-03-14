const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// get API router
app.use("/api/games", require("./routes/games"));
app.use("/api/users", require("./routes/users"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/recommendations", require("./routes/recommendations"));

app.get("/", (req, res) => {
    res.send("GameRec web API active！");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
