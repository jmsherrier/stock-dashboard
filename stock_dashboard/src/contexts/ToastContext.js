// Lightweight toast notifications. `useToast()` returns a `toast` function
// with .success / .error / .info helpers. Toasts auto-dismiss.
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { type = 'info', duration = 3200 } = {}) => {
      const id = nextId++;
      setToasts((list) => [...list, { id, message, type }]);
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  const toast = useMemo(() => {
    const fn = (msg, opts) => push(msg, opts);
    fn.success = (msg, opts) => push(msg, { ...opts, type: 'success' });
    fn.error = (msg, opts) => push(msg, { ...opts, type: 'error' });
    fn.info = (msg, opts) => push(msg, { ...opts, type: 'info' });
    return fn;
  }, [push]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast__message">{t.message}</span>
            <button
              className="toast__close"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
