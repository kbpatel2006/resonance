import Constants from 'expo-constants';

const config = Constants.expoConfig?.extra ?? {};

export const SPOTIFY_CLIENT_ID = (config.spotifyClientId as string) ?? '';
export const SPOTIFY_REDIRECT_URI = (config.spotifyRedirectUri as string) ?? '';
export const LASTFM_API_KEY = (config.lastfmApiKey as string) ?? '';

export const LASTFM_API_ROOT = 'https://ws.audioscrobbler.com/2.0/';
export const SPOTIFY_API_ROOT = 'https://api.spotify.com/v1';

export const UNDERGROUND_POPULARITY_THRESHOLD = 40;
