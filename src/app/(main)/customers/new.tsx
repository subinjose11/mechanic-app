import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Button, Input, TopBar } from '@presentation/components/common';
import { useCustomerController } from '@views/hooks/useController';
import { useCustomerStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';
import { isValidPhone, isValidEmail } from '@core/utils/validators';

function NewCustomerScreen() {
  const { id: editId } = useLocalSearchParams<{ id?: string }>();
  const isEditMode = !!editId;
  const insets = useSafeAreaInsets();
  const customerController = useCustomerController();
  const customerStore = useCustomerStore();
  const [isInitializing, setIsInitializing] = useState(isEditMode);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load customer data for edit mode
  useEffect(() => {
    if (editId) {
      loadCustomerData();
    }
  }, [editId]);

  const loadCustomerData = async () => {
    if (!editId) return;
    try {
      const customer = await customerController.fetchById(editId);
      if (customer) {
        setForm({
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
        });
      }
    } catch (err) {
      console.error('Failed to load customer:', err);
      Alert.alert('Error', 'Failed to load customer data');
    } finally {
      setIsInitializing(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!isValidPhone(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (form.email && !isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      if (isEditMode && editId) {
        await customerController.update(editId, {
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          address: form.address || undefined,
        });
      } else {
        await customerController.create({
          name: form.name,
          phone: form.phone || undefined,
          email: form.email || undefined,
          address: form.address || undefined,
        });
      }
      router.back();
    } catch (err) {
      console.error('Failed to save customer:', err);
      Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'create'} customer`);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar title={isEditMode ? "Edit Customer" : "New Customer"} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>CUSTOMER INFORMATION</Text>

          <Input
            label="Full Name *"
            value={form.name}
            onChangeText={(v) => updateField('name', v)}
            placeholder="Enter customer name"
            autoCapitalize="words"
            error={errors.name}
            leftIcon="account"
          />

          <View style={styles.spacing} />

          <Input
            label="Phone Number *"
            value={form.phone}
            onChangeText={(v) => updateField('phone', v)}
            placeholder="10-digit phone number"
            keyboardType="phone-pad"
            maxLength={10}
            error={errors.phone}
            leftIcon="phone"
          />

          <View style={styles.spacing} />

          <Input
            label="Email (Optional)"
            value={form.email}
            onChangeText={(v) => updateField('email', v)}
            placeholder="customer@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            leftIcon="email"
          />

          <View style={styles.spacing} />

          <Input
            label="Address (Optional)"
            value={form.address}
            onChangeText={(v) => updateField('address', v)}
            placeholder="Full address"
            multiline
            numberOfLines={3}
            leftIcon="map-marker"
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 80 }]}>
          <Button onPress={() => router.back()} mode="outlined" style={styles.footerButton}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} loading={customerStore.isLoading} style={styles.footerButton}>
            {isEditMode ? 'Save Changes' : 'Add Customer'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

export default observer(NewCustomerScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDisabled,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  spacing: {
    height: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {
    flex: 1,
  },
});
