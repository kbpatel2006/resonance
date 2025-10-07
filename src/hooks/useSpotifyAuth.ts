import { useCallback, useEffect, useMemo, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { Alert } from 'react-native';
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from '../constants/config';

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  issuedAt: number;
}

const defaultScopes = [
  'user-read-email',
  'user-read-private',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
];

export const useSpotifyAuth = () => {
  const [tokenResponse, setTokenResponse] = useState<TokenResponse | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const redirectUri = useMemo(() => {
    if (SPOTIFY_REDIRECT_URI) {
      return SPOTIFY_REDIRECT_URI;
    }

    return AuthSession.makeRedirectUri({
      scheme: 'spotify-underground-finder',
      preferLocalhost: true,
    });
  }, []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: SPOTIFY_CLIENT_ID,
      redirectUri,
      scopes: defaultScopes,
      usePKCE: true,
    },
    discovery
  );

  const fetchUserProfile = useCallback(
    async (accessToken: string) => {
      try {
        const profileResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const profile = await profileResponse.json();
        setUserProfile(profile);
      } catch (error) {
        console.error(error);
        Alert.alert('Spotify', 'Unable to load your profile information.');
      }
    },
    []
  );

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success' && request) {
        try {
          setIsAuthenticating(true);
          const { code } = response.params;
          const tokens = await AuthSession.exchangeCodeAsync(
            {
              clientId: SPOTIFY_CLIENT_ID,
              code,
              redirectUri,
              extraParams: {
                code_verifier: request.codeVerifier || '',
              },
            },
            discovery
          );

          setTokenResponse({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresIn: tokens.expires_in ?? 3600,
            issuedAt: Date.now(),
          });
          await fetchUserProfile(tokens.access_token);
        } catch (error) {
          console.error(error);
          Alert.alert('Spotify', 'Authentication failed. Please try again.');
        } finally {
          setIsAuthenticating(false);
        }
      }
    };

    void handleResponse();
  }, [response, request, redirectUri, fetchUserProfile]);

  const ensureValidToken = useCallback(async () => {
    if (!tokenResponse) {
      return null;
    }

    const { accessToken, expiresIn, issuedAt, refreshToken } = tokenResponse;
    const now = Date.now();
    const isExpired = now - issuedAt >= expiresIn * 1000 - 60000;

    if (!isExpired) {
      return accessToken;
    }

    if (!refreshToken) {
      setTokenResponse(null);
      return null;
    }

    try {
      const refreshed = await AuthSession.refreshAsync(
        {
          clientId: SPOTIFY_CLIENT_ID,
          refreshToken,
        },
        discovery
      );

      const updated: TokenResponse = {
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token ?? refreshToken,
        expiresIn: refreshed.expires_in ?? 3600,
        issuedAt: Date.now(),
      };
      setTokenResponse(updated);
      return updated.accessToken;
    } catch (error) {
      console.error(error);
      setTokenResponse(null);
      Alert.alert('Spotify', 'Session expired. Please sign in again.');
      return null;
    }
  }, [tokenResponse]);

  const signIn = useCallback(async () => {
    if (!SPOTIFY_CLIENT_ID) {
      Alert.alert('Configuration missing', 'Set SPOTIFY_CLIENT_ID in your environment.');
      return;
    }

    try {
      setIsAuthenticating(true);
      await promptAsync();
    } catch (error) {
      console.error(error);
      Alert.alert('Spotify', 'Could not open the login dialog.');
    } finally {
      setIsAuthenticating(false);
    }
  }, [promptAsync]);

  const signOut = useCallback(() => {
    setTokenResponse(null);
    setUserProfile(null);
  }, []);

  return {
    accessToken: tokenResponse?.accessToken ?? null,
    ensureValidToken,
    isAuthenticating,
    signIn,
    signOut,
    userProfile,
  };
};
