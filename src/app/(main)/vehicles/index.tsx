import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TextInput } from 'react-native';
import { Text, FAB, Icon, Chip, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard, AnimatedListItem, EmptyState } from '@presentation/components/common';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { useCustomer } from '@presentation/viewmodels/useCustomers';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { VEHICLE_MAKES } from '@core/constants';
import { Vehicle } from '@domain/entities/Vehicle';

// Helper function to get vehicle emoji based on type/make
function getVehicleEmoji(make: string): string {
  const motorcycleMakes = ['Honda', 'Yamaha', 'Kawasaki', 'Suzuki', 'Ducati', 'Harley-Davidson'];
  const suvMakes = ['Jeep', 'Land Rover', 'Range Rover'];

  if (motorcycleMakes.some(m => make.toLowerCase().includes(m.toLowerCase()))) {
    return '🛵';
  }
  if (suvMakes.some(m => make.toLowerCase().includes(m.toLowerCase()))) {
    return '🚙';
  }
  return '🚗';
}

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
  const insets = useSafeAreaInsets();
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

  const renderVehicleCard = ({ item, index }: { item: Vehicle; index: number }) => (
    <AnimatedListItem index={index}>
      <GlassCard
        style={styles.vehicleCard}
        onPress={() => router.push(`/(main)/vehicles/${item.id}`)}
      >
        <View style={styles.vehicleHeader}>
          <View style={styles.vehicleIconContainer}>
            <Text style={styles.vehicleEmoji}>{getVehicleEmoji(item.make)}</Text>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>
              {item.make} {item.model}
              {item.year && ` (${item.year})`}
            </Text>
            <View style={styles.licensePlateTag}>
              <Text style={styles.licensePlateText}>{item.licensePlate}</Text>
            </View>
          </View>
          {item.color && (
            <View style={[styles.colorDot, { backgroundColor: item.color.toLowerCase() }]} />
          )}
        </View>
        <CustomerInfo customerId={item.customerId} />
      </GlassCard>
    </AnimatedListItem>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vehicles</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredVehicles.length}</Text>
        </View>
      </View>

      {/* Search Bar with Icon */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon source="magnify" size={20} color={colors.textDisabled} />
          <TextInput
            placeholder="Search by plate, make, or model"
            placeholderTextColor={colors.textDisabled}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Icon source="close" size={18} color={colors.textSecondary} />
          )}
        </View>
      </View>

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
              style={[
                styles.filterChip,
                (item === 'All' ? !selectedMake : selectedMake === item) && styles.filterChipSelected,
              ]}
              textStyle={[
                styles.filterChipText,
                (item === 'All' ? !selectedMake : selectedMake === item) && styles.filterChipTextSelected,
              ]}
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
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
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
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    marginLeft: 12,
    backgroundColor: colors.primaryDim,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    marginLeft: 10,
    padding: 0,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterChipSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  filterChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.primaryLight,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: 12,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 14,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  licensePlateTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryDim,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  licensePlateText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
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
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
});
