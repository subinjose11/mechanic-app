import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, StatusBar, TextInput, Pressable } from 'react-native';
import { Text, FAB, Icon, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { GlassCard, AnimatedListItem, EmptyState } from '@presentation/components/common';
import { useCustomerStore, useVehicleStore, useAuthStore } from '@views/hooks/useStore';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { Customer } from '@models/Customer';

function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const authStore = useAuthStore();
  const customerStore = useCustomerStore();
  const vehicleStore = useVehicleStore();

  const getVehicleCount = (customerId: string): number => {
    return vehicleStore.getByCustomerId(customerId).length;
  };

  const filteredCustomers = searchQuery
    ? customerStore.search(searchQuery)
    : customerStore.sortedCustomers;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const userId = authStore.userId;
    if (userId) {
      await customerStore.fetchAll(userId);
    }
    setRefreshing(false);
  }, [authStore.userId]);

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

  if (customerStore.isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/(main)/home')}>
          <Icon source="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Customers</Text>
          <Text style={styles.headerCount}>{filteredCustomers.length} total</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon source="magnify" size={20} color={colors.systemGray} />
          <TextInput
            placeholder="Search by name or phone..."
            placeholderTextColor={colors.textPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
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
        style={[styles.fab, shadows.glow, { bottom: 16 + insets.bottom }]}
        onPress={() => router.push('/(main)/customers/new')}
        color={colors.textOnPrimary}
      />
    </View>
  );
}

export default observer(CustomersScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.systemGray6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  phone: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.systemGray6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.primary,
  },
});
