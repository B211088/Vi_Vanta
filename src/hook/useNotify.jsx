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
  warning: "fa-solid fa-triangle-exclamation",
  info: "fa-solid fa-circle-exclamation",
  loading: "fa-solid fa-spinner",
  confirm: "fa-solid fa-question-circle", // thêm icon confirm
};

const NotifyContext = createContext();

const NotifyToast = ({
  id,
  type,
  message,
  onClose,
  autoClose = true,
  onConfirm,
}) => {
  useEffect(() => {
    if (!autoClose || type === "confirm") return;
    const timer = setTimeout(() => onClose(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onClose, autoClose, type]);

  if (!type || !icons[type]) return null;
  if (!message) return null;

  const getTitleColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
      case "confirm":
        return "text-blue-700";
      default:
        return "text-gray-500";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 150, scale: 0.9 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={`bg-white shadow-md border-1 pl-4 pr-6 py-3 rounded-[5px] flex gap-3 z-50 font-nunito ${
        type === "success"
          ? "border-green-500"
          : type === "error"
          ? "border-red-500"
          : type === "warning"
          ? "border-yellow-500"
          : type === "info"
          ? "border-blue-500"
          : type === "confirm"
          ? "border-blue-700"
          : "border-gray-500"
      }`}
    >
      <div className={`text-xl ${getTitleColor(type)}`}>
        <i className={icons[type]}></i>
      </div>
      <div className="flex-1 flex flex-col">
        <h1 className={`text-md font-bold `}>{type}</h1>
        <div className={`text-[0.8rem] font-light `}>{message}</div>
        {type === "confirm" && (
          <div className="flex gap-2 mt-2">
            <button
              className="px-[10px] py-[5px] bg-blue-600 text-white rounded text-sm cursor-pointer"
              onClick={() => {
                if (onConfirm) onConfirm(true);
                onClose(id);
              }}
            >
              Xác nhận
            </button>
            <button
              className="px-[10px] py-[5px] bg-gray-300 text-black text-sm rounded cursor-pointer"
              onClick={() => {
                if (onConfirm) onConfirm(false);
                onClose(id);
              }}
            >
              Hủy
            </button>
          </div>
        )}
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

  // Hàm confirm trả về Promise<boolean>
  const notifyConfirm = (msg) =>
    new Promise((resolve) => {
      addNotify("confirm", msg, {
        autoClose: false,
        onConfirm: resolve,
      });
    });

  return (
    <NotifyContext.Provider
      value={{
        notifySuccess: (msg) => addNotify("success", msg),
        notifyError: (msg) => addNotify("error", msg),
        notifyWarning: (msg) => addNotify("warning", msg),
        notifyInfo: (msg) => addNotify("info", msg),
        notifyLoading: (msg) => addNotify("loading", msg),
        notifyConfirm, // thêm vào context
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
                onConfirm={n.onConfirm}
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
