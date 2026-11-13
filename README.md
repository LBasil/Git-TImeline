# Git Timeline

Prototype : une API Node.js qui lit l'historique Git d'un dépôt et un frontend Vue 3 qui affiche les commits.

> État actuel : le backend expose un seul point d'entrée (`GET /api/commits`, les 20 derniers commits) et le frontend les affiche sous forme de liste. La vraie timeline interactive reste à faire.

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

Le backend écoute sur http://localhost:3000. Il lit l'historique du dépôt parent du dossier `backend/`.

## À faire

- Choisir le dépôt à analyser au lieu de lire le dépôt courant
- Pagination au-delà de 20 commits
- Vraie visualisation (branches, merges)
