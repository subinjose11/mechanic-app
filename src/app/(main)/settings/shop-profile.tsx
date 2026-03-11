import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, IconButton, Snackbar } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input, Card, TopBar } from '@presentation/components/common';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { colors } from '@theme/colors';
import { isValidPhone } from '@core/utils/validators';

export default function ShopProfileScreen() {
  const { user, updateProfile, isLoading, error } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    shopName: user?.shopName || '',
    shopPhone: user?.shopPhone || '',
    shopAddress: user?.shopAddress || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.shopName.trim()) newErrors.shopName = 'Shop name is required';
    if (!form.shopPhone.trim()) {
      newErrors.shopPhone = 'Shop phone is required';
    } else if (!isValidPhone(form.shopPhone)) {
      newErrors.shopPhone = 'Please enter a valid phone number';
    }
    if (!form.shopAddress.trim()) newErrors.shopAddress = 'Shop address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        shopName: form.shopName.trim(),
        shopPhone: form.shopPhone.trim(),
        shopAddress: form.shopAddress.trim(),
      });
      setSnackbarVisible(true);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <TopBar title="Shop Profile" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Gradient Hero Section */}
          <LinearGradient
            colors={['#12103a', colors.background]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.shopIconContainer}>
                <IconButton icon="store" size={32} iconColor={colors.textPrimary} />
              </View>
              <Text style={styles.heroTitle}>{form.shopName || 'Your Shop'}</Text>
              <Text style={styles.heroSubtitle}>{user?.email}</Text>
            </View>
          </LinearGradient>

          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.card}>
            <Input
              label="Full Name *"
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Your full name"
              autoCapitalize="words"
              error={errors.name}
              left={<IconButton icon="account" size={20} />}
            />

            <View style={styles.spacing} />

            <Input
              label="Personal Phone (Optional)"
              value={form.phone}
              onChangeText={(v) => updateField('phone', v)}
              placeholder="Your personal phone"
              keyboardType="phone-pad"
              maxLength={10}
              left={<IconButton icon="phone" size={20} />}
            />
          </View>

          {/* Shop Information */}
          <Text style={styles.sectionTitle}>Shop Information</Text>
          <Text style={styles.sectionSubtitle}>
            This information will appear on your invoices
          </Text>
          <View style={styles.card}>
            <Input
              label="Shop Name *"
              value={form.shopName}
              onChangeText={(v) => updateField('shopName', v)}
              placeholder="e.g., Kumar Auto Works"
              autoCapitalize="words"
              error={errors.shopName}
              left={<IconButton icon="store" size={20} />}
            />

            <View style={styles.spacing} />

            <Input
              label="Shop Phone *"
              value={form.shopPhone}
              onChangeText={(v) => updateField('shopPhone', v)}
              placeholder="e.g., 9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              error={errors.shopPhone}
              left={<IconButton icon="phone" size={20} />}
            />

            <View style={styles.spacing} />

            <Input
              label="Shop Address *"
              value={form.shopAddress}
              onChangeText={(v) => updateField('shopAddress', v)}
              placeholder="Full shop address"
              multiline
              numberOfLines={3}
              error={errors.shopAddress}
              left={<IconButton icon="map-marker" size={20} />}
            />
          </View>

          {/* Account Info */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt.toLocaleDateString()}
              </Text>
            </View>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={() => router.back()}
            mode="outlined"
            style={styles.footerButton}
          >
            Cancel
          </Button>
          <Button
            onPress={handleSave}
            loading={isLoading}
            style={styles.footerButton}
          >
            Save Changes
          </Button>
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        Profile updated successfully
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroGradient: {
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  heroContent: {
    alignItems: 'center',
  },
  shopIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  card: {
    marginTop: 8,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
  },
  spacing: {
    height: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textDisabled,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: `${colors.error}10`,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerButton: {
    flex: 1,
  },
});
