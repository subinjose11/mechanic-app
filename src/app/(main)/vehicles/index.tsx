import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, Icon, Chip, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { Card, EmptyState } from '@presentation/components/common';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { useCustomer } from '@presentation/viewmodels/useCustomers';
import { colors } from '@theme/colors';
import { VEHICLE_MAKES } from '@core/constants';
import { Vehicle } from '@domain/entities/Vehicle';

// Component to display customer info for a vehicle
function CustomerInfo({ customerId }: { customerId: string }) {
  const { data: customer } = useCustomer(customerId);

  if (!customer) return null;

  return (
    <View style={styles.customerInfo}>
      <Icon source="account" size={16} color={colors.textSecondary} />
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text style={styles.customerPhone}>{customer.phone}</Text>
    </View>
  );
}

export default function VehiclesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string | null>(null);

  const { data: vehicles, isLoading, refetch } = useVehicles();
  const [refreshing, setRefreshing] = useState(false);

  const filteredVehicles = (vehicles || []).filter((vehicle) => {
    const matchesSearch =
      !searchQuery ||
      vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMake = !selectedMake || vehicle.make === selectedMake;

    return matchesSearch && matchesMake;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderVehicleCard = ({ item }: { item: Vehicle }) => (
    <Card
      style={styles.vehicleCard}
      onPress={() => router.push(`/(main)/vehicles/${item.id}`)}
    >
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIconContainer}>
          <Icon source="car" size={24} color={colors.primary} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>
            {item.make} {item.model}
            {item.year && ` (${item.year})`}
          </Text>
          <Text style={styles.licensePlate}>{item.licensePlate}</Text>
        </View>
        {item.color && (
          <View style={[styles.colorDot, { backgroundColor: item.color.toLowerCase() }]} />
        )}
      </View>
      <CustomerInfo customerId={item.customerId} />
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by plate, make, or model"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...VEHICLE_MAKES.slice(0, 6)]}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Chip
              selected={item === 'All' ? !selectedMake : selectedMake === item}
              onPress={() => setSelectedMake(item === 'All' ? null : item)}
              style={styles.filterChip}
              textStyle={styles.filterChipText}
            >
              {item}
            </Chip>
          )}
        />
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="car-off"
            title="No vehicles found"
            description={searchQuery ? 'Try a different search term' : 'Add your first vehicle to get started'}
            actionLabel="Add Vehicle"
            onAction={() => router.push('/(main)/vehicles/new')}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(main)/vehicles/new')}
        color={colors.textOnPrimary}
      />
    </View>
  );
}

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
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  searchBar: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  licensePlate: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  customerName: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});
