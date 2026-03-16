// Analytics controller - handles dashboard stats and analytics
import { orderStore } from '@stores/OrderStore';
import { customerStore } from '@stores/CustomerStore';
import { vehicleStore } from '@stores/VehicleStore';
import { appointmentStore } from '@stores/AppointmentStore';
import { expenseStore } from '@stores/ExpenseStore';
import { ServiceOrder } from '@models/ServiceOrder';

export interface DashboardStats {
  // Counts
  totalCustomers: number;
  totalVehicles: number;
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  completedOrdersToday: number;

  // Appointments
  todayAppointments: number;
  upcomingAppointments: number;

  // Financial
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  outstandingBalance: number;

  // Profit (Labor = Profit)
  totalLaborProfit: number;
  monthlyLaborProfit: number;

  // Recent activity
  recentOrders: ServiceOrder[];
}

export interface RevenueByPeriod {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface OrdersByStatus {
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

class AnalyticsController {
  private static instance: AnalyticsController;

  private constructor() {}

  static getInstance(): AnalyticsController {
    if (!AnalyticsController.instance) {
      AnalyticsController.instance = new AnalyticsController();
    }
    return AnalyticsController.instance;
  }

  // Get dashboard stats
  getDashboardStats(): DashboardStats {
    const orders = orderStore.orders;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedOrdersToday = orders.filter((o) => {
      if (o.status !== 'completed' || !o.completedAt) return false;
      const completedDate = new Date(o.completedAt);
      completedDate.setHours(0, 0, 0, 0);
      return completedDate.getTime() === today.getTime();
    });

    // Calculate monthly figures
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = orders.filter((o) => {
      const createdAt = new Date(o.createdAt);
      return createdAt >= startOfMonth && o.status === 'completed';
    });

    const monthlyRevenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthlyExpenses = expenseStore.currentMonthTotal;
    const completedOrders = orders.filter((o) => o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Labor = Profit (labor charges are pure profit)
    const totalLaborProfit = completedOrders.reduce((sum, o) => sum + (o.totalLabor || 0), 0);
    const monthlyLaborProfit = monthlyOrders.reduce((sum, o) => sum + (o.totalLabor || 0), 0);

    const outstandingBalance = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.balanceDue, 0);

    return {
      // Counts
      totalCustomers: customerStore.customerCount,
      totalVehicles: vehicleStore.vehicleCount,
      totalOrders: orderStore.orderCount,
      activeOrders: orderStore.activeOrders.length,
      pendingOrders: orderStore.pendingOrders.length,
      completedOrdersToday: completedOrdersToday.length,

      // Appointments
      todayAppointments: appointmentStore.todayAppointments.length,
      upcomingAppointments: appointmentStore.upcomingAppointments.length,

      // Financial
      totalRevenue,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,
      outstandingBalance,

      // Profit (Labor = Profit)
      totalLaborProfit,
      monthlyLaborProfit,

      // Recent activity
      recentOrders: orders.slice(0, 5),
    };
  }

  // Get orders by status distribution
  getOrdersByStatus(): OrdersByStatus {
    return {
      pending: orderStore.pendingOrders.length,
      inProgress: orderStore.inProgressOrders.length,
      completed: orderStore.completedOrders.length,
      cancelled: orderStore.orders.filter((o) => o.status === 'cancelled').length,
    };
  }

  // Get revenue for last N months
  getRevenueByMonth(months: number = 6): RevenueByPeriod[] {
    const result: RevenueByPeriod[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const monthlyOrders = orderStore.orders.filter((o) => {
        const createdAt = new Date(o.createdAt);
        return (
          createdAt >= startOfMonth &&
          createdAt <= endOfMonth &&
          o.status === 'completed'
        );
      });

      const monthlyExpenses = expenseStore.expenses.filter((e) => {
        const expenseDate = new Date(e.date);
        return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
      });

      const revenue = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const expenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

      result.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    return result;
  }

  // Get top customers by revenue
  getTopCustomers(limit: number = 5): { customerId: string; name: string; revenue: number }[] {
    const customerRevenue = new Map<string, { name: string; revenue: number }>();

    orderStore.orders.forEach((order) => {
      if (order.status === 'completed') {
        const existing = customerRevenue.get(order.customerId);
        if (existing) {
          existing.revenue += order.totalAmount;
        } else {
          customerRevenue.set(order.customerId, {
            name: order.customerName || 'Unknown',
            revenue: order.totalAmount,
          });
        }
      }
    });

    return Array.from(customerRevenue.entries())
      .map(([customerId, data]) => ({
        customerId,
        name: data.name,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  // Get expense breakdown by category for current month
  getExpenseBreakdown(): { category: string; amount: number; percentage: number }[] {
    const summary = expenseStore.summaryByCategory;
    const total = expenseStore.currentMonthTotal || 1; // Avoid division by zero

    return Object.entries(summary).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / total) * 100,
    }));
  }

  // Get daily orders for current week
  getDailyOrdersThisWeek(): { day: string; count: number }[] {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const result: { day: string; count: number }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const count = orderStore.orders.filter((o) => {
        const createdAt = new Date(o.createdAt);
        return createdAt >= date && createdAt < nextDate;
      }).length;

      result.push({
        day: days[i],
        count,
      });
    }

    return result;
  }
}

// Export singleton instance
export const analyticsController = AnalyticsController.getInstance();
export { AnalyticsController };
