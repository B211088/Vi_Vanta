import { useTheme } from "../../hook/useTheme";

const Wrapper = ({ children, bgDark, bgLight }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`w-full px-[20px] font-nunito text-dark-50 ${
        isDarkMode
          ? `bg-${bgLight}  text-dark-100`
          : `bg-${bgDark} text-light-100`
      }`}
    >
      {children}
    </div>
  );
};

export default Wrapper;
