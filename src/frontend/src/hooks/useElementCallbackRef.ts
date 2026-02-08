import { useCallback, useState } from 'react';

/**
 * Utility hook that provides a stable callback ref and the latest mounted element.
 * This enables effects to depend on the actual element instance, triggering when
 * the ref points to a new DOM node (e.g., when switching render branches).
 */
export function useElementCallbackRef<T extends HTMLElement>(): [
  element: T | null,
  callbackRef: (node: T | null) => void
] {
  const [element, setElement] = useState<T | null>(null);

  const callbackRef = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  return [element, callbackRef];
}
