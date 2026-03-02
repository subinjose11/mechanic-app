import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Icon, IconButton, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Card, Button } from '@presentation/components/common';
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

  return (
    <>
      <Stack.Screen options={{ title: customer.name }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Icon source="account" size={32} color={colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{customer.name}</Text>
              <Text style={styles.since}>Customer since {formatDate(customer.createdAt)}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {customer.phone && (
            <View style={styles.contactRow}>
              <Icon source="phone" size={18} color={colors.textSecondary} />
              <Text style={styles.contactText}>{customer.phone}</Text>
              <IconButton icon="phone" size={20} onPress={() => {}} />
            </View>
          )}

          {customer.email && (
            <View style={styles.contactRow}>
              <Icon source="email" size={18} color={colors.textSecondary} />
              <Text style={styles.contactText}>{customer.email}</Text>
            </View>
          )}

          {customer.address && (
            <View style={styles.contactRow}>
              <Icon source="map-marker" size={18} color={colors.textSecondary} />
              <Text style={styles.contactText}>{customer.address}</Text>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Vehicles ({(vehicles || []).length})</Text>
        {(vehicles || []).length > 0 ? (
          (vehicles || []).map((vehicle) => (
            <Card
              key={vehicle.id}
              style={styles.vehicleCard}
              onPress={() => router.push(`/(main)/vehicles/${vehicle.id}`)}
            >
              <View style={styles.vehicleRow}>
                <Icon source="car" size={20} color={colors.primary} />
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>
                    {vehicle.make} {vehicle.model}{vehicle.year ? ` (${vehicle.year})` : ''}
                  </Text>
                  <Text style={styles.vehiclePlate}>{vehicle.licensePlate}</Text>
                </View>
                <Icon source="chevron-right" size={20} color={colors.textDisabled} />
              </View>
            </Card>
          ))
        ) : (
          <Text style={styles.emptyText}>No vehicles registered yet</Text>
        )}

        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="car-plus"
            onPress={() => router.push(`/(main)/vehicles/new?customerId=${id}`)}
            style={styles.actionButton}
          >
            Add Vehicle
          </Button>
          <Button
            mode="outlined"
            icon="clipboard-plus"
            onPress={() => router.push(`/(main)/orders/new?customerId=${id}`)}
            style={styles.actionButton}
          >
            New Order
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  card: { marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  headerInfo: { flex: 1, marginLeft: 16 },
  name: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  since: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  divider: { marginVertical: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  contactText: { flex: 1, fontSize: 15, color: colors.textPrimary, marginLeft: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 12 },
  vehicleCard: { marginBottom: 8 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleInfo: { flex: 1, marginLeft: 12 },
  vehicleName: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  vehiclePlate: { fontSize: 13, color: colors.primary },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 32 },
  actionButton: { flex: 1 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: 16 },
});
