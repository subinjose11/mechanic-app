import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { colors } from '@theme/colors';
import { glass } from '@theme/glass';

export default function MainLayout() {
  const insets = useSafeAreaInsets();

  // Calculate bottom padding for Android navigation bar
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom;

  const tabBarConfig = glass.tabBar;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textDisabled,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={tabBarConfig.blurIntensity}
              tint={tabBarConfig.blurTint}
              style={StyleSheet.absoluteFill}
            >
              <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarConfig.backgroundColor }]} />
            </BlurView>
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: tabBarConfig.backgroundColor }]} />
          ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: tabBarConfig.borderWidth,
          borderTopColor: tabBarConfig.borderColor,
          height: 70 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          paddingHorizontal: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          borderRadius: 14,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Icon source="home" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Icon source="account-group" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Icon source="clipboard-list" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehicles',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Icon source="car" size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrap : undefined}>
              <Icon source="cog" size={20} color={color} />
            </View>
          ),
        }}
      />
      {/* Hidden screens - accessed through navigation */}
      <Tabs.Screen
        name="appointments"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconWrap: {
    backgroundColor: colors.primaryDim,
    borderRadius: 10,
    padding: 6,
    marginBottom: -6,
  },
});
