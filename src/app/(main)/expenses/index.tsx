import { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, FAB, Icon, Chip, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { Card, EmptyState } from '@presentation/components/common';
import { colors } from '@theme/colors';
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredExpenses = mockExpenses.filter(
    (expense) => selectedCategory === 'all' || expense.category === selectedCategory
  );

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderExpenseCard = ({ item }: { item: ExpenseItem }) => (
    <Card style={styles.card}>
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
            <Text style={styles.category}>{EXPENSE_CATEGORY_LABELS[item.category]}</Text>
            <Text style={styles.date}>{formatDate(item.date)}</Text>
          </View>
        </View>
        <Text style={styles.amount}>-{formatCurrency(item.amount)}</Text>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Total Expenses</Text>
        <Text style={styles.summaryAmount}>{formatCurrency(totalExpenses)}</Text>
      </Card>

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
              style={styles.chip}
            >
              {item === 'all' ? 'All' : EXPENSE_CATEGORY_LABELS[item as ExpenseCategory]}
            </Chip>
          )}
        />
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseCard}
        contentContainerStyle={styles.listContent}
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
        style={styles.fab}
        onPress={() => router.push('/(main)/expenses/new')}
        color={colors.textOnPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryCard: { margin: 16, alignItems: 'center', paddingVertical: 20 },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryAmount: { fontSize: 28, fontWeight: '700', color: colors.error, marginTop: 4 },
  filterContainer: { paddingBottom: 8 },
  filterList: { paddingHorizontal: 16, gap: 8 },
  chip: { marginRight: 8 },
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  card: { marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  description: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  category: { fontSize: 12, color: colors.textSecondary },
  date: { fontSize: 12, color: colors.textDisabled, marginLeft: 8 },
  amount: { fontSize: 16, fontWeight: '600', color: colors.error },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: colors.primary },
});
