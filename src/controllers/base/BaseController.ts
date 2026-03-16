// Base controller class with common methods
import { uiStore } from '@stores/UIStore';

export abstract class BaseController<T> {
  protected operationId: string;

  constructor(controllerName: string) {
    this.operationId = controllerName;
  }

  // Start loading indicator
  protected startLoading(message?: string): void {
    uiStore.startOperation(this.operationId);
    if (message) {
      uiStore.setLoading(true, message);
    }
  }

  // Stop loading indicator
  protected stopLoading(): void {
    uiStore.endOperation(this.operationId);
  }

  // Handle error
  protected handleError(error: unknown, defaultMessage: string): never {
    const errorMessage = error instanceof Error ? error.message : defaultMessage;
    uiStore.setError(errorMessage);
    throw error;
  }

  // Show success toast
  protected showSuccess(message: string): void {
    uiStore.showToast('success', message);
  }

  // Show error toast
  protected showError(message: string): void {
    uiStore.showToast('error', message);
  }

  // Execute with loading state
  protected async withLoading<R>(
    operation: () => Promise<R>,
    loadingMessage?: string,
    successMessage?: string
  ): Promise<R> {
    this.startLoading(loadingMessage);
    try {
      const result = await operation();
      if (successMessage) {
        this.showSuccess(successMessage);
      }
      return result;
    } catch (error) {
      throw error;
    } finally {
      this.stopLoading();
    }
  }

  // Abstract methods to be implemented by subclasses
  abstract fetchAll(userId: string): Promise<void>;
}
