import { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Icon, IconButton, Menu, Divider, ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Card, Button, StatusBadge } from '@presentation/components/common';
import { useVehicle } from '@presentation/viewmodels/useVehicles';
import { useCustomer } from '@presentation/viewmodels/useCustomers';
import { useOrdersByVehicle } from '@presentation/viewmodels/useOrders';
import { colors } from '@theme/colors';
import { formatDate } from '@core/utils/formatDate';

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: vehicle, isLoading: loadingVehicle } = useVehicle(id || '');
  const { data: customer, isLoading: loadingCustomer } = useCustomer(vehicle?.customerId || '');
  const { data: orders } = useOrdersByVehicle(id || '');

  const recentOrders = (orders || []).slice(0, 5);

  const handleEdit = () => {
    setMenuVisible(false);
    router.push(`/(main)/vehicles/new?id=${id}`);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    // TODO: Implement delete confirmation
  };

  const handleCreateOrder = () => {
    router.push(`/(main)/orders/new?vehicleId=${id}`);
  };

  const handleGenerateQR = () => {
    // TODO: Implement QR generation
  };

  if (loadingVehicle || !vehicle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vehicle...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `${vehicle.make} ${vehicle.model}`,
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
              <Menu.Item onPress={handleEdit} title="Edit" leadingIcon="pencil" />
              <Menu.Item onPress={handleGenerateQR} title="Generate QR" leadingIcon="qrcode" />
              <Divider />
              <Menu.Item
                onPress={handleDelete}
                title="Delete"
                leadingIcon="delete"
                titleStyle={{ color: colors.error }}
              />
            </Menu>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Vehicle Info Card */}
        <Card style={styles.card}>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleIconContainer}>
              <Icon source="car" size={32} color={colors.primary} />
            </View>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.licensePlate}>{vehicle.licensePlate}</Text>
            </View>
            {vehicle.color && (
              <View style={[styles.colorBadge, { backgroundColor: vehicle.color.toLowerCase() }]}>
                <Text style={styles.colorText}>{vehicle.color}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Year</Text>
              <Text style={styles.detailValue}>{vehicle.year || '-'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>VIN</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {vehicle.vin || '-'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Added</Text>
              <Text style={styles.detailValue}>{formatDate(vehicle.createdAt)}</Text>
            </View>
          </View>

          {vehicle.notes && (
            <View style={styles.notesSection}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{vehicle.notes}</Text>
            </View>
          )}
        </Card>

        {/* Owner Info Card */}
        {customer && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Owner</Text>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerIconContainer}>
                <Icon source="account" size={24} color={colors.textSecondary} />
              </View>
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{customer.name}</Text>
                <Text style={styles.ownerContact}>{customer.phone || 'No phone'}</Text>
                {customer.email && (
                  <Text style={styles.ownerContact}>{customer.email}</Text>
                )}
              </View>
              <IconButton
                icon="phone"
                size={20}
                onPress={() => {
                  // TODO: Open phone dialer
                }}
              />
            </View>
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Button
            onPress={handleCreateOrder}
            mode="contained"
            icon="clipboard-plus"
            style={styles.actionButton}
          >
            New Order
          </Button>
          <Button
            onPress={handleGenerateQR}
            mode="outlined"
            icon="qrcode"
            style={styles.actionButton}
          >
            QR Code
          </Button>
        </View>

        {/* Service History */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Service History</Text>
            {recentOrders.length > 0 && (
              <Text style={styles.seeAll} onPress={() => router.push(`/(main)/orders?vehicleId=${id}`)}>
                See All
              </Text>
            )}
          </View>

          {recentOrders.length > 0 ? (
            recentOrders.map((order, index) => (
              <View key={order.id}>
                {index > 0 && <Divider style={styles.divider} />}
                <View
                  style={styles.orderItem}
                  onTouchEnd={() => router.push(`/(main)/orders/${order.id}`)}
                >
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderDescription}>
                      {order.description || 'Service Order'}
                    </Text>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                  </View>
                  <StatusBadge status={order.status} />
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No service history yet</Text>
          )}
        </Card>
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
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  licensePlate: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  colorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  colorText: {
    fontSize: 12,
    color: colors.textOnPrimary,
    fontWeight: '500',
  },
  detailsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: colors.surfaceVariant,
    padding: 12,
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ownerContact: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 12,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderDescription: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
