import { useState, useMemo, useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Pressable,
  Modal,
  TextInput,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Icon, ActivityIndicator, Menu } from 'react-native-paper';
import { useLocalSearchParams, router, useNavigation } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useOrderStore } from '@stores';
import { useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatDateTime } from '@core/utils/formatDate';
import { formatCurrency } from '@core/utils/formatCurrency';
import { OrderStatus } from '@core/constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Bottom Sheet Component
function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalContainer}
      >
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.bottomSheet,
            { paddingBottom: insets.bottom + 20, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>{title}</Text>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Action Card Component
function ActionCard({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onPress,
  showAdd,
}: {
  icon: string;
  iconBg: string[];
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showAdd?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
      onPress={onPress}
    >
      <LinearGradient colors={iconBg} style={styles.actionIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Icon source={icon} size={22} color="#fff" />
      </LinearGradient>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle && <Text style={styles.actionSubtitle}>{subtitle}</Text>}
      </View>
      {value && (
        <View style={styles.actionValueContainer}>
          <Text style={styles.actionValue}>{value}</Text>
        </View>
      )}
      {showAdd && (
        <View style={styles.actionAddBadge}>
          <Icon source="plus" size={18} color={colors.primary} />
        </View>
      )}
      <Icon source="chevron-right" size={22} color={colors.systemGray3} />
    </Pressable>
  );
}

const OrderDetailScreen = observer(function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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
  const [laborDesc, setLaborDesc] = useState('');
  const [laborAmount, setLaborAmount] = useState('');
  const [partName, setPartName] = useState('');
  const [partPrice, setPartPrice] = useState('');
  const [partQty, setPartQty] = useState('1');
  const [isAdding, setIsAdding] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

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

  useEffect(() => {
    if (id) {
      orderController.fetchWithDetails(id);
    }
  }, [id]);

  const order = orderStore.currentOrder;
  const isLoading = orderStore.isLoading;

  const totals = useMemo(() => {
    if (!order) return { labor: 0, parts: 0, total: 0, paid: 0, due: 0 };
    const labor = (order.laborItems || []).reduce((sum, i) => sum + i.total, 0);
    const parts = (order.spareParts || []).reduce((sum, i) => sum + i.total, 0);
    const paid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0);
    return { labor, parts, total: labor + parts, paid, due: labor + parts - paid };
  }, [order]);

  const handleAddLabor = async (desc: string, amount: number) => {
    if (!id || isAdding) return;
    setIsAdding(true);
    try {
      await orderController.addLaborItem(id, { description: desc, hours: 1, ratePerHour: amount });
      setLaborDesc('');
      setLaborAmount('');
      setShowLaborSheet(false);
    } catch (e) {
      console.error(e);
    }
    setIsAdding(false);
  };

  const handleAddPart = async (name: string, price: number, qty: number) => {
    if (!id || isAdding) return;
    setIsAdding(true);
    try {
      await orderController.addSparePart(id, { partName: name, quantity: qty, unitPrice: price });
      setPartName('');
      setPartPrice('');
      setPartQty('1');
      setShowPartsSheet(false);
    } catch (e) {
      console.error(e);
    }
    setIsAdding(false);
  };

  const handleDeleteLabor = async (itemId: string) => {
    if (!id) return;
    await orderController.deleteLaborItem(id, itemId);
  };

  const handleDeletePart = async (itemId: string) => {
    if (!id) return;
    await orderController.deleteSparePart(id, itemId);
  };

  const updateStatus = async (status: OrderStatus) => {
    if (!id) return;
    await orderController.updateStatus(id, status);
  };

  if (isLoading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  const laborCount = order.laborItems?.length || 0;
  const partsCount = order.spareParts?.length || 0;
  const paymentCount = order.payments?.length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'in_progress': return colors.primary;
      default: return colors.systemOrange;
    }
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
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Icon source="arrow-left" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerLabel}>Job Details</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable style={styles.menuBtn} onPress={() => setMenuVisible(true)}>
                <Icon source="dots-vertical" size={24} color="#fff" />
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

        {/* Vehicle Info */}
        <View style={styles.vehicleSection}>
          <Text style={styles.vehicleName}>
            {order.vehicleMake} {order.vehicleModel}
          </Text>
          <Text style={styles.customerName}>{order.customerName}</Text>

          {/* Plate & KM Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>REG NO</Text>
              <Text style={styles.infoValue}>{order.vehicleLicensePlate || 'N/A'}</Text>
            </View>
            {order.kmReading && (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>ODOMETER</Text>
                <Text style={styles.infoValue}>{order.kmReading.toLocaleString()} km</Text>
              </View>
            )}
          </View>
        </View>

        {/* Status & Date */}
        <View style={styles.metaRow}>
          <View style={[styles.statusPill, { backgroundColor: getStatusColor(order.status) + '30' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(order.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {order.status === 'pending' ? 'Pending' : order.status === 'in_progress' ? 'In Progress' : 'Completed'}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDateTime(order.createdAt)}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 200 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(totals.total)}</Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>{formatCurrency(totals.paid)}</Text>
            <Text style={styles.statLabel}>Paid</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, totals.due > 0 && { color: colors.error }]}>
              {formatCurrency(totals.due)}
            </Text>
            <Text style={styles.statLabel}>Balance</Text>
          </View>
        </View>

        {/* Description Card */}
        {order.description && (
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Icon source="clipboard-text-outline" size={18} color={colors.primary} />
              <Text style={styles.descriptionTitle}>Work Description</Text>
            </View>
            <Text style={styles.descriptionText}>{order.description}</Text>
          </View>
        )}

        {/* Work & Parts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon source="tools" size={20} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Work & Parts</Text>
          </View>

          <ActionCard
            icon="wrench"
            iconBg={[colors.primary, '#4361ee']}
            title="Labor"
            subtitle={laborCount > 0 ? `${laborCount} service${laborCount > 1 ? 's' : ''}` : 'Add labor charges'}
            value={laborCount > 0 ? formatCurrency(totals.labor) : undefined}
            onPress={() => setShowLaborSheet(true)}
            showAdd={laborCount === 0}
          />

          {laborCount > 0 && (
            <View style={styles.itemsContainer}>
              {order.laborItems?.map((item, index) => (
                <View key={item.id} style={[styles.itemRow, index === 0 && { borderTopWidth: 0 }]}>
                  <View style={styles.itemDot} />
                  <Text style={styles.itemName}>{item.description}</Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.total)}</Text>
                  <Pressable style={styles.itemDeleteBtn} onPress={() => handleDeleteLabor(item.id)} hitSlop={8}>
                    <Icon source="close-circle" size={20} color={colors.systemGray3} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <ActionCard
            icon="cog"
            iconBg={['#f72585', '#b5179e']}
            title="Parts"
            subtitle={partsCount > 0 ? `${partsCount} part${partsCount > 1 ? 's' : ''}` : 'Add spare parts'}
            value={partsCount > 0 ? formatCurrency(totals.parts) : undefined}
            onPress={() => setShowPartsSheet(true)}
            showAdd={partsCount === 0}
          />

          {partsCount > 0 && (
            <View style={styles.itemsContainer}>
              {order.spareParts?.map((item, index) => (
                <View key={item.id} style={[styles.itemRow, index === 0 && { borderTopWidth: 0 }]}>
                  <View style={[styles.itemDot, { backgroundColor: '#f72585' }]} />
                  <Text style={styles.itemName}>
                    {item.partName}
                    {item.quantity > 1 && <Text style={styles.itemQty}> × {item.quantity}</Text>}
                  </Text>
                  <Text style={styles.itemPrice}>{formatCurrency(item.total)}</Text>
                  <Pressable style={styles.itemDeleteBtn} onPress={() => handleDeletePart(item.id)} hitSlop={8}>
                    <Icon source="close-circle" size={20} color={colors.systemGray3} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon source="credit-card-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Payments</Text>
          </View>

          <ActionCard
            icon="cash"
            iconBg={['#06d6a0', '#118ab2']}
            title="Payment History"
            subtitle={paymentCount > 0 ? `${paymentCount} payment${paymentCount > 1 ? 's' : ''}` : 'Record payment'}
            value={paymentCount > 0 ? formatCurrency(totals.paid) : undefined}
            onPress={() => router.push(`/(main)/orders/${id}/payment`)}
            showAdd={paymentCount === 0}
          />
        </View>

        {/* Status Update */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon source="flag-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Update Status</Text>
          </View>
          <View style={styles.statusButtonsContainer}>
            {(['pending', 'in_progress', 'completed'] as OrderStatus[]).map((s) => {
              const isActive = order.status === s;
              const statusColors = {
                pending: { bg: colors.warningDim, color: colors.systemOrange, icon: 'clock-outline' },
                in_progress: { bg: colors.primaryDim, color: colors.primary, icon: 'progress-wrench' },
                completed: { bg: colors.successDim, color: colors.success, icon: 'check-circle-outline' },
              };
              const config = statusColors[s];

              return (
                <Pressable
                  key={s}
                  style={[
                    styles.statusButton,
                    isActive && { backgroundColor: config.color, borderColor: config.color },
                  ]}
                  onPress={() => updateStatus(s)}
                >
                  <Icon source={config.icon} size={20} color={isActive ? '#fff' : config.color} />
                  <Text style={[styles.statusButtonText, isActive && { color: '#fff' }]}>
                    {s === 'pending' ? 'Pending' : s === 'in_progress' ? 'In Progress' : 'Completed'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.bottomSummary}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryLabel}>Balance Due</Text>
            <Text style={[styles.summaryAmount, totals.due > 0 && { color: colors.error }]}>
              {formatCurrency(totals.due)}
            </Text>
          </View>
          <Pressable
            style={styles.previewButton}
            onPress={() => router.push(`/(main)/orders/${id}/preview`)}
          >
            <LinearGradient
              colors={[colors.primary, '#4361ee']}
              style={styles.previewButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Icon source="file-document-outline" size={20} color="#fff" />
              <Text style={styles.previewButtonText}>Preview Receipt</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      {/* Labor Bottom Sheet */}
      <BottomSheet visible={showLaborSheet} onClose={() => setShowLaborSheet(false)} title="Add Labor Service">
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Service Description</Text>
          <TextInput
            style={styles.sheetInput}
            value={laborDesc}
            onChangeText={setLaborDesc}
            placeholder="e.g., Oil change, Brake service"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountField}
              value={laborAmount}
              onChangeText={(v) => setLaborAmount(v.replace(/\D/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Pressable
          style={[styles.sheetAddBtn, (!laborDesc || !laborAmount) && styles.sheetAddBtnDisabled]}
          onPress={() => handleAddLabor(laborDesc, parseInt(laborAmount))}
          disabled={!laborDesc || !laborAmount || isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon source="plus" size={20} color="#fff" />
              <Text style={styles.sheetAddBtnText}>Add Labor</Text>
            </>
          )}
        </Pressable>
      </BottomSheet>

      {/* Parts Bottom Sheet */}
      <BottomSheet visible={showPartsSheet} onClose={() => setShowPartsSheet(false)} title="Add Spare Part">
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Part Name</Text>
          <TextInput
            style={styles.sheetInput}
            value={partName}
            onChangeText={setPartName}
            placeholder="e.g., Oil filter, Brake pads"
            placeholderTextColor={colors.textTertiary}
          />
        </View>
        <View style={styles.inputRow}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.inputLabel}>Unit Price</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountField}
                value={partPrice}
                onChangeText={(v) => setPartPrice(v.replace(/\D/g, ''))}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.qtyContainer}>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setPartQty((q) => String(Math.max(1, parseInt(q) - 1)))}
              >
                <Icon source="minus" size={20} color={colors.primary} />
              </Pressable>
              <Text style={styles.qtyValue}>{partQty}</Text>
              <Pressable
                style={styles.qtyBtn}
                onPress={() => setPartQty((q) => String(parseInt(q) + 1))}
              >
                <Icon source="plus" size={20} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </View>
        <Pressable
          style={[styles.sheetAddBtn, (!partName || !partPrice) && styles.sheetAddBtnDisabled]}
          onPress={() => handleAddPart(partName, parseInt(partPrice), parseInt(partQty))}
          disabled={!partName || !partPrice || isAdding}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon source="plus" size={20} color="#fff" />
              <Text style={styles.sheetAddBtnText}>Add Part</Text>
            </>
          )}
        </Pressable>
      </BottomSheet>
    </View>
  );
});

