// UI state store - handles loading, errors, filters, and UI state
import { makeAutoObservable } from 'mobx';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface FilterState {
  searchQuery: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
}

class UIStore {
  // Loading states
  isLoading: boolean = false;
  loadingMessage: string = '';
  loadingOperations: Map<string, boolean> = new Map();

  // Error state
  error: string | null = null;

  // Toast messages
  toasts: ToastMessage[] = [];

  // Filter states for different screens
  filters: Map<string, FilterState> = new Map();

  // Navigation state
  selectedTab: string = 'home';

  constructor() {
    makeAutoObservable(this);
  }

  // Loading operations
  setLoading(isLoading: boolean, message: string = '') {
    this.isLoading = isLoading;
    this.loadingMessage = message;
  }

  startOperation(operationId: string) {
    this.loadingOperations.set(operationId, true);
    this.updateLoadingState();
  }

  endOperation(operationId: string) {
    this.loadingOperations.delete(operationId);
    this.updateLoadingState();
  }

  private updateLoadingState() {
    this.isLoading = this.loadingOperations.size > 0;
  }

  get hasActiveOperations(): boolean {
    return this.loadingOperations.size > 0;
  }

  // Error handling
  setError(error: string | null) {
    this.error = error;
    if (error) {
      this.showToast('error', error);
    }
  }

  clearError() {
    this.error = null;
  }

  // Toast management
  showToast(type: ToastMessage['type'], message: string, duration: number = 3000) {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const toast: ToastMessage = { id, type, message, duration };
    this.toasts.push(toast);

    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }

    return id;
  }

  removeToast(id: string) {
    const index = this.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.toasts.splice(index, 1);
    }
  }

  clearAllToasts() {
    this.toasts = [];
  }

  // Filter management
  getFilter(screenKey: string): FilterState {
    return this.filters.get(screenKey) || { searchQuery: '' };
  }

  setFilter(screenKey: string, filter: Partial<FilterState>) {
    const currentFilter = this.getFilter(screenKey);
    this.filters.set(screenKey, { ...currentFilter, ...filter });
  }

  setSearchQuery(screenKey: string, query: string) {
    this.setFilter(screenKey, { searchQuery: query });
  }

  clearFilter(screenKey: string) {
    this.filters.delete(screenKey);
  }

  // Navigation
  setSelectedTab(tab: string) {
    this.selectedTab = tab;
  }

  // Reset all UI state
  reset() {
    this.isLoading = false;
    this.loadingMessage = '';
    this.loadingOperations.clear();
    this.error = null;
    this.toasts = [];
    this.filters.clear();
    this.selectedTab = 'home';
  }
}

export const uiStore = new UIStore();
export { UIStore };
