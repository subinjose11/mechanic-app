import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, Icon, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { Card, EmptyState } from '@presentation/components/common';
import { useCustomers } from '@presentation/viewmodels/useCustomers';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { colors } from '@theme/colors';
import { Customer } from '@domain/entities/Customer';

export default function CustomersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: customers, isLoading, refetch } = useCustomers();
  const { data: vehicles } = useVehicles();

  // Count vehicles per customer
  const getVehicleCount = (customerId: string): number => {
    return vehicles?.filter(v => v.customerId === customerId).length || 0;
  };

  const filteredCustomers = (customers || []).filter(
    (customer) =>
      !searchQuery ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderCustomerCard = ({ item }: { item: Customer }) => (
    <Card style={styles.card} onPress={() => router.push(`/(main)/customers/${item.id}`)}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Icon source="account" size={24} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone || 'No phone'}</Text>
        </View>
        <View style={styles.badge}>
          <Icon source="car" size={14} color={colors.textSecondary} />
          <Text style={styles.badgeText}>{getVehicleCount(item.id)}</Text>
        </View>
      </View>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by name or phone"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-off"
            title="No customers found"
            description="Add your first customer"
            actionLabel="Add Customer"
            onAction={() => router.push('/(main)/customers/new')}
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/(main)/customers/new')}
        color={colors.textOnPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { marginTop: 12, color: colors.textSecondary, fontSize: 14 },
  searchBar: { margin: 16, backgroundColor: colors.surface, borderRadius: 12, elevation: 0 },
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center', alignItems: 'center',
  },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  phone: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceVariant, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: colors.primary },
});
