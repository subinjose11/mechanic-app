import { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable, StatusBar, Modal, Linking } from 'react-native';
import { Text, Icon, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useAuthController } from '@views/hooks/useController';
import { useAuthStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';
import { env } from '@core/config/env';

interface SettingItem {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}

function SettingsScreen() {
  const authController = useAuthController();
  const authStore = useAuthStore();
  const insets = useSafeAreaInsets();
  const [showAbout, setShowAbout] = useState(false);

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
            await authController.logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const settingSections: { title?: string; items: SettingItem[] }[] = [
    {
      title: 'Shop',
      items: [
        {
          icon: 'store',
          iconColor: colors.primary,
          iconBg: colors.primaryDim,
          label: 'Shop Profile',
          value: authStore.user?.shopName || 'Set up',
          onPress: () => router.push('/(main)/settings/shop-profile'),
        },
        {
          icon: 'chart-line',
          iconColor: colors.systemOrange,
          iconBg: colors.warningDim,
          label: 'Analytics',
          onPress: () => router.push('/(main)/analytics'),
        },
        {
          icon: 'wallet-outline',
          iconColor: colors.systemGreen,
          iconBg: colors.successDim,
          label: 'Expenses',
          onPress: () => router.push('/(main)/expenses'),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: 'account-group-outline',
          iconColor: colors.systemIndigo,
          iconBg: 'rgba(88,86,214,0.12)',
          label: 'All Customers',
          onPress: () => router.push('/(main)/customers'),
        },
        {
          icon: 'car-multiple',
          iconColor: colors.systemBlue,
          iconBg: colors.primaryDim,
          label: 'All Vehicles',
          onPress: () => router.push('/(main)/vehicles'),
        },
      ],
    },
    {
      title: 'App',
      items: [
        {
          icon: 'information-outline',
          iconColor: colors.systemGray,
          iconBg: 'rgba(142,142,147,0.12)',
          label: 'About',
          value: `v${env.APP_VERSION}`,
          onPress: () => setShowAbout(true),
        },
      ],
    },
    {
      items: [
        {
          icon: 'logout',
          iconColor: colors.error,
          iconBg: colors.errorDim,
          label: 'Log Out',
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem, index: number, isLast: boolean) => (
    <Pressable
      key={index}
      style={styles.settingItem}
      onPress={item.onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
        <Icon source={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={[styles.settingContent, !isLast && styles.settingContentBorder]}>
        <Text style={[styles.settingLabel, item.danger && styles.dangerText]}>
          {item.label}
        </Text>
        <View style={styles.settingRight}>
          {item.value && (
            <Text style={styles.settingValue}>{item.value}</Text>
          )}
          {!item.danger && (
            <Icon source="chevron-right" size={20} color={colors.systemGray3} />
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceSecondary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* User Profile Card */}
      <Pressable
        style={styles.profileCard}
        onPress={() => router.push('/(main)/settings/shop-profile')}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(authStore.user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{authStore.user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{authStore.user?.email}</Text>
        </View>
        <Icon source="chevron-right" size={22} color={colors.systemGray3} />
      </Pressable>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.title && (
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
          )}
          <View style={styles.sectionCard}>
            {section.items.map((item, index) =>
              renderSettingItem(item, index, index === section.items.length - 1)
            )}
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Made with ❤️ for mechanics</Text>
      </View>

      {/* About Modal */}
      <Modal
        visible={showAbout}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAbout(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAbout(false)}>
          <Pressable style={styles.aboutModal} onPress={() => {}}>
            <View style={styles.aboutHeader}>
              <View style={styles.aboutIcon}>
                <Icon source="wrench" size={40} color={colors.primary} />
              </View>
              <Text style={styles.aboutTitle}>Mechanic App</Text>
              <Text style={styles.aboutVersion}>Version {env.APP_VERSION}</Text>
            </View>

            <View style={styles.aboutContent}>
              <Text style={styles.aboutDescription}>
                A complete shop management solution for auto mechanics. Track customers, vehicles, orders, and payments all in one place.
              </Text>

              <View style={styles.aboutFeatures}>
                <View style={styles.aboutFeatureRow}>
                  <Icon source="check-circle" size={16} color={colors.success} />
                  <Text style={styles.aboutFeatureText}>Customer & Vehicle Management</Text>
                </View>
                <View style={styles.aboutFeatureRow}>
                  <Icon source="check-circle" size={16} color={colors.success} />
                  <Text style={styles.aboutFeatureText}>Order & Payment Tracking</Text>
                </View>
                <View style={styles.aboutFeatureRow}>
                  <Icon source="check-circle" size={16} color={colors.success} />
                  <Text style={styles.aboutFeatureText}>Photo Documentation</Text>
                </View>
                <View style={styles.aboutFeatureRow}>
                  <Icon source="check-circle" size={16} color={colors.success} />
                  <Text style={styles.aboutFeatureText}>Analytics & Reports</Text>
                </View>
              </View>
            </View>

            <Pressable
              style={styles.aboutCloseButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.aboutCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

export default observer(SettingsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  userEmail: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginLeft: 4,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    minHeight: 52,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingRight: 14,
    marginLeft: 12,
  },
  settingContentBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
  },
  settingLabel: {
    fontSize: 17,
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.error,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 16,
    color: colors.textTertiary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textTertiary,
  },
  // About Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  aboutModal: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  aboutHeader: {
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: colors.surfaceVariant,
  },
  aboutIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  aboutVersion: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  aboutContent: {
    padding: 20,
  },
  aboutDescription: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  aboutFeatures: {
    gap: 10,
  },
  aboutFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aboutFeatureText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  aboutCloseButton: {
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    padding: 16,
    alignItems: 'center',
  },
  aboutCloseText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.primary,
  },
});
