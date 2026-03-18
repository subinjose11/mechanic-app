import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, RefreshControl, StatusBar } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useOrderStore, useAuthStore } from '@stores';
import { useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { formatDate } from '@core/utils/formatDate';
import { ServiceOrder } from '@models/ServiceOrder';

type FilterStatus = 'all' | 'active' | 'completed';

const filters: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All Jobs' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function JobsScreen() {
  const insets = useSafeAreaInsets();
  const { status: initialStatus } = useLocalSearchParams<{ status?: string }>();
  const orderStore = useOrderStore();
  const orderController = useOrderController();
  const authStore = useAuthStore();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>(
    initialStatus === 'completed' ? 'completed' : initialStatus === 'active' ? 'active' : 'all'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (authStore.userId) {
        setIsLoading(true);
        try {
          await orderController.fetchAll();
        } catch (err) {
          console.error('Failed to load orders:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [authStore.userId]);

  const filteredOrders = useMemo(() => {
    switch (activeFilter) {
      case 'active':
        return orderStore.orders.filter(
          (o) => o.status === 'pending' || o.status === 'in_progress'
        );
      case 'completed':
        return orderStore.orders.filter((o) => o.status === 'completed');
      default:
        return orderStore.orders;
    }
  }, [orderStore.orders, activeFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (authStore.userId) {
      await orderStore.fetchAll(authStore.userId);
    }
    setRefreshing(false);
  }, [authStore.userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      case 'completed': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const renderJob = ({ item, index }: { item: ServiceOrder; index: number }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
        <Pressable
          style={styles.jobCard}
          onPress={() => router.push(`/(main)/orders/${item.id}`)}
        >
          {/* Description - Hero */}
          <View style={styles.jobTop}>
            <Text style={styles.jobDescription} numberOfLines={2}>
              {item.description || 'No description'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor + '30' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(item.status)}
              </Text>
            </View>
          </View>

          {/* Vehicle & Customer Info */}
          <View style={styles.jobInfo}>
            <View style={styles.infoRow}>
              <View style={styles.plateBox}>
                <Text style={styles.plateLabel}>REG</Text>
                <Text style={styles.plateText}>{item.vehicleLicensePlate || 'N/A'}</Text>
              </View>
              <View style={styles.vehicleBox}>
                <Text style={styles.vehicleName}>
                  {item.vehicleMake} {item.vehicleModel}
                </Text>
                <View style={styles.customerRow}>
                  <Icon source="account" size={14} color={colors.textTertiary} />
                  <Text style={styles.customerName}>{item.customerName || 'Unknown'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.jobFooter}>
            <Text style={styles.jobDate}>{formatDate(item.createdAt)}</Text>
            <Text style={[styles.jobAmount, item.status === 'completed' && { color: colors.success }]}>
              {item.totalAmount ? formatCurrency(item.totalAmount) : '—'}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dark Header */}
      <LinearGradient
        colors={['#0C0C14', colors.background]}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Jobs</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/create-order')}
          >
            <Icon source="plus" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          {filters.map((filter) => (
            <Pressable
              key={filter.key}
              style={[
                styles.filterPill,
                activeFilter === filter.key && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </LinearGradient>

      {/* Job List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderJob}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 100 },
            filteredOrders.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Icon source="clipboard-text-outline" size={40} color={colors.systemGray} />
              </View>
              <Text style={styles.emptyTitle}>No Jobs Found</Text>
              <Text style={styles.emptySubtitle}>
                {activeFilter === 'active'
                  ? 'No active jobs at the moment'
                  : activeFilter === 'completed'
                  ? 'No completed jobs yet'
                  : 'Create a new job to get started'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

export default observer(JobsScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  headerGradient: {
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  // List
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  // Job Card
  jobCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  jobDescription: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Info Section
  jobInfo: {
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  plateBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plateLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  plateText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  vehicleBox: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customerName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  // Footer
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  jobDate: {
    fontSize: 13,
    color: colors.textTertiary,
  },
  jobAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
