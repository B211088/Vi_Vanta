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
  success: "fa-solid fa-square-check",
  error: "fa-solid fa-circle-xmark",
  warning: " fa-solid fa-triangle-exclamation",
  info: "fa-solid fa-circle-exclamation",
  loading: "fa-solid fa-spinner",
};

const NotifyContext = createContext();

const NotifyToast = ({ id, type, message, onClose, autoClose = true }) => {
  useEffect(() => {
    if (!autoClose) return;
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose, autoClose]);

  if (!type || !icons[type]) return null;
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 150, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-white  shadow-md border-1 pl-4 pr-6 py-3 rounded-[5px] flex  gap-3 z-50 font-nunito ${
        type === "success"
          ? "border-green-500"
          : type === "error"
          ? "border-red-500"
          : type === "warning"
          ? "border-yellow-500"
          : type === "info"
          ? "border-blue-500"
          : "border-gray-500"
      }`}
    >
      <div
        className={`text-xl ${
          type === "success"
            ? "text-green-500"
            : type === "error"
            ? "text-red-500"
            : type === "warning"
            ? "text-yellow-500"
            : type === "info"
            ? "text-blue-500"
            : "text-gray-500"
        }`}
      >
        <i className={icons[type]}></i>
      </div>
      <div className="flex-1 flex flex-col ">
        <h1 className="text-md font-bold ">{type}</h1>
        <div className="text-[0.8rem] font-light">{message}</div>
      </div>
    </motion.div>
  );
};

export const NotifyProvider = ({ children }) => {
  const [notifies, setNotifies] = useState([]);

  const addNotify = useCallback((type, message, options = {}) => {
    if (!type || !icons[type] || !message) return;
    const id = Date.now() + Math.random();
    setNotifies((prev) => [...prev, { id, type, message, ...options }]);
    return id;
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
        <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-[9999]">
          <AnimatePresence>
            {notifies.map((n) => (
              <NotifyToast
                key={n.id}
                id={n.id}
                type={n.type}
                message={n.message}
                onClose={removeNotify}
                autoClose={n.autoClose}
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
