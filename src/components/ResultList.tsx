import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SpotifyArtist, SpotifyTrack } from '../api/spotify';

interface ResultListProps {
  artists?: SpotifyArtist[];
  tracks?: SpotifyTrack[];
}

const openSpotifyLink = (url?: string) => {
  if (!url) {
    return;
  }

  void Linking.openURL(url);
};

export const ResultList = ({ artists = [], tracks = [] }: ResultListProps) => {
  return (
    <View style={styles.container}>
      {artists.map((artist) => (
        <TouchableOpacity
          key={artist.id}
          onPress={() => openSpotifyLink(artist.external_urls?.spotify)}
          style={styles.item}
        >
          <Text style={styles.itemTitle}>{artist.name}</Text>
          <Text style={styles.meta}>Popularity: {artist.popularity}</Text>
          {artist.genres?.length ? <Text style={styles.meta}>Genres: {artist.genres.slice(0, 3).join(', ')}</Text> : null}
          <Text style={styles.link}>Listen on Spotify</Text>
        </TouchableOpacity>
      ))}

      {tracks.map((track) => (
        <TouchableOpacity
          key={track.id}
          onPress={() => openSpotifyLink(track.external_urls?.spotify)}
          style={styles.item}
        >
          <Text style={styles.itemTitle}>{track.name}</Text>
          <Text style={styles.meta}>
            {track.artists.map((artist) => artist.name).join(', ')} · Popularity {track.popularity}
          </Text>
          <Text style={styles.link}>Listen on Spotify</Text>
        </TouchableOpacity>
      ))}

      {!artists.length && !tracks.length ? <Text style={styles.empty}>No results yet.</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  item: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 12,
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  meta: {
    color: '#CBD5F5',
  },
  link: {
    color: '#34D399',
    marginTop: 8,
    fontWeight: '500',
  },
  empty: {
    color: '#CBD5F5',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
