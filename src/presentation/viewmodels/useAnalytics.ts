import { useQuery } from '@tanstack/react-query';
import { container } from '@core/di/container';
import { orderKeys } from './useOrders';
import { paymentKeys } from './usePayments';
import { expenseKeys } from './useExpenses';
import { appointmentKeys } from './useAppointments';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  dashboard: () => [...analyticsKeys.all, 'dashboard'] as const,
  revenue: (startDate?: Date, endDate?: Date) =>
    [...analyticsKeys.all, 'revenue', { startDate, endDate }] as const,
  profitLoss: (startDate?: Date, endDate?: Date) =>
    [...analyticsKeys.all, 'profitLoss', { startDate, endDate }] as const,
};

// Dashboard analytics (combines multiple stats)
export function useDashboardAnalytics() {
  const orderStatsQuery = useQuery({
    queryKey: orderKeys.stats(),
    queryFn: () => container.orderRepository.getOrderStats(),
  });

  const paymentStatsQuery = useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: () => container.paymentRepository.getPaymentStats(),
  });

  const expenseStatsQuery = useQuery({
    queryKey: expenseKeys.stats(),
    queryFn: () => container.expenseRepository.getExpenseStats(),
  });

  const appointmentStatsQuery = useQuery({
    queryKey: appointmentKeys.stats(),
    queryFn: () => container.appointmentRepository.getAppointmentStats(),
  });

  const isLoading =
    orderStatsQuery.isLoading ||
    paymentStatsQuery.isLoading ||
    expenseStatsQuery.isLoading ||
    appointmentStatsQuery.isLoading;

  const isError =
    orderStatsQuery.isError ||
    paymentStatsQuery.isError ||
    expenseStatsQuery.isError ||
    appointmentStatsQuery.isError;

  const data = {
    orders: orderStatsQuery.data,
    payments: paymentStatsQuery.data,
    expenses: expenseStatsQuery.data,
    appointments: appointmentStatsQuery.data,
  };

  // Calculate profit/loss
  const profitLoss = data.payments && data.expenses
    ? data.payments.totalRevenue - data.expenses.totalExpenses
    : null;

  return {
    isLoading,
    isError,
    data: {
      ...data,
      profitLoss,
    },
    refetch: () => {
      orderStatsQuery.refetch();
      paymentStatsQuery.refetch();
      expenseStatsQuery.refetch();
      appointmentStatsQuery.refetch();
    },
  };
}

// Revenue analytics with date range
export function useRevenueAnalytics(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: analyticsKeys.revenue(startDate, endDate),
    queryFn: () => container.paymentRepository.getPaymentStats(startDate, endDate),
  });
}

// Expense analytics with date range
export function useExpenseAnalytics(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: analyticsKeys.profitLoss(startDate, endDate),
    queryFn: async () => {
      const [paymentStats, expenseStats] = await Promise.all([
        container.paymentRepository.getPaymentStats(startDate, endDate),
        container.expenseRepository.getExpenseStats(startDate, endDate),
      ]);

      return {
        revenue: paymentStats.totalRevenue,
        expenses: expenseStats.totalExpenses,
        profit: paymentStats.totalRevenue - expenseStats.totalExpenses,
        paymentsByMethod: paymentStats.paymentsByMethod,
        expensesByCategory: expenseStats.expensesByCategory,
        monthlyExpenseTrend: expenseStats.monthlyTrend,
      };
    },
  });
}

// Custom date range analytics hook
export function useAnalyticsByDateRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: [...analyticsKeys.all, 'dateRange', { startDate, endDate }],
    queryFn: async () => {
      const [paymentStats, expenseStats] = await Promise.all([
        container.paymentRepository.getPaymentStats(startDate, endDate),
        container.expenseRepository.getExpenseStats(startDate, endDate),
      ]);

      // Calculate daily/weekly/monthly revenue based on date range
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        revenue: {
          total: paymentStats.totalRevenue,
          advances: paymentStats.totalAdvances,
          finalPayments: paymentStats.totalFinalPayments,
          byMethod: paymentStats.paymentsByMethod,
          dailyAverage: daysDiff > 0 ? paymentStats.totalRevenue / daysDiff : 0,
        },
        expenses: {
          total: expenseStats.totalExpenses,
          byCategory: expenseStats.expensesByCategory,
          monthlyTrend: expenseStats.monthlyTrend,
          dailyAverage: daysDiff > 0 ? expenseStats.totalExpenses / daysDiff : 0,
        },
        profitLoss: {
          gross: paymentStats.totalRevenue - expenseStats.totalExpenses,
          dailyAverage:
            daysDiff > 0
              ? (paymentStats.totalRevenue - expenseStats.totalExpenses) / daysDiff
              : 0,
        },
        period: {
          startDate,
          endDate,
          days: daysDiff,
        },
      };
    },
    enabled: !!startDate && !!endDate,
  });
}

// This month's analytics
export function useThisMonthAnalytics() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return useAnalyticsByDateRange(startOfMonth, endOfMonth);
}

// This week's analytics
export function useThisWeekAnalytics() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return useAnalyticsByDateRange(startOfWeek, endOfWeek);
}

// Today's analytics
export function useTodayAnalytics() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  return useAnalyticsByDateRange(startOfDay, endOfDay);
}
