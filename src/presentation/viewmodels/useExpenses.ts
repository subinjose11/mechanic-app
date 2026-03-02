import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { container } from '@core/di/container';
import { Expense, CreateExpenseInput, UpdateExpenseInput } from '@domain/entities/Expense';
import { ExpenseFilters } from '@domain/repositories/IExpenseRepository';
import { ExpenseCategory } from '@core/constants';

const expenseRepository = container.expenseRepository;

// Query keys
export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filters?: ExpenseFilters) => [...expenseKeys.lists(), filters] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  byCategory: (category: ExpenseCategory) => [...expenseKeys.all, 'category', category] as const,
  byDateRange: (startDate: Date, endDate: Date) =>
    [...expenseKeys.all, 'dateRange', { startDate, endDate }] as const,
  stats: (startDate?: Date, endDate?: Date) =>
    [...expenseKeys.all, 'stats', { startDate, endDate }] as const,
  paginated: (page: number, limit: number, filters?: ExpenseFilters) =>
    [...expenseKeys.all, 'paginated', { page, limit, filters }] as const,
};

// Fetch all expenses
export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expenseRepository.getAll(filters),
  });
}

// Fetch a single expense
export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseRepository.getById(id),
    enabled: !!id,
  });
}

// Fetch expenses by category
export function useExpensesByCategory(category: ExpenseCategory) {
  return useQuery({
    queryKey: expenseKeys.byCategory(category),
    queryFn: () => expenseRepository.getByCategory(category),
    enabled: !!category,
  });
}

// Fetch expenses by date range
export function useExpensesByDateRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: expenseKeys.byDateRange(startDate, endDate),
    queryFn: () => expenseRepository.getByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
}

// Expense statistics
export function useExpenseStats(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: expenseKeys.stats(startDate, endDate),
    queryFn: () => expenseRepository.getExpenseStats(startDate, endDate),
  });
}

// Paginated expenses
export function usePaginatedExpenses(page: number, limit: number = 20, filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.paginated(page, limit, filters),
    queryFn: () => expenseRepository.getPaginated(page, limit, filters),
  });
}

// Create expense
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

// Update expense
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      expenseRepository.update(id, data),
    onSuccess: (updatedExpense) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.setQueryData(expenseKeys.detail(updatedExpense.id), updatedExpense);
    },
  });
}

// Delete expense
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => expenseRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

// Upload receipt for expense
export function useUploadReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ expenseId, imageUri }: { expenseId: string; imageUri: string }) =>
      expenseRepository.uploadReceipt(expenseId, imageUri),
    onSuccess: (updatedExpense) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.setQueryData(expenseKeys.detail(updatedExpense.id), updatedExpense);
    },
  });
}
