import { useCallback } from 'react';
import type { ToastData, ToastType } from '@/components/ui/Toast';

let toastId = 0;

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = 'success'): number => {
    const id = ++toastId;
    // Dispatch a custom event that the ToastContainer listens to
    window.dispatchEvent(
      new CustomEvent('toast', { detail: { id, message, type } })
    );
    return id;
  }, []);

  return { showToast };
}
