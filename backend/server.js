const express = require('express');
const cors = require('cors');
const git = require('isomorphic-git');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// ✅ Autoriser toutes les origines (simple pour dev)
app.use(cors());

const repoPath = path.join(__dirname, '..');

app.get('/api/commits', async (req, res) => {
  try {
    const commits = await git.log({
      fs,
      dir: repoPath,
      depth: 20 // on limite pour l'instant
    });

    const formatted = commits.map(c => ({
      oid: c.oid,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.timestamp * 1000
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible de lire les commits' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
