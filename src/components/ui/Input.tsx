interface InputProps {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

export function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required,
  disabled,
  options,
  min,
  max,
}: InputProps) {
  const baseClass = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none ${
    error
      ? 'border-red-400 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:ring-2 focus:ring-brand-100 focus:border-brand-500'
  } ${disabled ? 'bg-slate-50 text-slate-400' : 'bg-white text-slate-800'}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {options ? (
        <select
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={baseClass}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className={baseClass}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

interface TextareaProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 3,
}: TextareaProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none ${
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-300 focus:ring-2 focus:ring-brand-100 focus:border-brand-500'
        } bg-white text-slate-800 resize-none`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
