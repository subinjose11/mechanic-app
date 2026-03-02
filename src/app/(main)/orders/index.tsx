import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { Card, EmptyState, StatusBadge } from '@presentation/components/common';
import { useOrders } from '@presentation/viewmodels/useOrders';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { useCustomers } from '@presentation/viewmodels/useCustomers';
import { colors } from '@theme/colors';
import { formatRelativeTime } from '@core/utils/formatDate';
import { formatCurrency } from '@core/utils/formatCurrency';
import { OrderStatus } from '@core/constants';
import { ServiceOrder } from '@domain/entities/ServiceOrder';

interface EnrichedOrder extends ServiceOrder {
  vehicleName: string;
  licensePlate: string;
  customerName: string;
}

export default function OrdersScreen() {
  const { status: initialStatus } = useLocalSearchParams<{ status?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'all');

  const { data: orders, isLoading, refetch } = useOrders();
  const { data: vehicles } = useVehicles();
  const { data: customers } = useCustomers();

  // Enrich orders with vehicle and customer names
  const enrichedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.map(order => {
      const vehicle = vehicles?.find(v => v.id === order.vehicleId);
      const customer = customers?.find(c => c.id === order.customerId);
      return {
        ...order,
        vehicleName: vehicle ? `${vehicle.make} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}` : 'Unknown Vehicle',
        licensePlate: vehicle?.licensePlate || 'N/A',
        customerName: customer?.name || 'Unknown Customer',
      };
    });
  }, [orders, vehicles, customers]);

  const filteredOrders = enrichedOrders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderOrderCard = ({ item }: { item: EnrichedOrder }) => (
    <Card
      style={styles.orderCard}
      onPress={() => router.push(`/(main)/orders/${item.id}`)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.vehicleName}>{item.vehicleName}</Text>
          <Text style={styles.licensePlate}>{item.licensePlate}</Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <Text style={styles.customerName}>{item.customerName}</Text>
      {item.description && (
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
      )}
      {item.kmReading && (
        <Text style={styles.kmReading}>KM: {item.kmReading.toLocaleString()}</Text>
      )}

      <View style={styles.orderFooter}>
        <Text style={styles.timeAgo}>{formatRelativeTime(item.createdAt)}</Text>
      </View>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search orders..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'in_progress', label: 'Active' },
            { value: 'completed', label: 'Done' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="clipboard-text-off"
            title="No orders found"
            description={
              searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first service order'
            }
            actionLabel="Create Order"
            onAction={() => router.push('/(main)/orders/new')}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(main)/orders/new')}
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
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
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  kmReading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
    marginTop: 8,
  },
  timeAgo: {
    fontSize: 12,
    color: colors.textDisabled,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: colors.primary,
  },
});
