import { cn } from '@/lib/utils';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, id, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-semibold uppercase tracking-[0.6px] text-text3"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-2.5 bg-bg-input border border-border rounded-[14px]',
            'text-[13px] text-text1 focus:outline-none focus:border-border-focus transition-colors',
            error ? 'border-[#FF6B6B]' : '',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-[12px] text-[#FF6B6B] mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
