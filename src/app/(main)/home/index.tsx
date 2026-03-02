import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Icon, FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { Card, StatusBadge } from '@presentation/components/common';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { useOrderStats, useOrders } from '@presentation/viewmodels/useOrders';
import { useCustomers } from '@presentation/viewmodels/useCustomers';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { colors } from '@theme/colors';
import { formatDate } from '@core/utils/formatDate';

export default function HomeScreen() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real data from database
  const { data: orderStats, isLoading: loadingOrderStats, refetch: refetchOrderStats } = useOrderStats();
  const { data: orders, isLoading: loadingOrders, refetch: refetchOrders } = useOrders();
  const { data: customers, refetch: refetchCustomers } = useCustomers();
  const { data: vehicles, refetch: refetchVehicles } = useVehicles();

  const isLoading = loadingOrderStats || loadingOrders;

  // Get recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchOrderStats(),
      refetchOrders(),
      refetchCustomers(),
      refetchVehicles(),
    ]);
    setRefreshing(false);
  }, [refetchOrderStats, refetchOrders, refetchCustomers, refetchVehicles]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to vehicles with search query
      router.push(`/(main)/vehicles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const stats = [
    {
      label: 'Pending',
      value: orderStats?.pending || 0,
      icon: 'clock-outline',
      color: colors.statusPending,
      onPress: () => router.push('/(main)/orders?status=pending'),
    },
    {
      label: 'In Progress',
      value: orderStats?.inProgress || 0,
      icon: 'progress-wrench',
      color: colors.statusInProgress,
      onPress: () => router.push('/(main)/orders?status=in_progress'),
    },
    {
      label: 'Completed',
      value: orderStats?.completed || 0,
      icon: 'check-circle',
      color: colors.statusCompleted,
      onPress: () => router.push('/(main)/orders?status=completed'),
    },
    {
      label: 'Total Orders',
      value: orderStats?.total || 0,
      icon: 'clipboard-list',
      color: colors.primary,
      onPress: () => router.push('/(main)/orders'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.shopName}>{user?.shopName || user?.name || 'Mechanic Shop'}</Text>
        </View>
        <Icon source="account-circle" size={40} color={colors.primary} />
      </View>

      <Searchbar
        placeholder="Search by vehicle number..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <Card
                key={index}
                style={styles.statCard}
                onPress={stat.onPress}
              >
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}15` }]}>
                  <Icon source={stat.icon} size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Quick Actions - Simplified workflow */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Card style={styles.actionCard} onPress={() => router.push('/(main)/customers/new')}>
            <Icon source="account-plus" size={32} color={colors.primary} />
            <Text style={styles.actionLabel}>New Customer</Text>
          </Card>
          <Card style={styles.actionCard} onPress={() => router.push('/(main)/vehicles/new')}>
            <Icon source="car-plus" size={32} color={colors.secondary} />
            <Text style={styles.actionLabel}>Add Vehicle</Text>
          </Card>
          <Card style={styles.actionCard} onPress={() => router.push('/(main)/orders/new')}>
            <Icon source="clipboard-plus" size={32} color={colors.success} />
            <Text style={styles.actionLabel}>New Order</Text>
          </Card>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard} onPress={() => router.push('/(main)/customers')}>
            <Icon source="account-group" size={28} color={colors.info} />
            <Text style={styles.summaryValue}>{customers?.length || 0}</Text>
            <Text style={styles.summaryLabel}>Customers</Text>
          </Card>
          <Card style={styles.summaryCard} onPress={() => router.push('/(main)/vehicles')}>
            <Icon source="car-multiple" size={28} color={colors.secondary} />
            <Text style={styles.summaryValue}>{vehicles?.length || 0}</Text>
            <Text style={styles.summaryLabel}>Vehicles</Text>
          </Card>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <Text
            style={styles.seeAll}
            onPress={() => router.push('/(main)/orders')}
          >
            See All
          </Text>
        </View>

        {loadingOrders && !refreshing ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : recentOrders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Icon source="clipboard-text-outline" size={48} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Create your first service order</Text>
          </Card>
        ) : (
          recentOrders.map((order) => (
            <Card
              key={order.id}
              style={styles.orderCard}
              onPress={() => router.push(`/(main)/orders/${order.id}`)}
            >
              <View style={styles.orderHeader}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderVehicle} numberOfLines={1}>
                    Order #{order.id.slice(0, 8)}
                  </Text>
                  <Text style={styles.orderCustomer}>
                    {order.status === 'pending' ? 'Pending' :
                     order.status === 'in_progress' ? 'In Progress' :
                     order.status === 'completed' ? 'Completed' : 'Cancelled'}
                  </Text>
                </View>
                <StatusBadge status={order.status} />
              </View>
              <Text style={styles.orderDescription} numberOfLines={2}>
                {order.description || 'No description'}
              </Text>
              <View style={styles.orderFooter}>
                <Text style={styles.orderDate}>
                  {formatDate(order.createdAt)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(main)/orders/new')}
        color={colors.textOnPrimary}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  shopName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    elevation: 0,
  },
  searchInput: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '47%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 12,
    marginHorizontal: -6,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 6,
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textDisabled,
    marginTop: 4,
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
    marginRight: 8,
  },
  orderVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderCustomer: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  orderDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
  },
  orderDate: {
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
