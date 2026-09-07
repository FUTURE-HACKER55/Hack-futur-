# Future Assistant

Une assistante personnelle web simple, avec tâches, mémoire locale, chat et commandes vocales.

## Fonctionnalités
- Liste de tâches avec priorités
- Barre de progression
- Mémoire / notes locales
- Chat avec commandes rapides
- Commandes vocales via Web Speech API quand le navigateur le permet
- Connexion optionnelle à une API IA côté serveur
- Interface responsive

## Mode local
Ouvre `index.html` dans un navigateur. Les tâches et notes sont sauvegardées dans `localStorage`. Les commandes locales fonctionnent sans clé API.

## Activer l'IA
Le dossier `api/chat.js` est prévu pour un déploiement compatible avec les fonctions serverless, par exemple Vercel.

Définis la variable d'environnement `OPENAI_API_KEY` sur la plateforme de déploiement. Ne mets jamais cette clé dans `index.html`, `app.js` ou dans le dépôt GitHub.

Le serveur utilise l'API Responses d'OpenAI et le modèle `gpt-5.6-luna`.

## Architecture
- `index.html` : interface
- `style.css` : design responsive
- `app.js` : tâches, mémoire, chat local et voix
- `api/chat.js` : passerelle serveur vers l'API IA
