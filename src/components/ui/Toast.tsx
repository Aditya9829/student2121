import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: number) => void;
}

const config = {
  success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  info: { icon: Info, color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-200' },
};

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const c = config[toast.type];
  const Icon = c.icon;

  return (
    <div
      className={`flex items-center gap-3 ${c.bg} ${c.border} border rounded-lg px-4 py-3 shadow-md animate-fade-in min-w-[300px]`}
    >
      <Icon size={20} className={c.color} />
      <p className="text-sm font-medium text-slate-700 flex-1">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600">
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