export default OrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: colors.textSecondary,
  },
  // Header
  headerGradient: {
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    backgroundColor: colors.surface,
  },
  vehicleSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 16,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  scrollView: {
    flex: 1,
    marginTop: -12,
  },
  // Stats
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.separator,
    marginHorizontal: 8,
  },
  // Description Card
  descriptionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  descriptionText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 13,
    color: colors.textTertiary,
    marginTop: 2,
  },
  actionValueContainer: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  actionValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  actionAddBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  // Items Container
  itemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    marginLeft: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemQty: {
    color: colors.textTertiary,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    marginRight: 8,
  },
  itemDeleteBtn: {
    padding: 4,
  },
  // Status Buttons
  statusButtonsContainer: {
    gap: 10,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.separator,
    gap: 10,
  },
  statusButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  // Bottom Bar
  bottomBar: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  bottomSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLeft: {},
  summaryLabel: {
    fontSize: 13,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  previewButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 10,
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Bottom Sheet
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.systemGray4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  sheetInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: 6,
  },
  amountField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    minWidth: 40,
    textAlign: 'center',
  },
  sheetAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 56,
    marginTop: 8,
    gap: 10,
  },
  sheetAddBtnDisabled: {
    backgroundColor: colors.systemGray4,
  },
  sheetAddBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
});
