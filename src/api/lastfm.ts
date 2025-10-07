import { LASTFM_API_KEY, LASTFM_API_ROOT } from '../constants/config';

interface LastFmTopArtist {
  name: string;
  playcount: string;
}

interface LastFmTopArtistsResponse {
  topartists: {
    artist: LastFmTopArtist[];
  };
}

export const getUserTopArtists = async (username: string, limit = 10) => {
  if (!LASTFM_API_KEY) {
    throw new Error('Missing LASTFM_API_KEY. Please configure your environment variables.');
  }

  const url = `${LASTFM_API_ROOT}?method=user.gettopartists&user=${encodeURIComponent(username)}&api_key=${LASTFM_API_KEY}&format=json&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Last.fm API error: ${response.status} ${message}`);
  }

  const data = (await response.json()) as LastFmTopArtistsResponse;
  return data.topartists.artist.map((artist) => artist.name);
};
