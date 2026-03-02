import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { colors } from '@theme/colors';

export default function Index() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated && user) {
    // Check if shop profile is complete
    if (!user.shopName || !user.shopPhone || !user.shopAddress) {
      return <Redirect href="/(auth)/shop-setup" />;
    }
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
