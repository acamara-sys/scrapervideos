# ScraperVideos

Outil Next.js pour rechercher des vidéos YouTube et les publier automatiquement sur WordPress via Playwright.

## Installation

```bash
npm install
npx playwright install chromium
```

## Variables d'environnement

Crée un fichier `.env` à la racine :

```env
API_KEY=ta_clé_youtube_data_api_v3
WordPress=https://ton-site.com/wp-admin/post-new.php?post_type=video
```

- `API_KEY` — clé YouTube Data API v3 ([console.developers.google.com](https://console.developers.google.com))
- `WordPress` — URL de création de post sur ton WordPress (non utilisée dans le code pour l'instant, la cible est hardcodée dans `app/api/publish/route.ts`)

## Commandes

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur en développement sur `localhost:3000` |
| `npm run build` | Compile le projet pour la production |
| `npm run start` | Démarre le serveur de production (après `build`) |
| `npm run lint` | Vérifie le code avec ESLint |

## Fonctionnement

1. **Recherche** — l'app interroge l'API YouTube pour trouver des vidéos par mot-clé
2. **Sélection** — tu choisis une vidéo dans l'interface
3. **Publication** — Playwright ouvre un navigateur, va sur WordPress et remplit le formulaire automatiquement

### Profile Playwright

La première fois, Playwright crée un dossier `chrome-profile/` à la racine pour conserver ta session WordPress (pas besoin de te reconnecter à chaque fois).

## Structure des routes API

| Route | Méthode | Rôle |
|---|---|---|
| `/api/youtube` | `GET ?keyword=...` | Recherche des vidéos YouTube |
| `/api/publish` | `POST` | Publie une vidéo sur WordPress |

### Body de `/api/publish`

```json
{
  "title": "Titre de la vidéo",
  "videoId": "dQw4w9WgXcQ",
  "duration": "3:32",
  "miniature": "https://...",
  "collection_sesport": true,
  "genre_football": true,
  "profile": "Nom du profil"
}
```
