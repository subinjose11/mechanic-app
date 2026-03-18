import { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Alert,
} from 'react-native';
import { Text, Icon, ActivityIndicator, Menu } from 'react-native-paper';
import { useLocalSearchParams, router, useNavigation, usePathname } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOrderStore } from '@stores';
import { useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatCurrency } from '@core/utils/formatCurrency';
import { formatDateTime } from '@core/utils/formatDate';
import { OrderStatus } from '@core/constants';

import { JobInfoCard } from '@presentation/components/order-detail/JobInfoCard';
import { GlassCollapsibleSection } from '@presentation/components/order-detail/GlassCollapsibleSection';
import { WorkItemRow } from '@presentation/components/order-detail/WorkItemRow';
import { PaymentSummary } from '@presentation/components/order-detail/PaymentSummary';
import { SmartBottomBar } from '@presentation/components/order-detail/SmartBottomBar';
import { AddLaborSheet } from '@presentation/components/order-detail/AddLaborSheet';
import { AddPartSheet } from '@presentation/components/order-detail/AddPartSheet';

const OrderDetailScreen = observer(function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const pathname = usePathname();
  const isRootStack = pathname.startsWith('/order-detail');
  const orderStore = useOrderStore();
  const orderController = useOrderController();

  useLayoutEffect(() => {
    const tabNavigator = navigation.getParent()?.getParent();
    tabNavigator?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNavigator?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  const [showLaborSheet, setShowLaborSheet] = useState(false);
  const [showPartsSheet, setShowPartsSheet] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (id) {
      orderController.fetchWithDetails(id);
    }
  }, [id]);

  const order = orderStore.currentOrder;

  // Compute totals inline so MobX can track the deep observable access
  // (useMemo with [order] won't recompute when nested arrays are mutated in place)
  const labor = order ? (order.laborItems || []).reduce((sum: number, i: any) => sum + i.total, 0) : 0;
  const parts = order ? (order.spareParts || []).reduce((sum: number, i: any) => sum + i.total, 0) : 0;
  const paid = order ? (order.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0) : 0;
  const totals = { labor, parts, total: labor + parts, paid, due: labor + parts - paid };

  const handleDeleteOrder = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await orderController.delete(id);
                router.back();
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete order. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddLabor = async (desc: string, amount: number) => {
    if (!id || isAdding) return;
    setIsAdding(true);
    try {
      await orderController.addLaborItem(id, { description: desc, hours: 1, ratePerHour: amount });
      setShowLaborSheet(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddPart = async (name: string, price: number, qty: number) => {
    if (!id || isAdding) return;
    setIsAdding(true);
    try {
      await orderController.addSparePart(id, { partName: name, quantity: qty, unitPrice: price });
      setShowPartsSheet(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLabor = async (itemId: string) => {
    if (!id) return;
    await orderController.deleteLaborItem(id, itemId);
  };

  const handleDeletePart = async (itemId: string) => {
    if (!id) return;
    await orderController.deleteSparePart(id, itemId);
  };

  const handleDeletePayment = (paymentId: string, amount: number) => {
    Alert.alert(
      'Delete Payment',
      `Delete this payment of ${formatCurrency(amount)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            await orderController.deletePayment(id, paymentId);
          },
        },
      ]
    );
  };

  const handleUpdateOdometer = async (value: number) => {
    if (!id) return;
    await orderController.update(id, { kmReading: value });
  };

  const handleUpdateDescription = async (value: string) => {
    if (!id) return;
    await orderController.update(id, { description: value });
  };

  const updateStatus = async (status: OrderStatus) => {
    if (!id) return;
    await orderController.updateStatus(id, status);
  };

  const navigateToPayment = () => {
    router.push(isRootStack ? `/order-detail/${id}/payment` : `/(main)/orders/${id}/payment`);
  };

  const navigateToPreview = () => {
    router.push(isRootStack ? `/order-detail/${id}/preview` : `/(main)/orders/${id}/preview`);
  };

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  const laborCount = order.laborItems?.length || 0;
  const partsCount = order.spareParts?.length || 0;
  const paymentCount = order.payments?.length || 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Icon source="chevron-left" size={24} color={colors.primary} />
          <Text style={styles.backText}>Jobs</Text>
        </Pressable>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Pressable style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
              <Icon source="dots-vertical" size={22} color="rgba(148,163,184,0.7)" />
            </Pressable>
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={handleDeleteOrder}
            title="Delete Order"
            leadingIcon="delete"
            titleStyle={{ color: colors.error }}
          />
        </Menu>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Job Info Card — Description + Vehicle + Odometer */}
        <JobInfoCard
          vehicleMake={order.vehicleMake}
          vehicleModel={order.vehicleModel}
          customerName={order.customerName}
          licensePlate={order.vehicleLicensePlate}
          status={order.status}
          createdAt={order.createdAt}
          description={order.description}
          kmReading={order.kmReading}
          onSaveOdometer={handleUpdateOdometer}
          onSaveDescription={handleUpdateDescription}
          onStatusChange={updateStatus}
        />

        {/* 3. Labor */}
        <GlassCollapsibleSection
          title="Labor"
          emoji="🔧"
          count={laborCount}
          subtotal={totals.labor}
          accentColor="#6366F1"
          accentDimColor="rgba(99,102,241,0.12)"
          accentBorderColor="rgba(99,102,241,0.15)"
          glowColor="rgba(99,102,241,0.08)"
          glowPosition="bottom-right"
          onAdd={() => setShowLaborSheet(true)}
        >
          {order.laborItems?.map((item) => (
            <WorkItemRow
              key={item.id}
              name={item.description}
              detail=""
              amount={item.total}
              onDelete={() => handleDeleteLabor(item.id)}
            />
          ))}
        </GlassCollapsibleSection>

        {/* 4. Parts */}
        <GlassCollapsibleSection
          title="Parts"
          emoji="⚙️"
          count={partsCount}
          subtotal={totals.parts}
          accentColor="#EC4899"
          accentDimColor="rgba(236,72,153,0.12)"
          accentBorderColor="rgba(236,72,153,0.15)"
          onAdd={() => setShowPartsSheet(true)}
        >
          {order.spareParts?.map((item) => (
            <WorkItemRow
              key={item.id}
              name={item.partName}
              detail={item.quantity > 1 ? `Qty: ${item.quantity} × ${formatCurrency(item.unitPrice)}` : '1 unit'}
              amount={item.total}
              onDelete={() => handleDeletePart(item.id)}
            />
          ))}
        </GlassCollapsibleSection>

        {/* 5. Payments */}
        <GlassCollapsibleSection
          title="Payments"
          emoji="💳"
          count={paymentCount}
          subtotal={totals.paid}
          accentColor="#22C55E"
          accentDimColor="rgba(34,197,94,0.12)"
          accentBorderColor="rgba(34,197,94,0.15)"
          glowColor="rgba(34,197,94,0.08)"
          glowPosition="top-right"
          onAdd={navigateToPayment}
        >
          {order.payments?.map((payment) => (
            <WorkItemRow
              key={payment.id}
              name={
                payment.paymentMethod === 'cash'
                  ? 'Cash Payment'
                  : payment.paymentMethod === 'upi'
                  ? 'UPI Payment'
                  : 'Card Payment'
              }
              detail={`${payment.paymentType === 'advance' ? 'Advance' : 'Final'} · ${formatDateTime(payment.date)}`}
              amount={payment.amount}
              amountColor="#22C55E"
              onDelete={() => handleDeletePayment(payment.id, payment.amount)}
            />
          ))}
        </GlassCollapsibleSection>

        {/* 6. Payment Summary */}
        <PaymentSummary
          laborTotal={totals.labor}
          partsTotal={totals.parts}
          grandTotal={totals.total}
          amountPaid={totals.paid}
          balanceDue={totals.due}
        />

      </ScrollView>

      {/* Bottom Bar */}
      <SmartBottomBar
        onViewReceipt={navigateToPreview}
      />

      {/* Bottom Sheets */}
      <AddLaborSheet
        visible={showLaborSheet}
        onClose={() => setShowLaborSheet(false)}
        onAdd={handleAddLabor}
        isAdding={isAdding}
      />
      <AddPartSheet
        visible={showPartsSheet}
        onClose={() => setShowPartsSheet(false)}
        onAdd={handleAddPart}
        isAdding={isAdding}
      />
    </View>
  );
});

export default OrderDetailScreen;

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
    fontSize: 15,
    color: colors.textSecondary,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    paddingVertical: 8,
    paddingRight: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: -2,
  },
  menuBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    backgroundColor: colors.surface,
  },
  scrollView: {
    flex: 1,
  },
});
