import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { theme, colors } from '@theme/index';
import { RootStoreContext, rootStore } from '@stores/RootStore';
import { authStore } from '@stores/AuthStore';

// Auth navigation guard component
const AuthNavigator = observer(function AuthNavigator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);

  // Initialize the app
  useEffect(() => {
    const init = async () => {
      await rootStore.initialize();
      setIsReady(true);
    };
    init();
  }, []);

  // Handle auth state changes for navigation
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inMainGroup = segments[0] === '(main)';

    if (authStore.status === 'loading') {
      // Still loading, don't navigate
      return;
    }

    if (authStore.isAuthenticated) {
      // User is authenticated
      if (authStore.needsShopSetup) {
        // Need to complete shop setup
        if (segments.join('/') !== '(auth)/shop-setup') {
          router.replace('/(auth)/shop-setup');
        }
      } else if (inAuthGroup) {
        // User is authenticated but in auth group, redirect to main
        router.replace('/(main)/home');
      }
    } else if (authStore.status === 'unauthenticated') {
      // User is not authenticated
      if (!inAuthGroup || segments.join('/') === '(auth)/shop-setup') {
        // Redirect to login if not in auth group or if on shop-setup
        router.replace('/(auth)/login');
      }
    }
  }, [isReady, authStore.status, authStore.isAuthenticated, authStore.needsShopSetup, segments]);

  // Subscribe to user data when authenticated
  useEffect(() => {
    if (authStore.isAuthenticated && authStore.userId && !authStore.needsShopSetup) {
      rootStore.subscribeToUserData(authStore.userId);
    }
  }, [authStore.isAuthenticated, authStore.userId, authStore.needsShopSetup]);

  return <>{children}</>;
});

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <RootStoreContext.Provider value={rootStore}>
          <PaperProvider theme={theme}>
            <AuthNavigator>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                  animation: 'fade_from_bottom',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(main)" />
                <Stack.Screen name="create-order" />
                <Stack.Screen name="order-detail" />
                <Stack.Screen name="customer-detail" />
                <Stack.Screen name="vehicle-detail" />
                <Stack.Screen name="vehicle-new" />
                <Stack.Screen name="customer-new" />
                <Stack.Screen name="quick-add" />
              </Stack>
            </AuthNavigator>
          </PaperProvider>
        </RootStoreContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default observer(RootLayout);
