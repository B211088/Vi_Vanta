import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatMessage from "./ChatMessages";
import ChatInput from "./ChatInput";
import ScrollToBottom from "./ScrollToBottom";
import { Bot, BotMessageSquare, MessageSquareDiff } from "lucide-react";
import { useNotify } from "../../../hook/useNotify";
import { useTheme } from "../../../hook/useTheme";
import { useChatLogic } from "../../../hook/useChatLogic";
import {
  deleteSectionChatHandle,
  getAllSectionsChat,
  getCollectionActive,
  getSectionChat,
} from "../../../services/chatbot.service";
import { clearCurrentSection } from "../../../store/slices/chatbot.slice";

const ChatBotBox = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyError, notifyConfirm } = useNotify();
  const { loading, sections, section, collection } = useSelector(
    (state) => state.chatbot
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCollectionActive());
  }, []);

  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [shouldStopAllTypewriter, setShouldStopAllTypewriter] = useState(false);

  // Memoize collection info để tránh re-render
  const collectionInfo = useMemo(() => {
    if (!collection) return null;
    return {
      id: collection._id,
      name: collection.name,
      description: collection.description,
      maxToken: collection.maxToken,
      chunkLimit: collection.chunkLimit,
      temperature: collection.temperature,
      similarityThreshold: collection.similarityThreshold,
      isActive: collection.isActive,
      status: collection.status,
    };
  }, [collection]);

  const {
    messages,
    models,
    selectedAiModel,
    setSelectedAiModel,
    userInput,
    setUserInput,
    isSubmitting,
    handleSubmitQuestion,
    handleClearChat,
    containerRef,
    messagesEndRef,
    latestMessageId,
    animatedMessageIds,
    setAnimatedMessageIds,
    refreshSections,
    isNewMessage,
  } = useChatLogic(collectionInfo?.id, currentSectionId);

  // Optimized useEffect - chỉ load sections khi cần
  useEffect(() => {
    if (sections.length === 0) {
      dispatch(getAllSectionsChat());
    }
  }, [dispatch, sections.length]);

  // Sync section ID với Redux state
  useEffect(() => {
    if (section && section._id !== currentSectionId) {
      setCurrentSectionId(section._id);
    }
  }, [section, currentSectionId]);

  // Auto refresh sections cho cuộc hội thoại mới
  useEffect(() => {
    if (!currentSectionId && messages.length > 0) {
      const timer = setTimeout(() => {
        console.log("Auto-refreshing sections after new conversation");
        refreshSections();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentSectionId, messages.length, refreshSections]);

  // Reset typewriter flag khi có message mới
  useEffect(() => {
    if (isNewMessage) {
      setShouldStopAllTypewriter(false);
    }
  }, [latestMessageId, isNewMessage]);

  // Handlers với useCallback để tối ưu performance
  const handleSelectSection = useCallback(
    async (sectionId) => {
      try {
        console.log("Selecting section:", sectionId);
        setShouldStopAllTypewriter(true);
        setCurrentSectionId(sectionId);
        await dispatch(getSectionChat(sectionId));
      } catch (error) {
        console.error("Error selecting section:", error);
        notifyError("Lỗi khi tải cuộc trò chuyện");
        setCurrentSectionId(null);
      }
    },
    [dispatch, notifyError]
  );

  const handleNewConversation = useCallback(() => {
    setShouldStopAllTypewriter(true);
    dispatch(clearCurrentSection());
    setCurrentSectionId(null);
    handleClearChat();
  }, [dispatch, handleClearChat]);

  const handleEnhancedSubmitQuestion = useCallback(
    async (question) => {
      const wasNewConversation = !currentSectionId;

      try {
        await handleSubmitQuestion(question);

        if (wasNewConversation) {
          setTimeout(() => {
            console.log(
              "Refreshing sections after first message in new conversation"
            );
            refreshSections();
          }, 1500);
        }
      } catch (error) {
        console.error("Error submitting question:", error);
        notifyError("Lỗi khi gửi tin nhắn");
      }
    },
    [currentSectionId, handleSubmitQuestion, refreshSections, notifyError]
  );

  const handleRemoveSection = useCallback(
    async (id) => {
      try {
        const confirm = await notifyConfirm(
          "Bạn có muốn xóa phiên chat này không?"
        );
        if (confirm) {
          const response = await dispatch(deleteSectionChatHandle(id));
          if (response.success) {
            notifySuccess("Xoá phiên chat thành công!");
            // Nếu đang xem section bị xóa, chuyển về cuộc hội thoại mới
            if (currentSectionId === id) {
              handleNewConversation();
            }
          }
        }
      } catch (error) {
        console.error("Error removing section:", error);
        notifyError("Lỗi khi xóa phiên chat");
      }
    },
    [
      dispatch,
      notifySuccess,
      notifyError,
      currentSectionId,
      handleNewConversation,
    ]
  );

  // Hiển thị loading nếu chưa có collection
  if (!collection) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin collection...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ height: "calc(100vh - 95px)" }}
      className="w-full min-h-full flex rounded-md overflow-hidden"
    >
      {/* Sidebar trái - Danh sách sections */}
      <div
        className={`w-[250px] flex flex-col text-sm transition-colors duration-200 ${
          isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
        }`}
      >
        {/* Nút tạo cuộc trò chuyện mới */}
        <div className="w-full p-[10px] border-b border-gray-300">
          <button
            onClick={handleNewConversation}
            className="w-full p-[8px] flex items-center gap-2 border-1 border-dark-700 text-dark-500  cursor-pointer rounded-md  transition-colors text-sm font-medium disabled:opacity-50"
            disabled={isSubmitting}
          >
            <MessageSquareDiff className="w-5 h-5 text-dark-500" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Header lịch sử chat */}
        <div className="w-full px-[15px] py-[10px] border-b border-gray-300 flex items-center justify-between">
          <span className="font-semibold">Lịch sử chat</span>
          <button
            onClick={refreshSections}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            title="Làm mới danh sách"
            disabled={loading}
          >
            {loading ? "⟳" : "↻"}
          </button>
        </div>

        {/* Danh sách sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full flex flex-col gap-[5px] p-[10px]">
            {loading && sections.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Đang tải...
              </div>
            ) : sections.length > 0 ? (
              sections.map((sectionItem) => (
                <button
                  key={sectionItem._id}
                  disabled={isSubmitting}
                  className={`w-full flex items-center gap-[5px] justify-between  px-2 py-1 border border-gray-300 rounded-md hover:shadow-sm cursor-pointer transition-all ${
                    currentSectionId === sectionItem._id
                      ? "bg-blue-100 border-blue-500 shadow-sm"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectSection(sectionItem._id)}
                  title={sectionItem.title}
                >
                  <div className="flex-1 text-xs font-medium line-clamp-1 text-start  pr-2">
                    {sectionItem.title}
                  </div>
                  <div
                    className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSection(sectionItem._id);
                    }}
                    disabled={loading}
                    title="Xóa cuộc trò chuyện"
                  >
                    <i className="fa-regular fa-trash-can text-red-500 text-xs"></i>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 text-xs py-4">
                Chưa có cuộc trò chuyện nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Khu vực chat chính */}
      <div className="flex-1 h-full flex flex-col items-center p-[30px] bg-[#94c0d11d] relative">
        {/* Hiển thị thông tin section và collection hiện tại */}
        <div className="w-full mb-4">
          <div className="text-center">
            {currentSectionId ? (
              <div className="text-sm text-gray-600"></div>
            ) : (
              <div className="w-full flex flex-col items-center text-sm text-gray-600">
                <div className="flex  items-center">
                  <BotMessageSquare className="w-12 h-12 text-vivanta-500" />
                  <span className="font-bold text-vivanta-500 text-3xl">
                    VIVANTA AI
                  </span>
                </div>

                <h1 className="text-2xl font-bold py-2">
                  Xin chào, {user ? user?.fullName : "Bạn"}!
                </h1>
                <p className="text-md">Chúng tôi có thể giúp gì cho bạn!</p>
              </div>
            )}
          </div>
        </div>

        {/* Khu vực hiển thị messages */}
        <div
          ref={containerRef}
          className="w-full h-full max-h-full overflow-y-auto sidebar-scroll-none flex flex-col gap-[30px] rounded-md"
        >
          {messages?.map((message) => (
            <ChatMessage
              key={message._id}
              message={message}
              isLatest={message._id === latestMessageId}
              hasBeenAnimated={animatedMessageIds.has(message._id)}
              markAnimated={() =>
                setAnimatedMessageIds((prev) => new Set([...prev, message._id]))
              }
              shouldStopTypewriter={shouldStopAllTypewriter}
            />
          ))}
          <div ref={messagesEndRef} data-messages-end />
        </div>

        <ScrollToBottom
          containerRef={containerRef}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          userInput={userInput}
          setUserInput={setUserInput}
          isSubmitting={isSubmitting}
          onSubmit={handleEnhancedSubmitQuestion}
          onClearChat={handleClearChat}
          models={models}
          selectedAiModel={selectedAiModel}
          setSelectedAiModel={setSelectedAiModel}
          messagesLength={messages.length}
          latestMessageId={latestMessageId}
          animatedMessageIds={animatedMessageIds}
          setAnimatedMessageIds={setAnimatedMessageIds}
          collectionInfo={collectionInfo}
        />
      </div>
    </div>
  );
};

export default ChatBotBox;
