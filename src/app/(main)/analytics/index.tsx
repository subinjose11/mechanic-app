import { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, StatusBar, Pressable } from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useOrderStore, useCustomerStore, useUIStore } from '@stores';
import { useAnalyticsController } from '@controllers';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { formatCurrency, formatCurrencyCompact } from '@core/utils/formatCurrency';

const screenWidth = Dimensions.get('window').width - 64;

const periodOptions = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

const AnalyticsScreen = observer(function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState('week');

  const orderStore = useOrderStore();
  const customerStore = useCustomerStore();
  const uiStore = useUIStore();
  const analyticsController = useAnalyticsController();

  const isLoading = uiStore.isLoading;
  const dashboardData = analyticsController.getDashboardStats();

  const periodData = useMemo(() => ({
    revenue: { total: dashboardData.totalRevenue },
    expenses: { total: dashboardData.monthlyExpenses },
    profitLoss: { gross: dashboardData.monthlyProfit },
  }), [dashboardData]);

  const stats = useMemo(() => ({
    totalRevenue: periodData?.revenue?.total || 0,
    totalExpenses: periodData?.expenses?.total || 0,
    netProfit: periodData?.profitLoss?.gross || 0,
    laborProfit: dashboardData.totalLaborProfit || 0,
    monthlyLaborProfit: dashboardData.monthlyLaborProfit || 0,
    ordersCompleted: orderStore.completedOrders.length,
    newCustomers: customerStore.customers.length,
    averageOrderValue: orderStore.orders.length > 0 && dashboardData.totalRevenue > 0
      ? Math.round(dashboardData.totalRevenue / orderStore.orders.length)
      : 0,
  }), [periodData, orderStore.orders, orderStore.completedOrders, customerStore.customers, dashboardData]);

  const revenueData = {
    labels: period === 'week'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['W1', 'W2', 'W3', 'W4'],
    datasets: [{
      data: stats.totalRevenue > 0
        ? (period === 'week'
            ? [stats.totalRevenue * 0.1, stats.totalRevenue * 0.12, stats.totalRevenue * 0.08, stats.totalRevenue * 0.18, stats.totalRevenue * 0.15, stats.totalRevenue * 0.2, stats.totalRevenue * 0.17]
            : [stats.totalRevenue * 0.2, stats.totalRevenue * 0.25, stats.totalRevenue * 0.3, stats.totalRevenue * 0.25])
        : [0, 0, 0, 0, 0, 0, 0].slice(0, period === 'week' ? 7 : 4)
    }],
  };

  // Revenue breakdown: Labor (Profit) vs Parts (Cost)
  const partsRevenue = stats.totalRevenue - stats.laborProfit;
  const pieData = [
    { name: 'Labor (Profit)', population: stats.laborProfit || 1, color: colors.success, legendFontColor: colors.textPrimary },
    { name: 'Parts', population: partsRevenue || 0, color: colors.primary, legendFontColor: colors.textPrimary },
    { name: 'Expenses', population: stats.totalExpenses || 0, color: colors.error, legendFontColor: colors.textPrimary },
  ];

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: () => colors.textSecondary,
    style: { borderRadius: 16 },
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
  };

  const StatCard = ({ icon, label, value, trend, color }: any) => (
    <View style={[styles.statCard, shadows.sm]}>
      <View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
        <Icon source={icon} size={20} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={styles.trendRow}>
          <Icon source={trend > 0 ? 'arrow-up' : 'arrow-down'} size={12} color={trend > 0 ? colors.success : colors.error} />
          <Text style={[styles.trendText, { color: trend > 0 ? colors.success : colors.error }]}>{Math.abs(trend)}%</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surfaceSecondary} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Track your business performance</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollInner}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periodOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setPeriod(option.key)}
              style={[styles.periodPill, period === option.key && styles.periodPillActive]}
            >
              <Text style={[styles.periodText, period === option.key && styles.periodTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Overview Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="cash" label="Revenue" value={formatCurrencyCompact(stats.totalRevenue)} trend={12} color={colors.success} />
          <StatCard icon="currency-inr" label="Profit" value={formatCurrencyCompact(stats.laborProfit)} trend={18} color={colors.primary} />
        </View>
        <View style={styles.statsRow}>
          <StatCard icon="wallet" label="Expenses" value={formatCurrencyCompact(stats.totalExpenses)} trend={-5} color={colors.error} />
          <StatCard icon="clipboard-check" label="Orders" value={stats.ordersCompleted.toString()} trend={8} color={colors.systemIndigo} />
        </View>

        {/* Revenue Chart */}
        <View style={[styles.chartCard, shadows.sm]}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <LineChart
            data={revenueData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            formatYLabel={(value) => `${parseInt(value) / 1000}k`}
          />
        </View>

        {/* Revenue Breakdown */}
        <View style={[styles.chartCard, shadows.sm]}>
          <Text style={styles.chartTitle}>Revenue Breakdown</Text>
          <PieChart
            data={pieData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Quick Stats */}
        <View style={[styles.summaryCard, shadows.sm]}>
          <Text style={styles.summaryTitle}>Quick Stats</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Average Order Value</Text>
            <Text style={styles.summaryValue}>{formatCurrency(stats.averageOrderValue)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Customers</Text>
            <Text style={styles.summaryValue}>{stats.newCustomers}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Monthly Profit</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{formatCurrency(stats.monthlyLaborProfit)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>Profit Margin</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>
              {stats.totalRevenue > 0 ? Math.round((stats.laborProfit / stats.totalRevenue) * 100) : 0}%
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

export default AnalyticsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 16,
    paddingBottom: 32,
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
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  periodPillActive: {
    backgroundColor: colors.primary,
  },
  periodText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.textOnPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 2,
  },
  chartCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  summaryCard: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.separator,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
