import { Tabs, router } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors } from '@theme/colors';

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom;

  return (
    <Tabs
      sceneStyle={{ backgroundColor: colors.background }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.systemGray,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={60}
              tint="dark"
              style={StyleSheet.absoluteFill}
            >
              <View style={[StyleSheet.absoluteFill, styles.tabBarOverlay]} />
            </BlurView>
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarAndroid]} />
          ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(148,163,184,0.08)',
          height: 56 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
    >
      {/* Main 3 Tabs */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon source={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, focused }) => (
            <Icon source={focused ? 'clipboard-text' : 'clipboard-text-outline'} size={26} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Always navigate to jobs index when tab is pressed
            e.preventDefault();
            router.replace('/(main)/orders');
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Icon source={focused ? 'cog' : 'cog-outline'} size={26} color={color} />
          ),
        }}
      />

      {/* Hidden screens - accessed through navigation only */}
      <Tabs.Screen
        name="customers"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="appointments"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="expenses"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="quick-add"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarOverlay: {
    backgroundColor: 'rgba(6,6,10,0.85)',
  },
  tabBarAndroid: {
    backgroundColor: colors.background,
  },
});
