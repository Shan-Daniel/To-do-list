import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from './AuthContext';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7DFF" />
      </View>
    );
  }

  if (!user) {
    return isSignUp ? (
      <SignUpScreen onSwitchToSignIn={() => setIsSignUp(false)} />
    ) : (
      <SignInScreen onSwitchToSignUp={() => setIsSignUp(true)} />
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
