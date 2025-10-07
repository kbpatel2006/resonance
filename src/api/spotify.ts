import { SPOTIFY_API_ROOT, UNDERGROUND_POPULARITY_THRESHOLD } from '../constants/config';

export interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  images?: { url: string }[];
  external_urls?: { spotify?: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  popularity: number;
  external_urls?: { spotify?: string };
  artists: SpotifyArtist[];
  album?: { images?: { url: string }[] };
}

const fetchFromSpotify = async <T>(token: string, endpoint: string, options?: RequestInit): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${SPOTIFY_API_ROOT}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (response.status === 204) {
    return {} as T;
  }

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Spotify API error: ${response.status} ${message}`);
  }

  return (await response.json()) as T;
};

export const getUserPlaylists = async (token: string) => {
  const playlists: any[] = [];
  let next: string | null = `${SPOTIFY_API_ROOT}/me/playlists?limit=50`;

  while (next) {
    const page = await fetchFromSpotify<{ items: any[]; next: string | null }>(token, next);
    playlists.push(...page.items);
    next = page.next;
  }

  return playlists;
};

export const getPlaylistTracks = async (token: string, playlistId: string) => {
  const tracks: SpotifyTrack[] = [];
  let next: string | null = `${SPOTIFY_API_ROOT}/playlists/${playlistId}/tracks?limit=100`;

  while (next) {
    const page = await fetchFromSpotify<{ items: { track: SpotifyTrack | null }[]; next: string | null }>(token, next);

    const pageTracks = page.items
      .map((item) => item.track)
      .filter((track): track is SpotifyTrack => Boolean(track));

    tracks.push(...pageTracks);
    next = page.next;
  }

  return tracks;
};

export const searchArtist = async (token: string, query: string) => {
  const data = await fetchFromSpotify<{ artists: { items: SpotifyArtist[] } }>(
    token,
    `/search?type=artist&limit=5&q=${encodeURIComponent(query)}`
  );

  return data.artists.items;
};

export const getRelatedArtists = async (token: string, artistId: string) => {
  const data = await fetchFromSpotify<{ artists: SpotifyArtist[] }>(token, `/artists/${artistId}/related-artists`);
  return data.artists.filter((artist) => artist.popularity < UNDERGROUND_POPULARITY_THRESHOLD);
};

export const getArtistUndergroundTracks = async (token: string, artistName: string) => {
  const data = await fetchFromSpotify<{ tracks: { items: SpotifyTrack[] } }>(
    token,
    `/search?type=track&limit=50&q=${encodeURIComponent(`artist:"${artistName}"`)}`
  );

  return data.tracks.items.filter((track) => track.popularity < UNDERGROUND_POPULARITY_THRESHOLD);
};

export const getArtistByNameWithTracks = async (token: string, artistName: string) => {
  const artists = await searchArtist(token, artistName);
  if (!artists.length) {
    return null;
  }

  const artist = artists[0];
  const undergroundTracks = await getArtistUndergroundTracks(token, artist.name);

  return {
    artist,
    undergroundTracks,
  };
};

export const getPlaylistBasedRecommendations = async (token: string, playlistId: string) => {
  const tracks = await getPlaylistTracks(token, playlistId);
  const seedArtists = Array.from(
    new Set(
      tracks
        .flatMap((track) => track.artists.map((artist) => artist.id))
        .filter(Boolean)
    )
  ).slice(0, 5);

  if (!seedArtists.length) {
    return [];
  }

  const data = await fetchFromSpotify<{ tracks: SpotifyTrack[] }>(
    token,
    `/recommendations?limit=20&seed_artists=${seedArtists.join(',')}`
  );

  return data.tracks.filter((track) => track.popularity < UNDERGROUND_POPULARITY_THRESHOLD);
};

export const getArtistDetails = async (token: string, artistId: string) => {
  return fetchFromSpotify<SpotifyArtist>(token, `/artists/${artistId}`);
};
