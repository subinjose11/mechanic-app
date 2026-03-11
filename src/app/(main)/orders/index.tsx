import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, SegmentedButtons, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, StatusBadge, GlassCard, GlassView, AnimatedListItem } from '@presentation/components/common';
import { shadows } from '@theme/shadows';
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
  const insets = useSafeAreaInsets();
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

  // Get order ID initials for avatar
  const getOrderInitials = (id: string) => {
    return id.slice(-2).toUpperCase();
  };

  const renderOrderCard = ({ item, index }: { item: EnrichedOrder; index: number }) => (
    <AnimatedListItem index={index}>
      <GlassCard
        style={styles.orderCard}
        onPress={() => router.push(`/(main)/orders/${item.id}`)}
        level="card"
      >
        <View style={styles.orderHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getOrderInitials(item.id)}</Text>
            </View>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.vehicleName}>{item.vehicleName}</Text>
            <View style={styles.licensePlateContainer}>
              <Text style={styles.licensePlate}>{item.licensePlate}</Text>
            </View>
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
      </GlassCard>
    </AnimatedListItem>
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
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filteredOrders.length}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBarWrapper}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <Searchbar
            placeholder="Search orders..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            icon={() => null}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <GlassView level="base" style={styles.filterContainer}>
        <SegmentedButtons
          value={selectedStatus}
          onValueChange={setSelectedStatus}
          buttons={[
            { value: 'all', label: 'All', style: styles.segmentButton, labelStyle: selectedStatus === 'all' ? styles.segmentLabelActive : styles.segmentLabel },
            { value: 'pending', label: 'Pending', style: styles.segmentButton, labelStyle: selectedStatus === 'pending' ? styles.segmentLabelActive : styles.segmentLabel },
            { value: 'in_progress', label: 'Active', style: styles.segmentButton, labelStyle: selectedStatus === 'in_progress' ? styles.segmentLabelActive : styles.segmentLabel },
            { value: 'completed', label: 'Done', style: styles.segmentButton, labelStyle: selectedStatus === 'completed' ? styles.segmentLabelActive : styles.segmentLabel },
          ]}
          style={styles.segmentedButtons}
          theme={{
            colors: {
              secondaryContainer: colors.primaryDim,
              onSecondaryContainer: colors.primaryLight,
              outline: colors.primaryBorder,
            },
          }}
        />
      </GlassView>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
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
        style={[styles.fab, shadows.glow, { bottom: 16 + insets.bottom }]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    marginLeft: 12,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
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
    marginBottom: 12,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: {
    color: colors.textPrimary,
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 4,
  },
  segmentedButtons: {
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  segmentButton: {
    borderColor: colors.primaryBorder,
  },
  segmentLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  segmentLabelActive: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  orderCard: {
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  orderInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  licensePlateContainer: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  licensePlate: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 56,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    marginLeft: 56,
  },
  kmReading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 56,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
