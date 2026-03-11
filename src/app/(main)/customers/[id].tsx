import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, TopBar, IconButton } from '@presentation/components/common';
import { useCustomer } from '@presentation/viewmodels/useCustomers';
import { useVehiclesByCustomer } from '@presentation/viewmodels/useVehicles';
import { colors } from '@theme/colors';
import { formatDate } from '@core/utils/formatDate';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: customer, isLoading } = useCustomer(id || '');
  const { data: vehicles } = useVehiclesByCustomer(id || '');

  if (isLoading || !customer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading customer...</Text>
      </View>
    );
  }

  // Get initials for avatar
  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={styles.container}>
      <TopBar
        title="Customer Details"
        rightAction={
          <IconButton
            icon="pencil"
            onPress={() => {}}
          />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Hero */}
        <LinearGradient
          colors={['#12103a', colors.background]}
          style={styles.heroGradient}
        >
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{customer.name}</Text>
              <Text style={styles.profileSince}>
                Customer since {formatDate(customer.createdAt)}
              </Text>
              {customer.phone && (
                <Text style={styles.profilePhone}>{customer.phone}</Text>
              )}
            </View>
          </View>

          {/* Profile Stats */}
          <View style={styles.profileStats}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{(vehicles || []).length}</Text>
              <Text style={styles.statLabel}>Vehicles</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₹0</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Contact Info */}
        {(customer.email || customer.address) && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CONTACT INFO</Text>

            {customer.email && (
              <View style={styles.infoRow}>
                <Icon source="email-outline" size={16} color={colors.textDisabled} />
                <Text style={styles.infoText}>{customer.email}</Text>
              </View>
            )}

            {customer.address && (
              <View style={styles.infoRow}>
                <Icon source="map-marker-outline" size={16} color={colors.textDisabled} />
                <Text style={styles.infoText}>{customer.address}</Text>
              </View>
            )}
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
              + Add
            </Text>
          </View>

          {(vehicles || []).length > 0 ? (
            (vehicles || []).map((vehicle) => (
              <Card
                key={vehicle.id}
                style={styles.vehicleCard}
                onPress={() => router.push(`/(main)/vehicles/${vehicle.id}`)}
              >
                <View style={styles.vehicleTop}>
                  <Text style={styles.vehicleIcon}>
                    {vehicle.make?.toLowerCase().includes('bike') ? '🛵' : '🚗'}
                  </Text>
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
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Icon source="car-off" size={32} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No vehicles registered</Text>
              <Text style={styles.emptySubtext}>Add a vehicle to get started</Text>
            </Card>
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
            onPress={() => router.push(`/(main)/orders/new?customerId=${id}`)}
            fullWidth
            style={styles.outlinedButton}
          >
            Create Order
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  heroGradient: {
    padding: 20,
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.primaryLight,
    fontVariant: ['tabular-nums'],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  profileSince: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 3,
  },
  profilePhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
  profileStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 13,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 9,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 3,
  },
  section: {
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDisabled,
    letterSpacing: 1.5,
    marginBottom: 11,
  },
  addLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  vehicleCard: {
    marginBottom: 8,
  },
  vehicleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vehicleIcon: {
    fontSize: 26,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  vehicleYear: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 1,
  },
  vehicleReg: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  vehicleRegText: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.8,
    fontVariant: ['tabular-nums'],
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 4,
  },
  actions: {
    padding: 18,
    gap: 8,
  },
  outlinedButton: {
    marginTop: 0,
  },
});
