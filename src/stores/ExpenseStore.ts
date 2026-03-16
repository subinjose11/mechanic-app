// Expense state store
import { makeAutoObservable, runInAction } from 'mobx';
import {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  getTotalExpenses,
  getExpenseSummaryByCategory,
} from '@models/Expense';
import { ExpenseCategory } from '@core/constants';
import { firestoreService, FilterCondition } from '@firebaseServices/firestore/FirestoreService';
import { COLLECTIONS } from '@firebaseServices/firestore/collections';
import { expenseConverter } from '@firebaseServices/firestore/converters';
import { storageService } from '@firebaseServices/storage/StorageService';

class ExpenseStore {
  expenses: Expense[] = [];
  currentExpense: Expense | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Computed properties
  get expenseCount(): number {
    return this.expenses.length;
  }

  get totalAmount(): number {
    return getTotalExpenses(this.expenses);
  }

  get summaryByCategory(): Record<ExpenseCategory, number> {
    return getExpenseSummaryByCategory(this.expenses);
  }

  // Get expenses by category
  getByCategory(category: ExpenseCategory): Expense[] {
    return this.expenses.filter((e) => e.category === category);
  }

  // Get expenses by date range
  getByDateRange(startDate: Date, endDate: Date): Expense[] {
    return this.expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  // Get expense by ID
  getById(id: string): Expense | undefined {
    return this.expenses.find((e) => e.id === id);
  }

  // Get expenses for current month
  get currentMonthExpenses(): Expense[] {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return this.getByDateRange(startOfMonth, endOfMonth);
  }

  get currentMonthTotal(): number {
    return getTotalExpenses(this.currentMonthExpenses);
  }

  // Subscribe to expenses for a user (real-time updates)
  subscribeToExpenses(userId: string): void {
    this.isLoading = true;

    const filters: FilterCondition[] = [
      { field: 'userId', operator: '==', value: userId },
    ];

    this.unsubscribe = firestoreService.subscribeToCollection<Expense>(
      COLLECTIONS.EXPENSES,
      (expenses) => {
        runInAction(() => {
          this.expenses = expenses;
          this.isLoading = false;
        });
      },
      filters,
      { orderByField: 'date', orderDirection: 'desc' },
      expenseConverter
    );
  }

  // Fetch all expenses (one-time)
  async fetchAll(userId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
      ];

      const expenses = await firestoreService.getAll<Expense>(
        COLLECTIONS.EXPENSES,
        filters,
        { orderByField: 'date', orderDirection: 'desc' },
        expenseConverter
      );

      runInAction(() => {
        this.expenses = expenses;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch expenses';
        this.isLoading = false;
      });
    }
  }

  // Fetch expenses by date range
  async fetchByDateRange(userId: string, startDate: Date, endDate: Date): Promise<Expense[]> {
    this.isLoading = true;
    this.error = null;

    try {
      const filters: FilterCondition[] = [
        { field: 'userId', operator: '==', value: userId },
        { field: 'date', operator: '>=', value: startDate },
        { field: 'date', operator: '<=', value: endDate },
      ];

      const expenses = await firestoreService.getAll<Expense>(
        COLLECTIONS.EXPENSES,
        filters,
        { orderByField: 'date', orderDirection: 'desc' },
        expenseConverter
      );

      runInAction(() => {
        this.isLoading = false;
      });

      return expenses;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch expenses';
        this.isLoading = false;
      });
      return [];
    }
  }

  // Fetch single expense
  async fetchById(id: string): Promise<Expense | null> {
    this.isLoading = true;
    this.error = null;

    try {
      const expense = await firestoreService.getById<Expense>(
        COLLECTIONS.EXPENSES,
        id,
        expenseConverter
      );

      runInAction(() => {
        this.currentExpense = expense;
        this.isLoading = false;
      });

      return expense;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to fetch expense';
        this.isLoading = false;
      });
      return null;
    }
  }

  // Create expense (with optional receipt upload)
  async create(
    userId: string,
    input: CreateExpenseInput,
    receiptUri?: string
  ): Promise<Expense> {
    this.isLoading = true;
    this.error = null;

    try {
      let receiptUrl = input.receiptUrl || null;
      let receiptStoragePath = input.receiptStoragePath || null;

      // Upload receipt if provided
      if (receiptUri) {
        // Create a temporary ID for the expense (will be replaced by actual ID)
        const tempId = `temp_${Date.now()}`;
        const uploadResult = await storageService.uploadExpenseReceipt(
          userId,
          tempId,
          receiptUri
        );
        receiptUrl = uploadResult.url;
        receiptStoragePath = uploadResult.path;
      }

      const expenseData: Omit<Expense, 'id'> = {
        userId,
        category: input.category,
        amount: input.amount,
        description: input.description || null,
        date: input.date,
        receiptUrl,
        receiptStoragePath,
        createdAt: new Date(),
      };

      const expense = await firestoreService.create<Expense>(
        COLLECTIONS.EXPENSES,
        expenseData,
        expenseConverter
      );

      runInAction(() => {
        this.expenses.unshift(expense);
        this.isLoading = false;
      });

      return expense;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to create expense';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Update expense
  async update(id: string, input: UpdateExpenseInput): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await firestoreService.update<Expense>(COLLECTIONS.EXPENSES, id, input);

      runInAction(() => {
        const index = this.expenses.findIndex((e) => e.id === id);
        if (index !== -1) {
          this.expenses[index] = { ...this.expenses[index], ...input };
        }
        if (this.currentExpense?.id === id) {
          this.currentExpense = { ...this.currentExpense, ...input };
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to update expense';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Delete expense
  async delete(id: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Get the expense to find its receipt storage path
      const expense = this.expenses.find((e) => e.id === id);

      // Delete from Firestore
      await firestoreService.delete(COLLECTIONS.EXPENSES, id);

      // Delete receipt from Storage if exists
      if (expense?.receiptStoragePath) {
        try {
          await storageService.deleteFile(expense.receiptStoragePath);
        } catch (err) {
          console.warn('Failed to delete receipt from storage:', err);
        }
      }

      runInAction(() => {
        this.expenses = this.expenses.filter((e) => e.id !== id);
        if (this.currentExpense?.id === id) {
          this.currentExpense = null;
        }
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Failed to delete expense';
        this.isLoading = false;
      });
      throw err;
    }
  }

  // Set current expense
  setCurrentExpense(expense: Expense | null) {
    this.currentExpense = expense;
  }

  // Clear error
  clearError() {
    this.error = null;
  }

  // Cleanup subscription
  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  // Reset store
  reset() {
    this.dispose();
    this.expenses = [];
    this.currentExpense = null;
    this.isLoading = false;
    this.error = null;
  }
}

export const expenseStore = new ExpenseStore();
export { ExpenseStore };
