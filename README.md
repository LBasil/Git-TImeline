# Git Timeline

Un outil de visualisation Git (mini GitKraken-like) développé en **Node.js + Vue.js**.

## 🚀 Fonctionnalités
- Visualisation des commits en timeline
- API Node.js pour extraire les données Git (via isomorphic-git)
- Frontend Vue 3 (Vite) pour l'affichage interactif
- Workflow dev simplifié (un seul `npm run dev`)

## 🛠️ Installation

```bash
# Cloner le repo
git clone https://github.com/<ton-user>/git-timeline.git
cd git-timeline

# Installer les dépendances
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Lancer le projet
npm run dev
