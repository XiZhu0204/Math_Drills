const express = require('express');
const path = require('path');

const app = express();

// Static folder
app.use(express.static(path.join(__dirname, 'pages')));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})