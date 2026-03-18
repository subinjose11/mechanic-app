import { useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { Text, Icon, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrderStore, useAuthStore, useCustomerStore } from '@stores';
import { useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatDate } from '@core/utils/formatDate';
import { formatCurrency } from '@core/utils/formatCurrency';
import { pdfGenerator } from '@services/pdf/PdfGenerator';

const ReceiptPreviewScreen = observer(function ReceiptPreviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const orderStore = useOrderStore();
  const orderController = useOrderController();
  const authStore = useAuthStore();
  const customerStore = useCustomerStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useLayoutEffect(() => {
    const tabNavigator = navigation.getParent()?.getParent()?.getParent();
    tabNavigator?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      tabNavigator?.setOptions({ tabBarStyle: undefined });
    };
  }, [navigation]);

  useEffect(() => {
    if (id && !orderStore.currentOrder) {
      orderController.fetchWithDetails(id);
    }
  }, [id]);

  useEffect(() => {
    const order = orderStore.currentOrder;
    if (order?.customerId) {
      const existing = customerStore.getById(order.customerId);
      if (!existing) {
        customerStore.fetchById(order.customerId);
      }
    }
  }, [orderStore.currentOrder?.customerId]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const order = orderStore.currentOrder;
  const isLoading = orderStore.isLoading;

  const totals = useMemo(() => {
    if (!order) return { labor: 0, parts: 0, total: 0, paid: 0, due: 0 };
    const labor = (order.laborItems || []).reduce((sum, i) => sum + i.total, 0);
    const parts = (order.spareParts || []).reduce((sum, i) => sum + i.total, 0);
    const paid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
    return { labor, parts, total: labor + parts, paid, due: labor + parts - paid };
  }, [order]);

  const generateInvoiceNumber = () => {
    if (!order) return '';
    const date = new Date(order.createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `INV-${year}${month}-${order.id.slice(-6).toUpperCase()}`;
  };

  const handleSharePdf = async () => {
    if (!order) return;

    try {
      const shop = authStore.user;
      if (!shop) {
        Alert.alert('Error', 'Shop information not available.');
        return;
      }

      const customer = order.customerId ? customerStore.getById(order.customerId) : undefined;

      await pdfGenerator.shareInvoice({
        order,
        shop,
        customerName: order.customerName || '',
        customerPhone: customer?.phone || '',
        customerAddress: customer?.address || '',
        vehicleName: `${order.vehicleMake} ${order.vehicleModel}`,
        licensePlate: order.vehicleLicensePlate || '',
      });
    } catch (error) {
      console.error('PDF share error:', error);
      Alert.alert('Error', 'Failed to generate PDF invoice.');
    }
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Generating receipt...</Text>
      </View>
    );
  }

  const invoiceNo = generateInvoiceNumber();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={['#0C0C14', '#06060A']}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        <View style={styles.headerContent}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Icon source="chevron-left" size={24} color={colors.primary} />
            <Text style={styles.backBtnText}>Back</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Receipt Preview</Text>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.receiptWrapper,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Receipt Card */}
          <View style={styles.receiptCard}>
            {/* Decorative Top */}
            <View style={styles.receiptTop}>
              <View style={styles.zigzagContainer}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={styles.zigzagTriangle} />
                ))}
              </View>
            </View>

            {/* Invoice Info */}
            <View style={styles.invoiceInfo}>
              <View style={styles.invoiceRow}>
                <View style={styles.invoiceField}>
                  <Text style={styles.invoiceLabel}>Invoice No.</Text>
                  <Text style={styles.invoiceValue}>{invoiceNo}</Text>
                </View>
                <View style={styles.invoiceField}>
                  <Text style={styles.invoiceLabel}>Date</Text>
                  <Text style={styles.invoiceValue}>{formatDate(order.createdAt)}</Text>
                </View>
              </View>
            </View>

            {/* Vehicle & Customer */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <Icon source="car" size={16} color={colors.primary} />
                </View>
                <Text style={styles.sectionLabel}>VEHICLE DETAILS</Text>
              </View>
              <View style={styles.vehicleCard}>
                <View style={styles.plateBox}>
                  <Text style={styles.plateText}>{order.vehicleLicensePlate || 'N/A'}</Text>
                </View>
                <View style={styles.vehicleDetails}>
                  <Text style={styles.vehicleMake}>
                    {order.vehicleMake} {order.vehicleModel}
                  </Text>
                  <View style={styles.customerRow}>
                    <Icon source="account" size={14} color={colors.textTertiary} />
                    <Text style={styles.customerText}>{order.customerName}</Text>
                  </View>
                  {order.kmReading && (
                    <View style={styles.odometerRow}>
                      <Icon source="speedometer" size={14} color={colors.textTertiary} />
                      <Text style={styles.odometerText}>{order.kmReading.toLocaleString()} km</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Work Description */}
            {order.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Icon source="clipboard-text" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionLabel}>WORK PERFORMED</Text>
                </View>
                <View style={styles.descriptionBox}>
                  <Text style={styles.descriptionText}>{order.description}</Text>
                </View>
              </View>
            )}

            {/* Labor */}
            {order.laborItems && order.laborItems.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Icon source="wrench" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionLabel}>LABOR CHARGES</Text>
                </View>
                <View style={styles.itemsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Description</Text>
                    <Text style={styles.tableHeaderAmount}>Amount</Text>
                  </View>
                  {order.laborItems.map((item, index) => (
                    <View
                      key={item.id}
                      style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                    >
                      <Text style={styles.tableItem}>{item.description}</Text>
                      <Text style={styles.tableAmount}>{formatCurrency(item.total)}</Text>
                    </View>
                  ))}
                  <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Labor Subtotal</Text>
                    <Text style={styles.subtotalValue}>{formatCurrency(totals.labor)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Parts */}
            {order.spareParts && order.spareParts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Icon source="cog" size={16} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionLabel}>SPARE PARTS</Text>
                </View>
                <View style={styles.itemsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Part Name</Text>
                    <Text style={styles.tableHeaderQty}>Qty</Text>
                    <Text style={styles.tableHeaderAmount}>Amount</Text>
                  </View>
                  {order.spareParts.map((item, index) => (
                    <View
                      key={item.id}
                      style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                    >
                      <Text style={styles.tableItem}>{item.partName}</Text>
                      <Text style={styles.tableQty}>{item.quantity}</Text>
                      <Text style={styles.tableAmount}>{formatCurrency(item.total)}</Text>
                    </View>
                  ))}
                  <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Parts Subtotal</Text>
                    <Text style={styles.subtotalValue}>{formatCurrency(totals.parts)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Payment History */}
            {order.payments && order.payments.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIcon}>
                    <Icon source="cash-multiple" size={16} color={colors.success} />
                  </View>
                  <Text style={styles.sectionLabel}>PAYMENTS RECEIVED</Text>
                </View>
                <View style={styles.paymentsContainer}>
                  {order.payments.map((payment) => (
                    <View key={payment.id} style={styles.paymentRow}>
                      <View style={styles.paymentInfo}>
                        <View style={styles.paymentMethodBadge}>
                          <Icon
                            source={
                              payment.paymentMethod === 'cash'
                                ? 'cash'
                                : payment.paymentMethod === 'card'
                                ? 'credit-card'
                                : payment.paymentMethod === 'upi'
                                ? 'cellphone'
                                : 'bank'
                            }
                            size={14}
                            color={colors.success}
                          />
                          <Text style={styles.paymentMethod}>
                            {payment.paymentMethod === 'cash'
                              ? 'Cash'
                              : payment.paymentMethod === 'card'
                              ? 'Card'
                              : payment.paymentMethod === 'upi'
                              ? 'UPI'
                              : 'Bank'}
                          </Text>
                        </View>
                        <Text style={styles.paymentDate}>{formatDate(payment.paidAt)}</Text>
                      </View>
                      <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Grand Total */}
            <View style={styles.grandTotalSection}>
              <View style={styles.totalLine}>
                <Text style={styles.totalLineLabel}>Subtotal</Text>
                <Text style={styles.totalLineValue}>{formatCurrency(totals.total)}</Text>
              </View>
              <View style={styles.totalLine}>
                <Text style={[styles.totalLineLabel, { color: colors.success }]}>Paid</Text>
                <Text style={[styles.totalLineValue, { color: colors.success }]}>
                  - {formatCurrency(totals.paid)}
                </Text>
              </View>
              <View style={styles.grandTotalLine}>
                <Text style={styles.grandTotalLabel}>Balance Due</Text>
                <Text style={[styles.grandTotalValue, totals.due > 0 && { color: colors.error }]}>
                  {formatCurrency(totals.due)}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.receiptFooter}>
              <View style={styles.thanksBox}>
                <Icon source="heart" size={16} color={colors.error} />
                <Text style={styles.thanksText}>Thank you for your business!</Text>
              </View>
              <Text style={styles.footerNote}>
                This is a computer-generated receipt and does not require a signature.
              </Text>
            </View>

            {/* Decorative Bottom */}
            <View style={styles.receiptBottom}>
              <View style={styles.zigzagContainerBottom}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={styles.zigzagTriangleBottom} />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={styles.whatsappButton} onPress={handleSharePdf}>
          <LinearGradient
            colors={[colors.primary, '#4361ee']}
            style={styles.whatsappGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon source="file-pdf-box" size={24} color="#fff" />
            <Text style={styles.whatsappText}>Share PDF Invoice</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
});

export default ReceiptPreviewScreen;

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
  // Header
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
    paddingVertical: 8,
    paddingRight: 8,
  },
  backBtnText: {
    fontSize: 17,
    color: colors.primary,
    marginLeft: -2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  receiptWrapper: {
    padding: 16,
  },
  // Receipt Card
  receiptCard: {
    backgroundColor: colors.surface,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: 'hidden',
  },
  receiptTop: {
    height: 12,
    overflow: 'hidden',
  },
  zigzagContainer: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
  },
  zigzagTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.background,
  },
  receiptBottom: {
    height: 12,
    overflow: 'hidden',
  },
  zigzagContainerBottom: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  zigzagTriangleBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.background,
  },
  // Invoice Info
  invoiceInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  invoiceRow: {
    flexDirection: 'row',
  },
  invoiceField: {
    flex: 1,
  },
  invoiceLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  invoiceValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  // Section
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  sectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textTertiary,
    letterSpacing: 1,
  },
  // Vehicle Card
  vehicleCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateBox: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 14,
  },
  plateText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleMake: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  odometerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  odometerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  // Description
  descriptionBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  // Items Table
  itemsTable: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.separator,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  tableHeaderQty: {
    width: 40,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  tableHeaderAmount: {
    width: 90,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textTertiary,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  tableItem: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  tableQty: {
    width: 40,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tableAmount: {
    width: 90,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  subtotalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  // Payments
  paymentsContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.separator,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  paymentInfo: {},
  paymentMethodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
    marginBottom: 4,
  },
  paymentMethod: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success,
  },
  paymentDate: {
    fontSize: 12,
    color: colors.textTertiary,
    marginLeft: 4,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.success,
  },
  // Grand Total
  grandTotalSection: {
    padding: 20,
    backgroundColor: colors.surfaceSecondary,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLineLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalLineValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: colors.separator,
    borderStyle: 'dashed',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  // Footer
  receiptFooter: {
    padding: 20,
    alignItems: 'center',
  },
  thanksBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  thanksText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  footerNote: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  whatsappButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  whatsappGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  whatsappText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
