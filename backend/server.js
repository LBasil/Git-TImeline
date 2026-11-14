const express = require('express');
const cors = require('cors');
const path = require('path');
const { listBranches, currentBranch, listCommits } = require('./git');

/**
 * Crée l'application Express pour un dépôt donné.
 * Le dépôt est fixé au démarrage (variable REPO_PATH) : l'API n'accepte aucun chemin du client,
 * pour ne pas pouvoir lire d'autres dossiers de la machine.
 */
function createApp(repoPath) {
  const app = express();
  app.use(cors());

  app.get('/api/branches', async (req, res) => {
    try {
      res.json({ current: await currentBranch(repoPath), branches: await listBranches(repoPath) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Impossible de lire les branches' });
    }
  });

  app.get('/api/commits', async (req, res) => {
    try {
      const { ref, limit, skip } = req.query;
      res.json(await listCommits(repoPath, { ref, limit, skip }));
    } catch (err) {
      if (err.status === 400) return res.status(400).json({ error: err.message });
      console.error(err);
      res.status(500).json({ error: 'Impossible de lire les commits' });
    }
  });

  return app;
}

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  const repoPath = path.resolve(process.env.REPO_PATH || path.join(__dirname, '..'));
  createApp(repoPath).listen(PORT, () => {
    console.log(`Backend sur http://localhost:${PORT} (dépôt : ${repoPath})`);
  });
}

module.exports = { createApp };
