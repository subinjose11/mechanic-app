import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '@presentation/components/common';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { colors } from '@theme/colors';
import { isValidPhone } from '@core/utils/validators';

export default function ShopSetupScreen() {
  const { updateShopProfile, isLoading, error, clearError, user } = useAuth();
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
    clearError();
    if (!validate()) return;

    try {
      await updateShopProfile({
        shopName: shopName.trim(),
        shopPhone: shopPhone.trim(),
        shopAddress: shopAddress.trim(),
      });
      router.replace('/(main)/home');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome, {user?.name || 'there'}!</Text>
            <Text style={styles.title}>Set Up Your Shop</Text>
            <Text style={styles.subtitle}>
              Add your shop details to display on invoices and connect with customers
            </Text>
          </View>

          <View style={styles.form}>
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
              left={<IconButton icon="store" size={20} />}
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
              left={<IconButton icon="phone" size={20} />}
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
              left={<IconButton icon="map-marker" size={20} />}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              onPress={handleSetup}
              loading={isLoading}
              fullWidth
              style={styles.button}
            >
              Complete Setup
            </Button>

            <Text style={styles.note}>
              You can update these details later from Settings
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputSpacing: {
    height: 16,
  },
  errorContainer: {
    backgroundColor: `${colors.error}10`,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});
