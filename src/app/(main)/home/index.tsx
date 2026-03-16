import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, StatusBar, Pressable, Dimensions } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, useOrderStore, useCustomerStore, useVehicleStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function HomeScreen() {
  const insets = useSafeAreaInsets();
  const authStore = useAuthStore();
  const orderStore = useOrderStore();
  const customerStore = useCustomerStore();
  const vehicleStore = useVehicleStore();

  const [refreshing, setRefreshing] = useState(false);

  // Get active jobs count
  const activeJobsCount = useMemo(() => {
    return orderStore.orders.filter(
      (o) => o.status === 'pending' || o.status === 'in_progress'
    ).length;
  }, [orderStore.orders]);

  // Today's completed jobs
  const todayCompleted = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orderStore.orders.filter((o) => {
      const orderDate = new Date(o.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return o.status === 'completed' && orderDate.getTime() === today.getTime();
    }).length;
  }, [orderStore.orders]);

  // Today's revenue
  const todayRevenue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orderStore.orders
      .filter((o) => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return o.status === 'completed' && orderDate.getTime() === today.getTime();
      })
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [orderStore.orders]);

  // Today's profit (labor = profit)
  const todayProfit = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return orderStore.orders
      .filter((o) => {
        const orderDate = new Date(o.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return o.status === 'completed' && orderDate.getTime() === today.getTime();
      })
      .reduce((sum, o) => sum + (o.totalLabor || 0), 0);
  }, [orderStore.orders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const userId = authStore.userId;
    if (userId) {
      await Promise.all([
        orderStore.fetchAll(userId),
        customerStore.fetchAll(userId),
        vehicleStore.fetchAll(userId),
      ]);
    }
    setRefreshing(false);
  }, [authStore.userId]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Gradient Header */}
      <LinearGradient
        colors={[colors.primary, '#1a1a2e']}
        style={[styles.headerGradient, { paddingTop: insets.top }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.shopName}>{authStore.user?.shopName || 'Workshop'}</Text>
          </View>
          <Pressable style={styles.settingsBtn} onPress={() => router.push('/(main)/settings')}>
            <Icon source="cog-outline" size={24} color="#fff" />
          </Pressable>
        </View>

        {/* Create New Order Button */}
        <Pressable
          style={styles.createOrderBtn}
          onPress={() => router.push('/create-order')}
        >
          <Icon source="plus-circle" size={24} color="#fff" />
          <Text style={styles.createOrderText}>Create New Order</Text>
          <Icon source="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
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
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Pressable style={styles.statCard} onPress={() => router.push('/(main)/orders?status=active')}>
            <View style={[styles.statIconBox, { backgroundColor: colors.primaryDim }]}>
              <Icon source="progress-wrench" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{activeJobsCount}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </Pressable>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.successDim }]}>
              <Icon source="check-circle" size={20} color={colors.success} />
            </View>
            <Text style={styles.statValue}>{todayCompleted}</Text>
            <Text style={styles.statLabel}>Done Today</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#e3f2fd' }]}>
              <Icon source="cash-multiple" size={20} color={colors.primary} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(todayRevenue)}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: colors.warningDim }]}>
              <Icon source="trending-up" size={20} color={colors.success} />
            </View>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {formatCurrency(todayProfit)}
            </Text>
            <Text style={styles.statLabel}>Profit</Text>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Icon source="lightning-bolt" size={22} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>

          <View style={styles.quickGrid}>
            <Pressable style={styles.quickCard} onPress={() => router.push('/(main)/orders')}>
              <LinearGradient
                colors={[colors.primary, '#4361ee']}
                style={styles.quickIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon source="clipboard-text-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickLabel}>All Jobs</Text>
              <Text style={styles.quickCount}>{orderStore.orders.length}</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => router.push('/(main)/customers')}>
              <LinearGradient
                colors={['#06d6a0', '#118ab2']}
                style={styles.quickIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon source="account-group-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickLabel}>Customers</Text>
              <Text style={styles.quickCount}>{customerStore.customers.length}</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => router.push('/(main)/vehicles')}>
              <LinearGradient
                colors={['#f72585', '#b5179e']}
                style={styles.quickIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon source="car-outline" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickLabel}>Vehicles</Text>
              <Text style={styles.quickCount}>{vehicleStore.vehicles.length}</Text>
            </Pressable>

            <Pressable style={styles.quickCard} onPress={() => router.push('/(main)/analytics')}>
              <LinearGradient
                colors={['#ff9f1c', '#e36414']}
                style={styles.quickIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon source="chart-line" size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.quickLabel}>Analytics</Text>
              <Icon source="chevron-right" size={18} color={colors.systemGray3} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default observer(HomeScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Header
  headerGradient: {
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
  },
  shopName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Create Order Button
  createOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    marginHorizontal: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  createOrderText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  // Quick Access
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  quickCount: {
    fontSize: 13,
    color: colors.textTertiary,
  },
});
