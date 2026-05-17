import { useEffect, useState } from 'react';

/**
 * Returns a debounced version of a value.
 * The value is updated only after `delay` ms of no changes.
 *
 * Common use case: search inputs to prevent API calls on every keystroke.
 */
export const useDebouncedValue = <T>(
  value: T,
  delay = 300,
): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
};