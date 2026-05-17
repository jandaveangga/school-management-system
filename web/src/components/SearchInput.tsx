import type { ReactElement } from 'react';
import type { ChangeEvent } from 'react';
import { Input } from './Input';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  ariaLabel?: string;
}

export const SearchInput = ({
  placeholder = 'Search...',
  value = '',
  onDebouncedChange,
  debounceMs = 300,
  ariaLabel,
}: SearchInputProps): ReactElement => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (onDebouncedChange) {
      // Simple debounce implementation
      const timeoutId = setTimeout(() => {
        onDebouncedChange(newValue);
      }, debounceMs);
      
      // Clear previous timeout
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      aria-label={ariaLabel}
    />
  );
};
