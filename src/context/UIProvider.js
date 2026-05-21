import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

const ToastContext = createContext(null);
const ConfirmContext = createContext(null);

const TOAST_AUTO_DISMISS_MS = 4000;

const ToastList = ({ toasts, dismiss }) => {
  const toneStyles = {
    success:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning:
      "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    info:
      "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  };
  const iconFor = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const Icon = iconFor[t.tone] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 border rounded-lg shadow-lg px-4 py-3 ${
              toneStyles[t.tone] || toneStyles.info
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm leading-5 break-words">
              {t.title && (
                <p className="font-semibold mb-0.5">{t.title}</p>
              )}
              <p>{t.message}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

const ConfirmDialog = ({ state, onResolve }) => {
  if (!state) return null;
  const {
    title = "Are you sure?",
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "default",
  } = state;

  const confirmBtnClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-blue-600 hover:bg-blue-700 text-white";

  return (
    <div
      className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={() => onResolve(false)}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-3">
            {tone === "danger" && (
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
              {message && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <button
            onClick={() => onResolve(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const UIProvider = ({ children }) => {
  // Toasts
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (tone, message, options = {}) => {
      counterRef.current += 1;
      const id = counterRef.current;
      const entry = { id, tone, message, title: options.title };
      setToasts((prev) => [...prev, entry]);
      const duration = options.duration ?? TOAST_AUTO_DISMISS_MS;
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  const toast = useMemo(
    () => ({
      success: (message, options) => pushToast("success", message, options),
      error: (message, options) => pushToast("error", message, options),
      warning: (message, options) => pushToast("warning", message, options),
      info: (message, options) => pushToast("info", message, options),
      dismiss: dismissToast,
    }),
    [pushToast, dismissToast],
  );

  // Confirms
  const [confirmState, setConfirmState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setConfirmState(options || {});
    });
  }, []);

  const handleConfirmResolve = useCallback((value) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setConfirmState(null);
    if (resolver) resolver(value);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <ToastList toasts={toasts} dismiss={dismissToast} />
        <ConfirmDialog state={confirmState} onResolve={handleConfirmResolve} />
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within UIProvider");
  }
  return ctx;
};

export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within UIProvider");
  }
  return ctx;
};
