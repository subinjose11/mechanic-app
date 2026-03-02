import { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Icon, IconButton, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Card, Button, StatusBadge } from '@presentation/components/common';
import { useOrderWithDetails, useUpdateOrderStatus } from '@presentation/viewmodels/useOrders';
import { useVehicle } from '@presentation/viewmodels/useVehicles';
import { useCustomer } from '@presentation/viewmodels/useCustomers';
import { colors } from '@theme/colors';
import { formatDate, formatDateTime } from '@core/utils/formatDate';
import { formatCurrency } from '@core/utils/formatCurrency';
import { PAYMENT_METHOD_LABELS, OrderStatus } from '@core/constants';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: order, isLoading } = useOrderWithDetails(id || '');
  const { data: vehicle } = useVehicle(order?.vehicleId || '');
  const { data: customer } = useCustomer(order?.customerId || '');
  const updateStatusMutation = useUpdateOrderStatus();

  // Calculate totals
  const { totalLabor, totalParts, totalAmount, totalPaid, balanceDue } = useMemo(() => {
    if (!order) return { totalLabor: 0, totalParts: 0, totalAmount: 0, totalPaid: 0, balanceDue: 0 };

    const laborItems = order.laborItems || [];
    const spareParts = order.spareParts || [];
    const payments = order.payments || [];

    const tLabor = laborItems.reduce((sum, item) => sum + item.total, 0);
    const tParts = spareParts.reduce((sum, item) => sum + item.total, 0);
    const tAmount = tLabor + tParts;
    const tPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalLabor: tLabor,
      totalParts: tParts,
      totalAmount: tAmount,
      totalPaid: tPaid,
      balanceDue: tAmount - tPaid,
    };
  }, [order]);

  const vehicleName = vehicle ? `${vehicle.make} ${vehicle.model}${vehicle.year ? ` (${vehicle.year})` : ''}` : 'Loading...';
  const licensePlate = vehicle?.licensePlate || '';
  const customerName = customer?.name || 'Loading...';
  const customerPhone = customer?.phone || '';

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setMenuVisible(false);
    if (!id) return;
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleGeneratePDF = () => {
    // TODO: Generate PDF invoice
  };

  const handleAddPayment = () => {
    router.push(`/(main)/orders/${id}/payment`);
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Order #${id}`,
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  iconColor={colors.textOnPrimary}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item onPress={() => handleUpdateStatus('pending' as OrderStatus)} title="Mark Pending" />
              <Menu.Item onPress={() => handleUpdateStatus('in_progress' as OrderStatus)} title="Mark In Progress" />
              <Menu.Item onPress={() => handleUpdateStatus('completed' as OrderStatus)} title="Mark Completed" />
              <Divider />
              <Menu.Item onPress={handleGeneratePDF} title="Generate Invoice" leadingIcon="file-pdf-box" />
            </Menu>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Status & Basic Info */}
        <Card style={styles.card}>
          <View style={styles.statusRow}>
            <StatusBadge status={order.status} />
            <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
          </View>

          <View style={styles.vehicleSection}>
            <View style={styles.vehicleIcon}>
              <Icon source="car" size={28} color={colors.primary} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicleName}</Text>
              <Text style={styles.licensePlate}>{licensePlate}</Text>
              {order.kmReading && (
                <Text style={styles.kmReading}>KM: {order.kmReading.toLocaleString()}</Text>
              )}
            </View>
          </View>

          <View style={styles.customerRow}>
            <Icon source="account" size={18} color={colors.textSecondary} />
            <Text style={styles.customerName}>{customerName}</Text>
            <IconButton
              icon="phone"
              size={18}
              onPress={() => {}}
            />
          </View>

          {order.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.descriptionText}>{order.description}</Text>
            </View>
          )}

          {order.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          )}
        </Card>

        {/* Labor Items */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Labor</Text>
            <IconButton icon="plus" size={20} onPress={() => router.push(`/(main)/orders/${id}/labor`)} />
          </View>

          {(order.laborItems || []).length > 0 ? (
            <>
              {(order.laborItems || []).map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <Divider style={styles.divider} />}
                  <View style={styles.lineItem}>
                    <View style={styles.lineItemInfo}>
                      <Text style={styles.lineItemName}>{item.description}</Text>
                      <Text style={styles.lineItemDetails}>
                        {item.hours} hrs x {formatCurrency(item.ratePerHour)}/hr
                      </Text>
                    </View>
                    <Text style={styles.lineItemTotal}>{formatCurrency(item.total)}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Labor Total</Text>
                <Text style={styles.subtotalValue}>{formatCurrency(totalLabor)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No labor items added yet</Text>
          )}
        </Card>

        {/* Spare Parts */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spare Parts</Text>
            <IconButton icon="plus" size={20} onPress={() => router.push(`/(main)/orders/${id}/parts`)} />
          </View>

          {(order.spareParts || []).length > 0 ? (
            <>
              {(order.spareParts || []).map((item, index) => (
                <View key={item.id}>
                  {index > 0 && <Divider style={styles.divider} />}
                  <View style={styles.lineItem}>
                    <View style={styles.lineItemInfo}>
                      <Text style={styles.lineItemName}>{item.partName}</Text>
                      <Text style={styles.lineItemDetails}>
                        {item.partNumber && `${item.partNumber} • `}
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </Text>
                    </View>
                    <Text style={styles.lineItemTotal}>{formatCurrency(item.total)}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Parts Total</Text>
                <Text style={styles.subtotalValue}>{formatCurrency(totalParts)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No spare parts added yet</Text>
          )}
        </Card>

        {/* Bill Summary */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Labor</Text>
            <Text style={styles.billValue}>{formatCurrency(totalLabor)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Parts</Text>
            <Text style={styles.billValue}>{formatCurrency(totalParts)}</Text>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.paidLabel}>Paid</Text>
            <Text style={styles.paidValue}>- {formatCurrency(totalPaid)}</Text>
          </View>
          <View style={[styles.billRow, styles.balanceRow]}>
            <Text style={styles.balanceLabel}>Balance Due</Text>
            <Text style={[styles.balanceValue, balanceDue > 0 && styles.balanceDue]}>
              {formatCurrency(balanceDue)}
            </Text>
          </View>
        </Card>

        {/* Payments */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payments</Text>
            <Button mode="text" onPress={handleAddPayment}>
              Add Payment
            </Button>
          </View>

          {(order.payments || []).length > 0 ? (
            (order.payments || []).map((payment, index) => (
              <View key={payment.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View style={styles.paymentItem}>
                  <View>
                    <Text style={styles.paymentType}>
                      {payment.paymentType === 'advance' ? 'Advance' : 'Final Payment'}
                    </Text>
                    <Text style={styles.paymentDetails}>
                      {PAYMENT_METHOD_LABELS[payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]} • {formatDate(payment.date)}
                    </Text>
                  </View>
                  <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No payments recorded yet</Text>
          )}
        </Card>

        {/* Photos Section */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <IconButton icon="camera-plus" size={20} onPress={() => router.push(`/(main)/orders/${id}/photos`)} />
          </View>
          {(order.photos || []).length > 0 ? (
            <View style={styles.photosPreview}>
              {(order.photos || []).slice(0, 4).map((photo, index) => (
                <View key={photo.id} style={styles.photoThumb}>
                  <Icon source="image" size={24} color={colors.textSecondary} />
                </View>
              ))}
              {(order.photos || []).length > 4 && (
                <View style={styles.morePhotos}>
                  <Text style={styles.morePhotosText}>+{(order.photos || []).length - 4}</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.emptyText}>No photos added yet</Text>
          )}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            icon="file-pdf-box"
            onPress={handleGeneratePDF}
            style={styles.actionButton}
          >
            Generate Invoice
          </Button>
          {balanceDue > 0 && (
            <Button
              mode="contained"
              icon="cash"
              onPress={handleAddPayment}
              style={styles.actionButton}
            >
              Record Payment
            </Button>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
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
  card: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    marginLeft: 12,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  licensePlate: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  kmReading: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  descriptionBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  notesBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: `${colors.warning}10`,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.warning,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  divider: {
    marginVertical: 8,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  lineItemDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lineItemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  subtotalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  billLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  billValue: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  paidLabel: {
    fontSize: 14,
    color: colors.success,
  },
  paidValue: {
    fontSize: 14,
    color: colors.success,
  },
  balanceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.success,
  },
  balanceDue: {
    color: colors.error,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  paymentDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  photosPreview: {
    flexDirection: 'row',
    gap: 8,
  },
  photoThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotos: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
});
