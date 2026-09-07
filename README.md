# Future Assistant

Une assistante personnelle web avec tâches, conversations, mémoire locale, commandes vocales et connexion optionnelle à une IA.

## V2
- Interface de conversation moderne
- Historique de plusieurs conversations conservé dans le navigateur
- Mémoire locale structurée sous forme de notes
- Contexte des derniers messages envoyé à l'IA
- Gestion des tâches depuis le chat
- Commandes vocales via Web Speech API quand le navigateur le permet
- Interface responsive ordinateur/mobile
- Configuration prête pour un déploiement serverless

## Mode local
Ouvre `index.html` dans un navigateur. Les tâches, conversations et notes sont sauvegardées dans `localStorage`. Les commandes locales fonctionnent sans clé API.

## Activer l'IA
Le dossier `api/chat.js` fournit une fonction serverless compatible avec un déploiement comme Vercel.

Ajoute `OPENAI_API_KEY` comme variable d'environnement sur la plateforme de déploiement. Ne mets jamais cette clé dans `index.html`, `app.js` ou dans GitHub.

Le serveur utilise l'API Responses d'OpenAI avec `gpt-5.6-luna`.

## Déploiement
1. Importe ce dépôt dans ton hébergeur compatible avec les fonctions serverless.
2. Configure `OPENAI_API_KEY` dans les variables d'environnement du projet.
3. Déploie la branche `main`.
4. Ouvre l'URL fournie par l'hébergeur.

`vercel.json` est inclus pour préparer le projet à Vercel.

## Architecture
- `index.html` : interface V2
- `style.css` : design responsive
- `app.js` : tâches, conversations, mémoire locale et voix
- `api/chat.js` : passerelle serveur vers l'API IA
- `vercel.json` : configuration de déploiement
