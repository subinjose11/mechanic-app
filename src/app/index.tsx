import { View, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';

function Index() {
  const authStore = useAuthStore();

  if (authStore.isLoading || authStore.status === 'idle') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (authStore.isAuthenticated && authStore.user) {
    // Check if shop profile is complete
    if (authStore.needsShopSetup) {
      return <Redirect href="/(auth)/shop-setup" />;
    }
    return <Redirect href="/(main)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}

export default observer(Index);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
