import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { Text, Icon, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { Card, Button, StatusBadge, TopBar, IconButton } from '@presentation/components/common';
import { useVehicleStore, useCustomerStore, useOrderStore, useUIStore } from '@stores';
import { useVehicleController, useCustomerController, useOrderController } from '@controllers';
import { colors } from '@theme/colors';
import { formatDate } from '@core/utils/formatDate';

const VehicleDetailScreen = observer(function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const vehicleStore = useVehicleStore();
  const customerStore = useCustomerStore();
  const orderStore = useOrderStore();
  const uiStore = useUIStore();
  const vehicleController = useVehicleController();
  const customerController = useCustomerController();
  const orderController = useOrderController();

  useEffect(() => {
    if (id) {
      vehicleController.fetchById(id);
    }
  }, [id]);

  const vehicle = vehicleStore.currentVehicle;
  const customer = vehicle?.customerId ? customerStore.getById(vehicle.customerId) : undefined;
  const orders = vehicle ? orderStore.getByVehicleId(vehicle.id) : [];
  const isLoading = uiStore.isLoading;

  const recentOrders = orders.slice(0, 5);

  const handleEdit = () => {
    setMenuVisible(false);
    router.push(`/(main)/vehicles/new?id=${id}`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Vehicle',
      `Are you sure you want to delete ${vehicle?.make} ${vehicle?.model}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (id) {
                await vehicleController.delete(id);
                router.back();
              }
            } catch (err) {
              console.error('Failed to delete vehicle:', err);
              Alert.alert('Error', 'Failed to delete vehicle. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCreateOrder = () => {
    router.push(`/create-order?vehicleId=${id}&customerId=${vehicle?.customerId}`);
  };

  // Get vehicle emoji based on type
  const getVehicleEmoji = () => {
    const make = vehicle?.make?.toLowerCase() || '';
    if (make.includes('bike') || make.includes('motorcycle') || make.includes('scooter')) {
      return '\uD83D\uDEF5';
    }
    if (make.includes('truck')) {
      return '\uD83D\uDE9B';
    }
    return '\uD83D\uDE97';
  };

  if (isLoading || !vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopBar
        title="Vehicle Details"
        rightAction={
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
            <Divider />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="delete"
              titleStyle={{ color: colors.error }}
            />
          </Menu>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={['#0C0C14', colors.background]}
          style={styles.heroGradient}
        >
          <View style={styles.vehicleTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{getVehicleEmoji()}</Text>
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
              {vehicle.color && (
                <View style={styles.colorBadge}>
                  <View style={[styles.colorDot, { backgroundColor: vehicle.color.toLowerCase() }]} />
                  <Text style={styles.colorText}>{vehicle.color}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{vehicle.year || '-'}</Text>
              <Text style={styles.statLabel}>Year</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{orders.length}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {formatDate(vehicle.createdAt).split(' ')[0]}
              </Text>
              <Text style={styles.statLabel}>Added</Text>
            </View>
          </View>
        </LinearGradient>

        {/* VIN Section */}
        {vehicle.vin && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>VIN NUMBER</Text>
            <View style={styles.vinCard}>
              <Icon source="car-info" size={16} color={colors.textDisabled} />
              <Text style={styles.vinText}>{vehicle.vin}</Text>
            </View>
          </View>
        )}

        {/* Notes Section */}
        {vehicle.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOTES</Text>
            <Card style={styles.notesCard}>
              <Text style={styles.notesText}>{vehicle.notes}</Text>
            </Card>
          </View>
        )}

        {/* Owner Section */}
        {customer && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>OWNER</Text>
            <Card
              style={styles.ownerCard}
              onPress={() => router.push(`/(main)/customers/${customer.id}`)}
            >
              <View style={styles.ownerTop}>
                <View style={styles.ownerAvatar}>
                  <Text style={styles.ownerInitials}>
                    {customer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerName}>{customer.name}</Text>
                  <Text style={styles.ownerContact}>{customer.phone || 'No phone'}</Text>
                </View>
                <Icon source="chevron-right" size={20} color={colors.textDisabled} />
              </View>
            </Card>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleCreateOrder}
            icon="clipboard-plus"
            fullWidth
          >
            Create New Order
          </Button>
        </View>

        {/* Service History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>SERVICE HISTORY</Text>
            {recentOrders.length > 0 && (
              <Text
                style={styles.seeAllLink}
                onPress={() => router.push(`/(main)/orders?vehicleId=${id}`)}
              >
                See All
              </Text>
            )}
          </View>

          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <Card
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/(main)/orders/${order.id}`)}
              >
                <View style={styles.orderTop}>
                  <View style={styles.orderIcon}>
                    <Icon source="wrench" size={16} color={colors.primary} />
                  </View>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderDescription}>
                      {order.description || 'Service Order'}
                    </Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <StatusBadge status={order.status} />
                </View>
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <Icon source="clipboard-text-off-outline" size={32} color={colors.textDisabled} />
              <Text style={styles.emptyText}>No service history</Text>
              <Text style={styles.emptySubtext}>Create an order to get started</Text>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

export default VehicleDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  menuContent: {
    backgroundColor: colors.surfaceElevated,
  },
  heroGradient: {
    padding: 20,
    paddingTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  vehicleTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  licensePlate: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 3,
  },
  colorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.borderMedium,
  },
  colorText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 13,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 9,
    color: colors.textDisabled,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 3,
  },
  section: {
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDisabled,
    letterSpacing: 1.5,
    marginBottom: 11,
  },
  seeAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 11,
  },
  vinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    padding: 12,
  },
  vinText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
  },
  notesCard: {
    backgroundColor: colors.surface,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ownerCard: {
    backgroundColor: colors.surface,
  },
  ownerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ownerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  ownerContact: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    padding: 18,
    gap: 8,
  },
  orderCard: {
    marginBottom: 8,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  orderDate: {
    fontSize: 11,
    color: colors.textDisabled,
    marginTop: 2,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: colors.textDisabled,
    marginTop: 4,
  },
});
