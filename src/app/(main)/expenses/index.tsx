import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, Icon, Chip, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, AnimatedListItem, EmptyState } from '@presentation/components/common';
import { colors } from '@theme/colors';
import { shadows } from '@theme/shadows';
import { formatCurrency } from '@core/utils/formatCurrency';
import { formatDate } from '@core/utils/formatDate';
import { EXPENSE_CATEGORY_LABELS, ExpenseCategory } from '@core/constants';

interface ExpenseItem {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: Date;
}

const mockExpenses: ExpenseItem[] = [
  { id: '1', category: 'supplies', amount: 5000, description: 'Engine oil stock', date: new Date() },
  { id: '2', category: 'utilities', amount: 2500, description: 'Electricity bill', date: new Date(Date.now() - 86400000) },
  { id: '3', category: 'rent', amount: 15000, description: 'Monthly rent', date: new Date(Date.now() - 86400000 * 3) },
];

const categoryColors: Record<ExpenseCategory, string> = {
  rent: colors.expenseRent,
  utilities: colors.expenseUtilities,
  supplies: colors.expenseSupplies,
  other: colors.expenseOther,
};

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredExpenses = mockExpenses.filter((expense) => {
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      expense.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderExpenseCard = ({ item, index }: { item: ExpenseItem; index: number }) => (
    <AnimatedListItem index={index}>
      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColors[item.category]}20` }]}>
            <Icon
              source={item.category === 'rent' ? 'home' : item.category === 'utilities' ? 'flash' : item.category === 'supplies' ? 'package' : 'dots-horizontal'}
              size={20}
              color={categoryColors[item.category]}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: `${categoryColors[item.category]}15`, borderColor: `${categoryColors[item.category]}40` }]}>
                <Text style={[styles.categoryText, { color: categoryColors[item.category] }]}>
                  {EXPENSE_CATEGORY_LABELS[item.category]}
                </Text>
              </View>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
          </View>
          <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
        </View>
      </GlassCard>
    </AnimatedListItem>
  );

  return (
    <View style={styles.container}>
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={[colors.surfaceVariant, colors.background]}
        style={[styles.headerGradient, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Expenses</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredExpenses.length}</Text>
          </View>
        </View>

        {/* Summary Card */}
        <GlassCard style={styles.summaryCard} glow>
          <Text style={styles.summaryLabel}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>{formatCurrency(totalExpenses)}</Text>
        </GlassCard>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <Searchbar
              placeholder="Search expenses..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              inputStyle={styles.searchInput}
              icon={() => null}
            />
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['all', 'rent', 'utilities', 'supplies', 'other']}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => (
              <Chip
                selected={selectedCategory === item}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.chip,
                  selectedCategory === item && styles.chipSelected,
                ]}
                textStyle={[
                  styles.chipText,
                  selectedCategory === item && styles.chipTextSelected,
                ]}
              >
                {item === 'all' ? 'All' : EXPENSE_CATEGORY_LABELS[item as ExpenseCategory]}
              </Chip>
            )}
          />
        </View>
      </LinearGradient>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseCard}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="wallet-outline"
            title="No expenses found"
            description="Start tracking your shop expenses"
            actionLabel="Add Expense"
            onAction={() => router.push('/(main)/expenses/new')}
          />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { bottom: 16 + insets.bottom }]}
        onPress={() => router.push('/(main)/expenses/new')}
        color={colors.textOnPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    paddingBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    marginLeft: 12,
    backgroundColor: colors.primaryDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.error,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchBar: {
    flex: 1,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  searchInput: {
    color: colors.textPrimary,
  },
  filterContainer: {
    paddingBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  chipSelected: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  chipText: {
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: colors.textDisabled,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.error,
  },
  fab: {
    position: 'absolute',
    right: 16,
    backgroundColor: colors.primary,
    ...shadows.glow,
  },
});
