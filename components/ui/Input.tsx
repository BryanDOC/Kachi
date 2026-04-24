import { cn } from '@/lib/utils';
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, id, leftIcon, rightIcon, ...props }, ref) => {
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
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-text3 flex-shrink-0 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full py-2.5 bg-bg-input border border-border rounded-[14px]',
              'text-[15px] text-text1 placeholder:text-text3',
              'focus:outline-none focus:border-border-focus transition-colors',
              leftIcon ? 'pl-10 pr-4' : 'px-4',
              rightIcon ? 'pr-10' : '',
              error ? 'border-[#FF6B6B]' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-text3 flex-shrink-0 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-[12px] text-[#FF6B6B] mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
