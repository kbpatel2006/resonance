# Spotify Underground Finder

A React Native (Expo) mobile app that helps you uncover underground artists and tracks on Spotify using a mix of Spotify and Last.fm data.

## Features

1. **Last.fm powered suggestions** – authenticate with Spotify, enter your Last.fm username, and receive underground artist recommendations based on your listening history.
2. **Artist-based exploration** – input any artist and discover related acts with Spotify popularity under 40.
3. **Hidden gems from favourites** – surface lesser-known songs by your favourite artists.
4. **Playlist intelligence** – pick one of your Spotify playlists and get underground artist and track recommendations tailored to it.
5. **Quick listening** – every result includes a "Listen on Spotify" deep link.

The UI is designed to be clean, mobile-first, and friendly to use.

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- Spotify Developer account with a registered application
- Last.fm API key

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create your environment file**

   Duplicate `.env.example` and fill in your credentials:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   | --- | --- |
   | `SPOTIFY_CLIENT_ID` | Client ID from your Spotify application |
   | `SPOTIFY_REDIRECT_URI` | Redirect URI registered for your Spotify app (e.g. `spotify-underground-finder://redirect`) |
   | `LASTFM_API_KEY` | Your Last.fm API key |

3. **Update Spotify app settings**

   - Add the redirect URI you used above to your Spotify app's list of redirect URIs.
   - Enable the following scopes: `user-read-email`, `user-read-private`, `playlist-read-private`, `playlist-read-collaborative`, `user-library-read`.

4. **Run the app**

   ```bash
   npm run start
   ```

   Then follow the Expo CLI instructions to open the app on iOS, Android, or web.

## Project Structure

```
├── App.tsx                  # Main application with UI and feature orchestration
├── src
│   ├── api
│   │   ├── lastfm.ts        # Last.fm API helpers
│   │   └── spotify.ts       # Spotify API helpers and models
│   ├── components
│   │   ├── FeatureCard.tsx  # Simple card wrapper for each feature
│   │   └── ResultList.tsx   # Reusable list rendering artists/tracks with Spotify links
│   ├── constants
│   │   └── config.ts        # Shared constants and thresholds
│   └── hooks
│       └── useSpotifyAuth.ts# Spotify OAuth flow handled with expo-auth-session
├── app.config.ts            # Expo configuration with environment variables
├── tsconfig.json
└── package.json
```

## Notes

- The app uses Spotify's PKCE OAuth flow, so a client secret is not required on mobile.
- Last.fm requests rely on the username you provide. Make sure the account is scrobbling your Spotify listening history so the recommendations feel personal.
- All Spotify data is filtered using a popularity threshold of **40** to emphasise underground content.
- Error handling and messaging are included, but you should still expect rate limits if you make a large number of requests quickly.

## Testing

This project currently relies on manual testing through the Expo client. Add automated tests (e.g., Jest + React Native Testing Library) as the codebase grows.
