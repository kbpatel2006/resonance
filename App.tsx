import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FeatureCard } from './src/components/FeatureCard';
import { ResultList } from './src/components/ResultList';
import { useSpotifyAuth } from './src/hooks/useSpotifyAuth';
import { getUserTopArtists } from './src/api/lastfm';
import {
  SpotifyArtist,
  SpotifyTrack,
  getArtistByNameWithTracks,
  getPlaylistBasedRecommendations,
  getRelatedArtists,
  getUserPlaylists,
  searchArtist,
  getArtistUndergroundTracks,
} from './src/api/spotify';

export default function App() {
  const { accessToken, ensureValidToken, isAuthenticating, signIn, signOut, userProfile } = useSpotifyAuth();

  const [lastFmUsername, setLastFmUsername] = useState('');
  const [lastFmRecommendations, setLastFmRecommendations] = useState<SpotifyArtist[]>([]);
  const [lastFmLoading, setLastFmLoading] = useState(false);

  const [artistQuery, setArtistQuery] = useState('');
  const [artistRecommendations, setArtistRecommendations] = useState<SpotifyArtist[]>([]);
  const [artistLoading, setArtistLoading] = useState(false);

  const [favoriteArtist, setFavoriteArtist] = useState('');
  const [favoriteTracks, setFavoriteTracks] = useState<SpotifyTrack[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [playlists, setPlaylists] = useState<any[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>('');
  const [playlistRecommendations, setPlaylistRecommendations] = useState<SpotifyTrack[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const withToken = useCallback(async () => {
    const token = await ensureValidToken();
    if (!token) {
      Alert.alert('Spotify', 'Please sign in to Spotify to continue.');
    }
    return token;
  }, [ensureValidToken]);

  const handleLastFmRecommendations = useCallback(async () => {
    if (!lastFmUsername.trim()) {
      Alert.alert('Last.fm', 'Enter your Last.fm username to continue.');
      return;
    }

    const token = await withToken();
    if (!token) {
      return;
    }

    try {
      setLastFmLoading(true);
      setErrorMessage(null);
      const topArtists = await getUserTopArtists(lastFmUsername.trim());
      const relatedArtists: SpotifyArtist[] = [];

      for (const artistName of topArtists) {
        const spotifyArtists = await searchArtist(token, artistName);
        if (!spotifyArtists.length) {
          continue;
        }

        const underground = await getRelatedArtists(token, spotifyArtists[0].id);
        relatedArtists.push(...underground);
      }

      const unique = Array.from(new Map(relatedArtists.map((artist) => [artist.id, artist])).values()).slice(0, 20);
      setLastFmRecommendations(unique);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? 'Unable to load recommendations from Last.fm.');
    } finally {
      setLastFmLoading(false);
    }
  }, [lastFmUsername, withToken]);

  const handleArtistRecommendations = useCallback(async () => {
    if (!artistQuery.trim()) {
      Alert.alert('Search', 'Enter an artist name to get recommendations.');
      return;
    }

    const token = await withToken();
    if (!token) {
      return;
    }

    try {
      setArtistLoading(true);
      setErrorMessage(null);
      const artists = await searchArtist(token, artistQuery.trim());
      if (!artists.length) {
        setArtistRecommendations([]);
        Alert.alert('Spotify', 'No artists found. Try another search.');
        return;
      }

      const related = await getRelatedArtists(token, artists[0].id);
      setArtistRecommendations(related);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? 'Unable to fetch artist recommendations.');
    } finally {
      setArtistLoading(false);
    }
  }, [artistQuery, withToken]);

  const handleFavoriteArtistTracks = useCallback(async () => {
    if (!favoriteArtist.trim()) {
      Alert.alert('Artist', 'Enter your favorite artist.');
      return;
    }

    const token = await withToken();
    if (!token) {
      return;
    }

    try {
      setFavoriteLoading(true);
      setErrorMessage(null);
      const data = await getArtistByNameWithTracks(token, favoriteArtist.trim());

      if (!data) {
        setFavoriteTracks([]);
        Alert.alert('Spotify', 'No tracks found for that artist.');
        return;
      }

      if (!data.undergroundTracks.length) {
        const fallback = await getArtistUndergroundTracks(token, data.artist.name);
        setFavoriteTracks(fallback);
      } else {
        setFavoriteTracks(data.undergroundTracks);
      }
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? 'Unable to load underground tracks.');
    } finally {
      setFavoriteLoading(false);
    }
  }, [favoriteArtist, withToken]);

  const handlePlaylistRecommendations = useCallback(async () => {
    if (!selectedPlaylist) {
      Alert.alert('Playlists', 'Select one of your playlists first.');
      return;
    }

    const token = await withToken();
    if (!token) {
      return;
    }

    try {
      setPlaylistLoading(true);
      setErrorMessage(null);
      const recommendations = await getPlaylistBasedRecommendations(token, selectedPlaylist);
      setPlaylistRecommendations(recommendations);
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.message ?? 'Unable to fetch playlist-based recommendations.');
    } finally {
      setPlaylistLoading(false);
    }
  }, [selectedPlaylist, withToken]);

  useEffect(() => {
    const loadPlaylists = async () => {
      if (!accessToken) {
        setPlaylists([]);
        return;
      }

      try {
        const token = await withToken();
        if (!token) {
          return;
        }

        const data = await getUserPlaylists(token);
        setPlaylists(data);
        if (data.length) {
          setSelectedPlaylist(data[0].id);
        }
      } catch (error: any) {
        console.error(error);
        setErrorMessage(error.message ?? 'Unable to load playlists.');
      }
    };

    void loadPlaylists();
  }, [accessToken, withToken]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Spotify Underground Finder</Text>
        <Text style={styles.subheading}>
          Discover lesser-known artists and tracks tailored to your taste. Connect your Spotify account to get started.
        </Text>

        <View style={styles.authRow}>
          {userProfile ? (
            <View style={styles.profileRow}>
              <Text style={styles.profileName}>Signed in as {userProfile.display_name ?? userProfile.id}</Text>
              <Button title="Sign out" onPress={signOut} color="#f97316" />
            </View>
          ) : (
            <Button title={isAuthenticating ? 'Opening Spotify…' : 'Sign in with Spotify'} onPress={signIn} disabled={isAuthenticating} />
          )}
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <FeatureCard
          title="1. Last.fm-powered Underground Picks"
          description="Connect your Spotify account, enter your Last.fm username, and we will surface related underground artists based on your listening history."
        >
          <TextInput
            placeholder="Last.fm username"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={lastFmUsername}
            onChangeText={setLastFmUsername}
          />
          <Button title="Find underground matches" onPress={handleLastFmRecommendations} disabled={lastFmLoading} />
          {lastFmLoading ? <ActivityIndicator color="#38bdf8" /> : null}
          <ResultList artists={lastFmRecommendations} />
        </FeatureCard>

        <FeatureCard
          title="2. Related Underground Artists"
          description="Search any artist to uncover similar acts flying under the radar."
        >
          <TextInput
            placeholder="Artist name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={artistQuery}
            onChangeText={setArtistQuery}
          />
          <Button title="Get recommendations" onPress={handleArtistRecommendations} disabled={artistLoading} />
          {artistLoading ? <ActivityIndicator color="#38bdf8" /> : null}
          <ResultList artists={artistRecommendations} />
        </FeatureCard>

        <FeatureCard
          title="3. Hidden Gems from Your Favorite Artist"
          description="We will dig into an artist's catalog to surface songs with lower popularity and streams."
        >
          <TextInput
            placeholder="Favorite artist"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={favoriteArtist}
            onChangeText={setFavoriteArtist}
          />
          <Button title="Find underground songs" onPress={handleFavoriteArtistTracks} disabled={favoriteLoading} />
          {favoriteLoading ? <ActivityIndicator color="#38bdf8" /> : null}
          <ResultList tracks={favoriteTracks} />
        </FeatureCard>

        <FeatureCard
          title="4. Playlist-based Discoveries"
          description="Choose one of your playlists and we'll recommend underground tracks inspired by it."
        >
          {accessToken ? (
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedPlaylist}
                onValueChange={(value) => setSelectedPlaylist(value)}
                dropdownIconColor="#F8FAFC"
                style={styles.picker}
              >
                {playlists.map((playlist) => (
                  <Picker.Item label={playlist.name} value={playlist.id} key={playlist.id} color="#0F172A" />
                ))}
              </Picker>
            </View>
          ) : (
            <Text style={styles.hint}>Sign in with Spotify to load your playlists.</Text>
          )}
          <Button title="Get underground recommendations" onPress={handlePlaylistRecommendations} disabled={playlistLoading} />
          {playlistLoading ? <ActivityIndicator color="#38bdf8" /> : null}
          <ResultList tracks={playlistRecommendations} />
        </FeatureCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    padding: 20,
    paddingBottom: 48,
    backgroundColor: '#020617',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subheading: {
    color: '#CBD5F5',
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 22,
  },
  authRow: {
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileName: {
    color: '#F8FAFC',
    fontWeight: '500',
    flex: 1,
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pickerWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#0F172A',
  },
  hint: {
    color: '#94A3B8',
    marginBottom: 12,
  },
  error: {
    color: '#f87171',
    marginBottom: 16,
  },
});
