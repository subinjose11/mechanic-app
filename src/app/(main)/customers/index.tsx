import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, FAB, Icon, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard, AnimatedListItem, EmptyState } from '@presentation/components/common';
import { useCustomers } from '@presentation/viewmodels/useCustomers';
import { useVehicles } from '@presentation/viewmodels/useVehicles';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { Customer } from '@domain/entities/Customer';

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data: customers, isLoading, refetch } = useCustomers();
  const { data: vehicles } = useVehicles();

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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const renderCustomerCard = ({ item, index }: { item: Customer; index: number }) => (
    <AnimatedListItem index={index}>
      <GlassCard style={styles.card} onPress={() => router.push(`/(main)/customers/${item.id}`)}>
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
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
      </GlassCard>
    </AnimatedListItem>
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
        <Text style={styles.headerCount}>{filteredCustomers.length} total</Text>
      </View>

      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Icon source="magnify" size={18} color={colors.textDisabled} />
          <Searchbar
            placeholder="Search by name or phone..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            iconColor="transparent"
          />
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerCard}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
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
        style={[styles.fab, { bottom: 16 + insets.bottom }]}
        onPress={() => router.push('/(main)/customers/new')}
        color={colors.textOnPrimary}
        customSize={52}
      />
    </View>
  );
}

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
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerCount: {
    fontSize: 13,
    color: colors.textDisabled,
    marginTop: 4,
  },
  searchWrap: {
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: 14,
    paddingLeft: 14,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  listContent: {
    padding: 18,
    paddingTop: 8,
  },
  card: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primaryLight,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  phone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 5,
  },
  fab: {
    position: 'absolute',
    right: 16,
    borderRadius: 16,
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
});
