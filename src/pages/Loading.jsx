import { useTheme } from "../hook/useTheme";

const Loading = () => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`fixed top-0 bottom-0 right-0 left-0 flex items-center justify-center z-[100] ${
        isDarkMode ? "bg-white" : "bg-dark-200 text-white"
      } `}
    >
      <div className="flex flex-col items-center ">
        <div className="w-[100px] h-[100px] flex justify-center items-center">
          <div className="shapes-5"></div>
        </div>
        <div className="text-[1.2rem] font-nunito font-bold flex items-center gap-[10px]">
          <span>Chờ xíu...</span>
          <i className="fa-solid fa-hand"></i>
        </div>
      </div>
    </div>
  );
};

export default Loading;
