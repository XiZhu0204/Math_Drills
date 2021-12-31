const express = require('express');
const path = require('path');
require('dotenv/config');
const mongoose = require('mongoose');

// Creates server to listen for events on port 5000
const app = express();

// DB
mongoose.connect(
    process.env.DB_CONNECTION,
    {useNewUrlParser: true, useUnifiedTopology: true},
    () => console.log("Connected to DB")
);
const user_performance = require('./models/user_performance');

// Static folder
app.use(express.static(path.join(__dirname, 'pages'), {extensions: ['html']}));

app.use(express.urlencoded({extended:true}));

// API
app.use('/api/users', require('./api/users'));
app.use('/api/performance', require('./api/performance'));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

