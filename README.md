# Git Timeline

Prototype : une API Node.js qui lit l'historique Git d'un dépôt et un frontend Vue 3 qui affiche les commits.

> État actuel : l'API expose les branches et les commits paginés d'un dépôt, le frontend affiche la liste avec sélecteur de branche, filtre et "Charger plus". La visualisation graphique des branches et merges reste à faire.

## Stack

- Backend : Node.js, Express 5, [isomorphic-git](https://isomorphic-git.org/)
- Frontend : Vue 3, Vite

## Installation

```bash
git clone https://github.com/LBasil/Git-TImeline.git
cd Git-TImeline
npm install
npm install --prefix backend
npm install --prefix frontend
npm run dev
```

Le backend écoute sur http://localhost:3000. Par défaut il lit le dépôt parent du dossier `backend/` ; pour en analyser un autre :

```bash
REPO_PATH=/chemin/vers/un/depot npm run dev
```

Le chemin est fixé au démarrage : l'API n'accepte aucun chemin envoyé par le client, pour ne pas exposer d'autres dossiers de la machine.

## API

- `GET /api/branches` : `{ current, branches }`
- `GET /api/commits?ref=<branche>&limit=<1-100>&skip=<n>` : `{ branch, hasMore, commits }`. `ref` doit être une branche existante, sinon 400.

## Tests

```bash
npm test --prefix backend
```

Les tests construisent un dépôt Git temporaire avec isomorphic-git et appellent l'API réelle (pagination, autre branche, paramètres invalides).

## À faire

- Vraie visualisation (branches, merges)
- Changer de dépôt depuis l'interface
