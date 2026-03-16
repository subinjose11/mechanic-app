import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { Button, Input } from '@presentation/components/common';
import { useAuthController } from '@views/hooks/useController';
import { useAuthStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';
import { isValidPhone } from '@core/utils/validators';

function ShopSetupScreen() {
  const authController = useAuthController();
  const authStore = useAuthStore();
  const [shopName, setShopName] = useState('');
  const [shopPhone, setShopPhone] = useState('');
  const [shopAddress, setShopAddress] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    shopName?: string;
    shopPhone?: string;
    shopAddress?: string;
  }>({});

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};

    if (!shopName.trim()) {
      errors.shopName = 'Shop name is required';
    } else if (shopName.trim().length < 2) {
      errors.shopName = 'Shop name must be at least 2 characters';
    }

    if (!shopPhone.trim()) {
      errors.shopPhone = 'Shop phone is required';
    } else if (!isValidPhone(shopPhone)) {
      errors.shopPhone = 'Please enter a valid 10-digit phone number';
    }

    if (!shopAddress.trim()) {
      errors.shopAddress = 'Shop address is required';
    } else if (shopAddress.trim().length < 10) {
      errors.shopAddress = 'Please enter a complete address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSetup = async () => {
    authController.clearError();
    if (!validate()) return;

    try {
      await authController.updateShopProfile({
        shopName: shopName.trim(),
        shopPhone: shopPhone.trim(),
        shopAddress: shopAddress.trim(),
      });
      router.replace('/(main)/home');
    } catch (err) {
      // Error is handled by the controller
    }
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={['#12103a', '#08080c']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Orb glow effect */}
      <View style={styles.orb} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.logo}
              >
                <Text style={styles.logoIcon}>🏪</Text>
              </LinearGradient>
            </View>

            {/* Welcome text */}
            <Text style={styles.welcomeText}>Welcome, {authStore.user?.name || 'there'}!</Text>
            <Text style={styles.tagline}>LET'S SET UP YOUR SHOP</Text>

            {/* Setup card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Shop Details</Text>
              <Text style={styles.cardSubtitle}>
                Add your shop information for invoices and customers
              </Text>

              <Input
                label="Shop Name"
                value={shopName}
                onChangeText={(text) => {
                  setShopName(text);
                  if (validationErrors.shopName) {
                    setValidationErrors((prev) => ({ ...prev, shopName: undefined }));
                  }
                }}
                placeholder="e.g., Kumar Auto Works"
                autoCapitalize="words"
                error={validationErrors.shopName}
                leftIcon="store"
              />

              <View style={styles.inputSpacing} />

              <Input
                label="Shop Phone"
                value={shopPhone}
                onChangeText={(text) => {
                  setShopPhone(text);
                  if (validationErrors.shopPhone) {
                    setValidationErrors((prev) => ({ ...prev, shopPhone: undefined }));
                  }
                }}
                placeholder="e.g., 9876543210"
                keyboardType="phone-pad"
                maxLength={10}
                error={validationErrors.shopPhone}
                leftIcon="phone"
              />

              <View style={styles.inputSpacing} />

              <Input
                label="Shop Address"
                value={shopAddress}
                onChangeText={(text) => {
                  setShopAddress(text);
                  if (validationErrors.shopAddress) {
                    setValidationErrors((prev) => ({ ...prev, shopAddress: undefined }));
                  }
                }}
                placeholder="Enter your shop's full address"
                multiline
                numberOfLines={3}
                error={validationErrors.shopAddress}
                leftIcon="map-marker"
              />

              {authStore.error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{authStore.error}</Text>
                </View>
              )}

              <Button
                onPress={handleSetup}
                loading={authStore.isLoading}
                fullWidth
                style={styles.button}
              >
                Complete Setup
              </Button>
            </View>

            <Text style={styles.note}>
              You can update these details later from Settings
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

export default observer(ShopSetupScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orb: {
    position: 'absolute',
    top: -80,
    left: '50%',
    marginLeft: -140,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(99,102,241,0.18)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 12,
    color: colors.textDisabled,
    letterSpacing: 2.5,
    marginTop: 8,
    marginBottom: 36,
  },
  card: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 22,
    padding: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 22,
  },
  inputSpacing: {
    height: 10,
  },
  errorContainer: {
    backgroundColor: colors.errorDim,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: 12,
    borderRadius: 11,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    marginTop: 6,
  },
  note: {
    fontSize: 12,
    color: colors.textDisabled,
    textAlign: 'center',
    marginTop: 16,
  },
});
