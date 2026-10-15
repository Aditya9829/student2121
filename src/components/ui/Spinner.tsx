import { Loader2 } from 'lucide-react';

export function Spinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />;
}

export function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Spinner size={32} />
      <p className="text-sm text-slate-500 mt-3">Loading...</p>
    </div>
  );
}
