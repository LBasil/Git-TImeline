const express = require('express');
const app = express();
app.get('/api/test', (req, res) => res.json({ msg: 'Backend OK' }));
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

