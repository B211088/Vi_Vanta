import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const icons = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
  loading: "⏳",
};

const NotifyContext = createContext();

const NotifyToast = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 150, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-white shadow-md border-l-4 pl-4 pr-6 py-3 rounded-[5px] flex items-center gap-3 z-50 border-${
        type === "success"
          ? "green-500"
          : type === "error"
          ? "red-500"
          : type === "warning"
          ? "yellow-500"
          : type === "info"
          ? "blue-500"
          : "gray-500"
      }`}
    >
      <span className="text-2xl">{icons[type]}</span>
      <div className="text-base">{message}</div>
    </motion.div>
  );
};

export const NotifyProvider = ({ children }) => {
  const [notifies, setNotifies] = useState([]);

  const addNotify = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setNotifies((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeNotify = useCallback((id) => {
    setNotifies((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotifyContext.Provider
      value={{
        notifySuccess: (msg) => addNotify("success", msg),
        notifyError: (msg) => addNotify("error", msg),
        notifyWarning: (msg) => addNotify("warning", msg),
        notifyInfo: (msg) => addNotify("info", msg),
        notifyLoading: (msg) => addNotify("loading", msg),
      }}
    >
      {children}
      {createPortal(
        <div className="fixed top-5 right-5 flex flex-col gap-3 z-[9999]">
          <AnimatePresence>
            {notifies.map((n) => (
              <NotifyToast
                key={n.id}
                id={n.id}
                type={n.type}
                message={n.message}
                onClose={removeNotify}
              />
            ))}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </NotifyContext.Provider>
  );
};

export const useNotify = () => useContext(NotifyContext);
