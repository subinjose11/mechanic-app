import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, StatusBar, Pressable } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, GlassCard, TopBar } from '@presentation/components/common';
import { useCustomerController, useVehicleController } from '@controllers';
import { useVehicleStore, useOrderStore, useAuthStore } from '@stores';
import { colors } from '@theme/colors';
import { Vehicle } from '@models/Vehicle';

interface FormData {
  // Customer fields
  customerName: string;
  customerPhone: string;
  // Vehicle fields
  licensePlate: string;
  make: string;
  model: string;
  year: string;
  color: string;
}

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  licensePlate?: string;
  make?: string;
  model?: string;
}

const QuickAddScreen = observer(function QuickAddScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ plate?: string; createOrder?: string }>();
  const customerController = useCustomerController();
  const vehicleController = useVehicleController();
  const vehicleStore = useVehicleStore();
  const orderStore = useOrderStore();
  const authStore = useAuthStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingVehicle, setExistingVehicle] = useState<Vehicle | null>(null);
  const [showExistingVehicle, setShowExistingVehicle] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerPhone: '',
    licensePlate: params.plate || '',
    make: '',
    model: '',
    year: '',
    color: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Check if vehicle with license plate already exists
  useEffect(() => {
    if (formData.licensePlate.length >= 3) {
      const found = vehicleStore.vehicles.find(
        (v) => v.licensePlate.toLowerCase().replace(/\s/g, '') ===
               formData.licensePlate.toLowerCase().replace(/\s/g, '')
      );
      if (found) {
        setExistingVehicle(found);
        setShowExistingVehicle(true);
      } else {
        setExistingVehicle(null);
        setShowExistingVehicle(false);
      }
    } else {
      setExistingVehicle(null);
      setShowExistingVehicle(false);
    }
  }, [formData.licensePlate, vehicleStore.vehicles]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    }
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Vehicle make is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (createOrder: boolean = false) => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Create customer first
      const customer = await customerController.create({
        name: formData.customerName.trim(),
        phone: formData.customerPhone.trim(),
      });

      // Then create vehicle linked to customer
      const vehicle = await vehicleController.create({
        customerId: customer.id,
        licensePlate: formData.licensePlate.trim().toUpperCase(),
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: formData.year ? parseInt(formData.year, 10) : undefined,
        color: formData.color.trim() || undefined,
      });

      if (createOrder && authStore.userId) {
        // Create order directly with all the data we have
        const order = await orderStore.create(
          authStore.userId,
          {
            vehicleId: vehicle.id,
            customerId: customer.id,
            customerName: customer.name,
            vehicleMake: vehicle.make,
            vehicleModel: vehicle.model,
            vehicleLicensePlate: vehicle.licensePlate,
          }
        );
        router.replace(`/(main)/orders/${order.id}`);
      } else if (!createOrder) {
        router.back();
      }
    } catch (error) {
      console.error('Error creating customer/vehicle:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseExisting = () => {
    if (existingVehicle) {
      if (params.createOrder === 'true') {
        router.replace(`/(main)/orders/new?vehicleId=${existingVehicle.id}&customerId=${existingVehicle.customerId}`);
      } else {
        router.replace(`/(main)/vehicles/${existingVehicle.id}`);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <TopBar title="Quick Add" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Existing Vehicle Alert */}
          {showExistingVehicle && existingVehicle && (
            <Pressable onPress={handleUseExisting}>
              <GlassCard style={styles.existingAlert}>
                <View style={styles.existingAlertContent}>
                  <View style={styles.existingIconWrap}>
                    <Icon source="car-info" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.existingInfo}>
                    <Text style={styles.existingTitle}>Vehicle Found!</Text>
                    <Text style={styles.existingSubtitle}>
                      {existingVehicle.make} {existingVehicle.model} • {existingVehicle.customerName}
                    </Text>
                  </View>
                  <Icon source="chevron-right" size={24} color={colors.systemGray} />
                </View>
              </GlassCard>
            </Pressable>
          )}

          {/* Vehicle Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primaryDim }]}>
                <Icon source="car" size={18} color={colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Vehicle</Text>
            </View>

            <GlassCard>
              <Input
                label="License Plate"
                value={formData.licensePlate}
                onChangeText={(v) => updateField('licensePlate', v.toUpperCase())}
                placeholder="KA 01 AB 1234"
                autoCapitalize="characters"
                error={errors.licensePlate}
                leftIcon="card-text-outline"
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="Make"
                    value={formData.make}
                    onChangeText={(v) => updateField('make', v)}
                    placeholder="e.g., Honda"
                    error={errors.make}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Model"
                    value={formData.model}
                    onChangeText={(v) => updateField('model', v)}
                    placeholder="e.g., City"
                    error={errors.model}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Input
                    label="Year (optional)"
                    value={formData.year}
                    onChangeText={(v) => updateField('year', v.replace(/\D/g, ''))}
                    placeholder="2023"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Input
                    label="Color (optional)"
                    value={formData.color}
                    onChangeText={(v) => updateField('color', v)}
                    placeholder="Silver"
                  />
                </View>
              </View>
            </GlassCard>
          </View>

          {/* Customer Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.successDim }]}>
                <Icon source="account" size={18} color={colors.success} />
              </View>
              <Text style={styles.sectionTitle}>Customer</Text>
            </View>

            <GlassCard>
              <Input
                label="Name"
                value={formData.customerName}
                onChangeText={(v) => updateField('customerName', v)}
                placeholder="Customer name"
                autoCapitalize="words"
                error={errors.customerName}
                leftIcon="account-outline"
              />

              <Input
                label="Phone"
                value={formData.customerPhone}
                onChangeText={(v) => updateField('customerPhone', v)}
                placeholder="Phone number"
                keyboardType="phone-pad"
                error={errors.customerPhone}
                leftIcon="phone-outline"
              />
            </GlassCard>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => handleSave(true)}
              loading={isSubmitting}
              disabled={isSubmitting || showExistingVehicle}
              fullWidth
              icon="clipboard-plus"
            >
              Save & Create Order
            </Button>

            <Button
              mode="outlined"
              onPress={() => handleSave(false)}
              disabled={isSubmitting || showExistingVehicle}
              fullWidth
              style={styles.secondaryButton}
            >
              Save Only
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
});

export default QuickAddScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
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
  existingAlert: {
    marginBottom: 16,
    backgroundColor: colors.primaryDim,
  },
  existingAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  existingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  existingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  existingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  existingSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  halfInput: {
    flex: 1,
  },
  actions: {
    marginTop: 8,
    gap: 12,
  },
  secondaryButton: {
    marginTop: 0,
  },
});
