import 'dotenv/config';
import type { ExpoConfig } from '@expo/config-types';

export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Spotify Underground Finder',
  slug: 'spotify-underground-finder',
  scheme: 'spotify-underground-finder',
  version: '1.0.0',
  orientation: 'portrait',
  platforms: ['ios', 'android', 'web'],
  splash: {
    backgroundColor: '#0F172A',
    resizeMode: 'contain'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ['**/*'],
  extra: {
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyRedirectUri: process.env.SPOTIFY_REDIRECT_URI,
    lastfmApiKey: process.env.LASTFM_API_KEY
  },
  experiments: {
    tsconfigPaths: true
  }
});
