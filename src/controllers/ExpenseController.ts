// Expense controller - handles expense operations
import { BaseController } from './base/BaseController';
import { expenseStore } from '@stores/ExpenseStore';
import { authStore } from '@stores/AuthStore';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '@models/Expense';
import { ExpenseCategory } from '@core/constants';

class ExpenseController extends BaseController<Expense> {
  private static instance: ExpenseController;

  private constructor() {
    super('expense');
  }

  static getInstance(): ExpenseController {
    if (!ExpenseController.instance) {
      ExpenseController.instance = new ExpenseController();
    }
    return ExpenseController.instance;
  }

  // Get all expenses
  get expenses(): Expense[] {
    return expenseStore.expenses;
  }

  // Get current expense
  get currentExpense(): Expense | null {
    return expenseStore.currentExpense;
  }

  // Get expense count
  get expenseCount(): number {
    return expenseStore.expenseCount;
  }

  // Get total amount
  get totalAmount(): number {
    return expenseStore.totalAmount;
  }

  // Get summary by category
  get summaryByCategory(): Record<ExpenseCategory, number> {
    return expenseStore.summaryByCategory;
  }

  // Get current month expenses
  get currentMonthExpenses(): Expense[] {
    return expenseStore.currentMonthExpenses;
  }

  // Get current month total
  get currentMonthTotal(): number {
    return expenseStore.currentMonthTotal;
  }

  // Check if loading
  get isLoading(): boolean {
    return expenseStore.isLoading;
  }

  // Get error
  get error(): string | null {
    return expenseStore.error;
  }

  // Get expense by ID
  getById(id: string): Expense | undefined {
    return expenseStore.getById(id);
  }

  // Get expenses by category
  getByCategory(category: ExpenseCategory): Expense[] {
    return expenseStore.getByCategory(category);
  }

  // Get expenses by date range
  getByDateRange(startDate: Date, endDate: Date): Expense[] {
    return expenseStore.getByDateRange(startDate, endDate);
  }

  // Fetch all expenses
  async fetchAll(userId?: string): Promise<void> {
    const uid = userId || authStore.userId;
    if (!uid) throw new Error('User not authenticated');

    await this.withLoading(
      () => expenseStore.fetchAll(uid),
      'Loading expenses...'
    );
  }

  // Fetch expenses by date range
  async fetchByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    return this.withLoading(
      () => expenseStore.fetchByDateRange(userId, startDate, endDate)
    );
  }

  // Fetch single expense
  async fetchById(id: string): Promise<Expense | null> {
    return this.withLoading(
      () => expenseStore.fetchById(id)
    );
  }

  // Create expense
  async create(
    input: CreateExpenseInput,
    receiptUri?: string
  ): Promise<Expense> {
    const userId = authStore.userId;
    if (!userId) throw new Error('User not authenticated');

    return this.withLoading(
      () => expenseStore.create(userId, input, receiptUri),
      receiptUri ? 'Uploading receipt...' : 'Creating expense...',
      'Expense recorded!'
    );
  }

  // Update expense
  async update(id: string, input: UpdateExpenseInput): Promise<void> {
    await this.withLoading(
      () => expenseStore.update(id, input),
      'Updating expense...',
      'Expense updated!'
    );
  }

  // Delete expense
  async delete(id: string): Promise<void> {
    await this.withLoading(
      () => expenseStore.delete(id),
      'Deleting expense...',
      'Expense deleted!'
    );
  }

  // Set current expense
  setCurrentExpense(expense: Expense | null): void {
    expenseStore.setCurrentExpense(expense);
  }

  // Clear error
  clearError(): void {
    expenseStore.clearError();
  }

  // Subscribe to real-time updates
  subscribe(): void {
    const userId = authStore.userId;
    if (userId) {
      expenseStore.subscribeToExpenses(userId);
    }
  }

  // Unsubscribe from updates
  unsubscribe(): void {
    expenseStore.dispose();
  }
}

// Export singleton instance
export const expenseController = ExpenseController.getInstance();
export { ExpenseController };
