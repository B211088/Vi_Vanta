import { useTheme } from "../../../hook/useTheme";
import Header from "../../layout/Header";
import ChatBotBox from "../../ui/chatbot/ChatBotBox";

const ChatBot = () => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`w-full flex flex-col font-nunito ${
        isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
      }`}
    >
      <Header />
      <ChatBotBox />
    </div>
  );
};

export default ChatBot;
