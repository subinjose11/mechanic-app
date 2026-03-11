import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard } from '@presentation/components/common';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { colors } from '@theme/colors';
import { env } from '@core/config/env';

interface SettingItem {
  icon: string;
  label: string;
  description?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const settingSections: { title: string; items: SettingItem[] }[] = [
    {
      title: 'Shop',
      items: [
        {
          icon: 'store',
          label: 'Shop Profile',
          description: user?.shopName || 'Set up your shop details',
          onPress: () => router.push('/(main)/settings/shop-profile'),
        },
      ],
    },
    {
      title: 'Business',
      items: [
        {
          icon: 'account-group',
          label: 'Customers',
          description: 'Manage your customers',
          onPress: () => router.push('/(main)/customers'),
        },
        {
          icon: 'wallet',
          label: 'Expenses',
          description: 'Track shop expenses',
          onPress: () => router.push('/(main)/expenses'),
        },
        {
          icon: 'chart-bar',
          label: 'Analytics',
          description: 'View business reports',
          onPress: () => router.push('/(main)/analytics'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'bell',
          label: 'Notifications',
          description: 'Manage notification preferences',
          onPress: () => {},
        },
        {
          icon: 'palette',
          label: 'Appearance',
          description: 'Light mode',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help-circle',
          label: 'Help & FAQ',
          onPress: () => {},
        },
        {
          icon: 'message-text',
          label: 'Send Feedback',
          onPress: () => {},
        },
        {
          icon: 'information',
          label: 'About',
          description: `Version ${env.APP_VERSION}`,
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'logout',
          label: 'Logout',
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.settingItem,
        !isLast && styles.settingItemBorder,
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        item.danger ? styles.dangerIconContainer : styles.defaultIconContainer,
      ]}>
        <Icon
          source={item.icon}
          size={20}
          color={item.danger ? colors.error : colors.primaryLight}
        />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingLabel, item.danger && styles.dangerText]}>
          {item.label}
        </Text>
        {item.description && (
          <Text style={styles.settingDescription}>{item.description}</Text>
        )}
      </View>
      {item.rightElement || (
        <Icon source="chevron-right" size={20} color={colors.textDisabled} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* User Profile Card */}
      <GlassCard
        style={styles.profileCard}
        onPress={() => router.push('/(main)/settings/shop-profile')}
        glow
      >
        <View style={styles.profileContent}>
          <View style={styles.avatar}>
            <Icon source="account" size={28} color={colors.primaryLight} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <Icon source="chevron-right" size={22} color={colors.textDisabled} />
        </View>
      </GlassCard>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <GlassCard style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
            {section.items.map((item, index) =>
              renderSettingItem(item, index, index === section.items.length - 1)
            )}
          </GlassCard>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {env.APP_NAME} v{env.APP_VERSION}
        </Text>
        <Text style={styles.footerText}>Made with care for mechanics</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  profileCard: {
    marginBottom: 8,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
    marginBottom: 10,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  sectionCardContent: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultIconContainer: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  dangerIconContainer: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  settingContent: {
    flex: 1,
    marginLeft: 14,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.error,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 4,
  },
});
