import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Icon, Divider, Switch } from 'react-native-paper';
import { router } from 'expo-router';
import { Card } from '@presentation/components/common';
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
    <View key={index}>
      <View
        style={styles.settingItem}
        onTouchEnd={item.onPress}
      >
        <View style={[styles.iconContainer, item.danger && styles.dangerIcon]}>
          <Icon
            source={item.icon}
            size={22}
            color={item.danger ? colors.error : colors.textSecondary}
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
      </View>
      {!isLast && <Divider style={styles.divider} />}
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Profile Card */}
      <Card style={styles.profileCard} onPress={() => router.push('/(main)/settings/shop-profile')}>
        <View style={styles.profileContent}>
          <View style={styles.avatar}>
            <Icon source="account" size={32} color={colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <Icon source="chevron-right" size={24} color={colors.textDisabled} />
        </View>
      </Card>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Card style={styles.sectionCard}>
            {section.items.map((item, index) =>
              renderSettingItem(item, index, index === section.items.length - 1)
            )}
          </Card>
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
  profileCard: {
    margin: 16,
    marginBottom: 8,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionCard: {
    marginHorizontal: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerIcon: {
    backgroundColor: `${colors.error}15`,
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingLabel: {
    fontSize: 16,
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
  divider: {
    marginLeft: 52,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 4,
  },
});
