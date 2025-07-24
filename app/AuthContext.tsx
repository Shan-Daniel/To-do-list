import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Store user state in AsyncStorage for persistence
      if (user) {
        AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        AsyncStorage.removeItem('user');
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Dynamically import to avoid issues in web/Node
      const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
      const { makeRedirectUri } = await import('expo-auth-session');
      const { openAuthSessionAsync } = await import('expo-web-browser');

      // Use Expo Constants to read config from app.json
      const Constants = (await import('expo-constants')).default;
      const expoClientId = Constants.expoConfig?.extra?.expoClientId || Constants.manifest?.extra?.expoClientId;

      if (!expoClientId) {
        throw new Error('Missing Google Web Client ID in app.json (extra.expoClientId)');
      }

      // Build redirect URI for Expo Go
      const redirectUri = makeRedirectUri({ useProxy: true });

      // Build Google OAuth URL for id_token
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${expoClientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=openid%20profile%20email` +
        `&nonce=${Math.random().toString(36).substring(2)}`;

      // Start the authentication session
      const result = await openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== 'success' || !result.url) {
        throw new Error('Google sign-in cancelled or failed');
      }

      // Extract id_token from result URL
      const match = result.url.match(/id_token=([^&]+)/);
      if (!match) {
        throw new Error('No ID token returned from Google');
      }

      const idToken = decodeURIComponent(match[1]);

      // Use id_token for Firebase
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message || 'Google sign-in failed');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
