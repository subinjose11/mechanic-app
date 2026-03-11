import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Icon, FAB, Searchbar, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, StatusBadge, GlassCard, AnimatedListItem } from '@presentation/components/common';
import { useAuth } from '@presentation/viewmodels/useAuth';
import { useOrderStats, useOrders } from '@presentation/viewmodels/useOrders';
import { useCustomers } from '@presentation/viewmodels/useCustomers';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
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
      color: colors.warning,
      dimColor: colors.warningDim,
      onPress: () => router.push('/(main)/orders?status=pending'),
    },
    {
      label: 'In Progress',
      value: orderStats?.inProgress || 0,
      icon: 'progress-wrench',
      color: colors.primary,
      dimColor: colors.primaryDim,
      onPress: () => router.push('/(main)/orders?status=in_progress'),
    },
    {
      label: 'Completed',
      value: orderStats?.completed || 0,
      icon: 'check-circle',
      color: colors.success,
      dimColor: colors.successDim,
      onPress: () => router.push('/(main)/orders?status=completed'),
    },
    {
      label: 'Total',
      value: orderStats?.total || 0,
      icon: 'clipboard-list',
      color: colors.secondary,
      dimColor: colors.secondaryDim,
      onPress: () => router.push('/(main)/orders'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#10102a', colors.background]}
        style={styles.headerGradient}
      >
        <View style={styles.headerRow}>
          <View style={styles.shopTag}>
            <View style={styles.onlineDot} />
            <Text style={styles.shopLabel}>Online</Text>
          </View>
          <View style={styles.notifButton}>
            <Icon source="bell-outline" size={18} color={colors.textSecondary} />
          </View>
        </View>
        <Text style={styles.greeting}>
          Good day, <Text style={styles.greetingAccent}>{user?.name?.split(' ')[0] || 'there'}</Text>
        </Text>
        <Text style={styles.shopName}>{user?.shopName || 'Mechanic Shop'}</Text>
      </LinearGradient>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <GlassCard
            key={index}
            style={styles.statCardOuter}
            contentStyle={styles.statCardContent}
            onPress={stat.onPress}
            glow={true}
          >
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </GlassCard>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchWrap}>
          <View style={styles.searchRow}>
            <Icon source="magnify" size={18} color={colors.textDisabled} />
            <Searchbar
              placeholder="Search by vehicle number..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              onSubmitEditing={handleSearch}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              placeholderTextColor={colors.textDisabled}
              iconColor={colors.textDisabled}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.actionsRow}>
          <GlassCard style={styles.actionCardOuter} contentStyle={styles.actionCardContent} onPress={() => router.push('/(main)/customers/new')}>
            <Icon source="account-plus" size={28} color={colors.primary} />
            <Text style={styles.actionLabel}>New Customer</Text>
          </GlassCard>
          <GlassCard style={styles.actionCardOuter} contentStyle={styles.actionCardContent} onPress={() => router.push('/(main)/vehicles/new')}>
            <Icon source="car" size={28} color={colors.secondary} />
            <Text style={styles.actionLabel}>Add Vehicle</Text>
          </GlassCard>
          <GlassCard style={styles.actionCardOuter} contentStyle={styles.actionCardContent} onPress={() => router.push('/(main)/orders/new')}>
            <Icon source="clipboard-plus" size={28} color={colors.success} />
            <Text style={styles.actionLabel}>New Order</Text>
          </GlassCard>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <GlassCard style={styles.summaryCardOuter} contentStyle={styles.summaryCardContent} onPress={() => router.push('/(main)/customers')}>
            <Icon source="account-group" size={24} color={colors.info} />
            <Text style={styles.summaryValue}>{customers?.length || 0}</Text>
            <Text style={styles.summaryLabel}>Customers</Text>
          </GlassCard>
          <GlassCard style={styles.summaryCardOuter} contentStyle={styles.summaryCardContent} onPress={() => router.push('/(main)/vehicles')}>
            <Icon source="car-multiple" size={24} color={colors.secondary} />
            <Text style={styles.summaryValue}>{vehicles?.length || 0}</Text>
            <Text style={styles.summaryLabel}>Vehicles</Text>
          </GlassCard>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>RECENT ORDERS</Text>
          <Text style={styles.seeAll} onPress={() => router.push('/(main)/orders')}>
            See All
          </Text>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : recentOrders.length === 0 ? (
          <GlassCard contentStyle={styles.emptyCardContent}>
            <Icon source="clipboard-text-outline" size={42} color={colors.textDisabled} />
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Create your first service order</Text>
          </GlassCard>
        ) : (
          recentOrders.map((order, index) => (
            <AnimatedListItem key={order.id} index={index}>
              <Card
                style={styles.orderCard}
                onPress={() => router.push(`/(main)/orders/${order.id}`)}
              >
                <View style={styles.orderTop}>
                  <View style={styles.orderAvatar}>
                    <Text style={styles.orderAvatarText}>
                      {order.id.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderName}>Order #{order.id.slice(0, 8)}</Text>
                    <Text style={styles.orderId}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <StatusBadge status={order.status} />
                </View>
                <Text style={styles.orderDescription} numberOfLines={2}>
                  {order.description || 'No description'}
                </Text>
              </Card>
            </AnimatedListItem>
          ))
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, shadows.glow]}
        onPress={() => router.push('/(main)/orders/new')}
        color={colors.textOnPrimary}
        customSize={52}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  shopTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  shopLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  notifButton: {
    width: 34,
    height: 34,
    backgroundColor: colors.surfaceVariant,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 25,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  greetingAccent: {
    color: colors.primary,
  },
  shopName: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 5,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  statCardOuter: {
    flex: 1,
  },
  statCardContent: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textDisabled,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },
  searchWrap: {
    marginBottom: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 14,
    paddingLeft: 14,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDisabled,
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionCardOuter: {
    flex: 1,
  },
  actionCardContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  summaryCardOuter: {
    flex: 1,
  },
  summaryCardContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.textPrimary,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 9,
    color: colors.textDisabled,
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 14,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textDisabled,
    marginTop: 6,
  },
  orderCard: {
    marginBottom: 8,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 11,
  },
  orderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderAvatarText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primaryLight,
    fontVariant: ['tabular-nums'],
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  orderId: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  orderDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
});
