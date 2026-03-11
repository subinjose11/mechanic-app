import { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, TopBar } from '@presentation/components/common';
import { useCreateCustomer } from '@presentation/viewmodels/useCustomers';
import { colors } from '@theme/colors';
import { isValidPhone, isValidEmail } from '@core/utils/validators';

export default function NewCustomerScreen() {
  const insets = useSafeAreaInsets();
  const createCustomerMutation = useCreateCustomer();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      await createCustomerMutation.mutateAsync({
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
      });
      router.back();
    } catch (err) {
      console.error('Failed to create customer:', err);
    }
  };

  return (
    <View style={styles.container}>
      <TopBar title="New Customer" />
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
            left={<IconButton icon="account" size={20} />}
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
            left={<IconButton icon="phone" size={20} />}
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
            left={<IconButton icon="email" size={20} />}
          />

          <View style={styles.spacing} />

          <Input
            label="Address (Optional)"
            value={form.address}
            onChangeText={(v) => updateField('address', v)}
            placeholder="Full address"
            multiline
            numberOfLines={3}
            left={<IconButton icon="map-marker" size={20} />}
          />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button onPress={() => router.back()} mode="outlined" style={styles.footerButton}>
            Cancel
          </Button>
          <Button onPress={handleSubmit} loading={createCustomerMutation.isPending} style={styles.footerButton}>
            Add Customer
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
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
