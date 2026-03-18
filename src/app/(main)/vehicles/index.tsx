import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TextInput, StatusBar, Pressable } from 'react-native';
import { Text, FAB, Icon, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { GlassCard, AnimatedListItem, EmptyState } from '@presentation/components/common';
import { useVehicleStore, useCustomerStore, useUIStore } from '@stores';
import { useVehicleController, useCustomerController } from '@controllers';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { VEHICLE_MAKES } from '@core/constants';
import { Vehicle } from '@models';

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

const CustomerInfo = observer(function CustomerInfo({ customerId }: { customerId: string }) {
  const customerStore = useCustomerStore();
  const customer = customerStore.customers.find(c => c.id === customerId);

  if (!customer) return null;

  return (
    <View style={styles.customerInfo}>
      <Icon source="account" size={16} color={colors.textSecondary} />
      <Text style={styles.customerName}>{customer.name}</Text>
      <Text style={styles.customerPhone}>{customer.phone}</Text>
    </View>
  );
});

const VehiclesScreen = observer(function VehiclesScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMake, setSelectedMake] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const vehicleStore = useVehicleStore();
  const uiStore = useUIStore();
  const vehicleController = useVehicleController();
  const customerController = useCustomerController();

  useEffect(() => {
    vehicleController.fetchAll();
    customerController.fetchAll();
  }, []);

  const vehicles = vehicleStore.vehicles;
  const isLoading = uiStore.isLoading;

  const filteredVehicles = vehicles.filter((vehicle) => {
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
    await vehicleController.fetchAll();
    setRefreshing(false);
  }, [vehicleController]);

  const makeFilters = ['All', ...VEHICLE_MAKES.slice(0, 6)];

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
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/(main)/home')}>
          <Icon source="chevron-left" size={24} color={colors.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Vehicles</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredVehicles.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon source="magnify" size={20} color={colors.systemGray} />
          <TextInput
            placeholder="Search by plate, make, or model"
            placeholderTextColor={colors.textPlaceholder}
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={makeFilters}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isSelected = item === 'All' ? !selectedMake : selectedMake === item;
            return (
              <Pressable
                onPress={() => setSelectedMake(item === 'All' ? null : item)}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
              >
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={renderVehicleCard}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
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
        style={[styles.fab, shadows.glow, { bottom: insets.bottom + 16 }]}
        onPress={() => router.push('/(main)/vehicles/new')}
        color={colors.textOnPrimary}
      />
    </View>
  );
});

export default VehiclesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    paddingVertical: 8,
    paddingRight: 8,
    marginRight: 4,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary,
    marginLeft: -2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    marginLeft: 12,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  filterContainer: {
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  filterPillTextActive: {
    color: colors.textOnPrimary,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    flexGrow: 1,
  },
  vehicleCard: {
    marginBottom: 10,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.systemGray6,
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
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  licensePlateTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.systemGray6,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  licensePlateText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.separator,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: colors.separator,
  },
  customerName: {
    flex: 1,
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  customerPhone: {
    fontSize: 15,
    color: colors.textTertiary,
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.primary,
  },
});
