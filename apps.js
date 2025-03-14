const express = require('express');
const app = express();
const recommendationsRouter = require('./routes/recommendations');

app.use(express.json());

// use recommendation router
app.use('/api', recommendationsRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});