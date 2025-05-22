import { useTheme } from "../../hook/useTheme";

const Wrapper = ({ children, bgDark, bgLight }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`w-full px-[20px] font-nunito text-dark-50 ${
        isDarkMode
          ? `bg-${bgDark} text-light-100`
          : `bg-${bgLight} border-[1px] border-solid border-[#ccc] text-dark-100`
      }`}
    >
      {children}
    </div>
  );
};

export default Wrapper;
