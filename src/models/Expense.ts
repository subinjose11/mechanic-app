// Expense model
import { ExpenseCategory } from '@core/constants';

export interface Expense {
  id: string;
  userId: string;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  date: Date;
  receiptUrl: string | null;
  receiptStoragePath: string | null; // Firebase Storage path for deletion
  createdAt: Date;
}

export interface CreateExpenseInput {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  date: Date;
  receiptUrl?: string;
  receiptStoragePath?: string;
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: number;
  description?: string;
  date?: Date;
  receiptUrl?: string;
  receiptStoragePath?: string;
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function getExpensesByCategory(
  expenses: Expense[],
  category: ExpenseCategory
): Expense[] {
  return expenses.filter((expense) => expense.category === category);
}

export function getExpensesByDateRange(
  expenses: Expense[],
  startDate: Date,
  endDate: Date
): Expense[] {
  return expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

export function getExpenseSummaryByCategory(
  expenses: Expense[]
): Record<ExpenseCategory, number> {
  const summary: Record<ExpenseCategory, number> = {
    rent: 0,
    utilities: 0,
    supplies: 0,
    other: 0,
  };

  expenses.forEach((expense) => {
    summary[expense.category] += expense.amount;
  });

  return summary;
}
