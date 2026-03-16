import { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { Text, Icon, ActivityIndicator, Menu, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { Card, Button, TopBar, IconButton, GlassCard } from '@presentation/components/common';
import { useCustomerStore, useVehicleStore, useUIStore } from '@stores';
import { useCustomerController, useVehicleController } from '@controllers';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { formatDate } from '@core/utils/formatDate';

const CustomerDetailScreen = observer(function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuVisible, setMenuVisible] = useState(false);

  const customerStore = useCustomerStore();
  const vehicleStore = useVehicleStore();
  const uiStore = useUIStore();
  const customerController = useCustomerController();
  const vehicleController = useVehicleController();

  useEffect(() => {
    if (id) {
      customerController.fetchById(id);
      vehicleController.fetchAll();
    }
  }, [id]);

  const handleEdit = () => {
    setMenuVisible(false);
    router.push(`/(main)/customers/new?id=${id}`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer?.name}? This will also delete all associated vehicles.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await customerController.delete(id);
                router.back();
              }
            } catch (err) {
              console.error('Failed to delete customer:', err);
              Alert.alert('Error', 'Failed to delete customer. Please try again.');
            }
          },
        },
      ]
    );
  };

  const customer = customerStore.currentCustomer;
  const vehicles = customer ? vehicleStore.getByCustomerId(customer.id) : [];
  const isLoading = uiStore.isLoading;

  if (isLoading || !customer) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.surfaceSecondary} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <TopBar
        title="Customer Details"
        rightAction={
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
                color={colors.textPrimary}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
            <Divider />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
              titleStyle={{ color: colors.error }}
            />
          </Menu>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{customer.name}</Text>
          <Text style={styles.profileSince}>
            Customer since {formatDate(customer.createdAt)}
          </Text>
          {customer.phone && (
            <Text style={styles.profilePhone}>{customer.phone}</Text>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, shadows.sm]}>
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehicles</Text>
          </View>
          <View style={[styles.statCard, shadows.sm]}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={[styles.statCard, shadows.sm]}>
            <Text style={styles.statValue}>Rs.0</Text>
            <Text style={styles.statLabel}>Spent</Text>
          </View>
        </View>

        {/* Contact Info */}
        {(customer.email || customer.address) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CONTACT INFO</Text>
            <GlassCard>
              {customer.email && (
                <View style={styles.infoRow}>
                  <Icon source="email-outline" size={18} color={colors.systemGray} />
                  <Text style={styles.infoText}>{customer.email}</Text>
                </View>
              )}
              {customer.address && (
                <View style={[styles.infoRow, !customer.email && { marginTop: 0 }]}>
                  <Icon source="map-marker-outline" size={18} color={colors.systemGray} />
                  <Text style={styles.infoText}>{customer.address}</Text>
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {/* Vehicles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>VEHICLES</Text>
            <Text
              style={styles.addLink}
              onPress={() => router.push(`/(main)/vehicles/new?customerId=${id}`)}
            >
              Add
            </Text>
          </View>

          {vehicles.length > 0 ? (
            vehicles.map((vehicle) => (
              <GlassCard
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => router.push(`/(main)/vehicles/${vehicle.id}`)}
              >
                <View style={styles.vehicleRow}>
                  <View style={styles.vehicleIconWrap}>
                    <Text style={styles.vehicleIcon}>
                      {vehicle.make?.toLowerCase().includes('bike') ? '🛵' : '🚗'}
                    </Text>
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleName}>
                      {vehicle.make} {vehicle.model}
                    </Text>
                    <Text style={styles.vehicleYear}>
                      {vehicle.year} • {vehicle.color || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.vehicleReg}>
                    <Text style={styles.vehicleRegText}>{vehicle.licensePlate}</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard style={styles.emptyCard}>
              <Icon source="car-off" size={32} color={colors.systemGray3} />
              <Text style={styles.emptyText}>No vehicles registered</Text>
              <Text style={styles.emptySubtext}>Add a vehicle to get started</Text>
            </GlassCard>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={() => router.push(`/(main)/vehicles/new?customerId=${id}`)}
            fullWidth
          >
            Add Vehicle
          </Button>
          <Button
            mode="outlined"
            onPress={() => router.push(`/create-order?customerId=${id}`)}
            fullWidth
            style={styles.outlinedButton}
          >
            Create Order
          </Button>
        </View>
      </ScrollView>
    </View>
  );
});

export default CustomerDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  menuContent: {
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 15,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.primary,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileSince: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  profilePhone: {
    fontSize: 17,
    color: colors.textSecondary,
    marginTop: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
    marginBottom: 8,
    marginLeft: 4,
  },
  addLink: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  vehicleCard: {
    marginBottom: 10,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIcon: {
    fontSize: 24,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  vehicleYear: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  vehicleReg: {
    backgroundColor: colors.systemGray6,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  vehicleRegText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textTertiary,
    marginTop: 4,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  outlinedButton: {
    marginTop: 0,
  },
});
