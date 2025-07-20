import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  memo,
  lazy,
  Suspense,
  useRef,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Bot,
  BotMessageSquare,
  MessageSquareDiff,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MessageSquareX,
  SquareMinus,
} from "lucide-react";
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
import { MarkdownRenderer } from "../../../utils/convertMarkdownToJSX";
import CharacterTypewriter from "./CharacterTypewriter";
import WelcomeScreen from "./WelcomeScreen";

// Lazy load heavy components
const ChatInput = lazy(() => import("./ChatInput"));
const ScrollToBottom = lazy(() => import("./ScrollToBottom"));

// Simple Loading Component
const SimpleTypingIndicator = memo(() => {
  const [dotCount, setDotCount] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i <= dotCount ? "bg-gray-400" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-gray-500 text-sm">Đang trả lời...</span>
    </div>
  );
});

// Simple Chat Message Component
const SimpleChatMessage = memo(
  ({
    message,
    isLatest,
    hasBeenAnimated,
    markAnimated,
    shouldStopTypewriter,
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const messageRef = useRef(null);

    // Intersection Observer for performance
    useEffect(() => {
      if (!messageRef.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1, rootMargin: "50px" }
      );

      observer.observe(messageRef.current);
      return () => observer.disconnect();
    }, []);

    const handleTypewriterComplete = useCallback(() => {
      markAnimated();
    }, [markAnimated]);

    const isUserMessage = message.role === "user";
    const shouldUseTypewriter =
      message.role === "assistant" &&
      isLatest &&
      !hasBeenAnimated &&
      isVisible &&
      !message.isLoading;

    return (
      <div
        ref={messageRef}
        className={`message-wrapper mb-4 transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div
          className={`message rounded-lg py-2  max-w-4xl transition-all duration-200 ${
            isUserMessage
              ? "bg-teal-50 w-fit pr-20 pl-4 text-black ml-auto mr-4 rounded-md "
              : " text-black mr-auto ml-4 "
          }`}
        >
          {/* Message Content */}
          <div className="message-content ">
            {message.isLoading ? (
              <SimpleTypingIndicator />
            ) : message.isError ? (
              <div className="w-full p-3 rounded-md border-1 border-red-400 bg-red-200 text-red-500">
                {message}
              </div>
            ) : shouldUseTypewriter ? (
              <CharacterTypewriter
                text={message.content}
                speed="normal" // 'lightning', 'fast', 'normal', 'slow', 'very-slow'
                onComplete={handleTypewriterComplete}
                shouldStop={shouldStopTypewriter}
                messageId={message._id}
                naturalPauses={true} // Dừng lâu hơn sau dấu câu
                showCursor={true} // Hiển thị cursor nhấp nháy
              />
            ) : (
              <MarkdownRenderer content={message.content} />
            )}
          </div>

          {/* Message Footer */}
          {!message.isLoading && (
            <div className="message-footer flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              {/* Simple Action Buttons for Assistant Messages */}
              {message.role === "assistant" && !message.isError && (
                <div className="flex items-center space-x-2 ">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(message.content)
                    }
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded cursor-pointer"
                    title="Sao chép"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => console.log("Like:", message._id)}
                    className="text-xs text-gray-400 hover:text-green-600 transition-colors px-2 py-1 rounded cursor-pointer"
                    title="Thích"
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => console.log("Dislike:", message._id)}
                    className="text-xs text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded cursor-pointer"
                    title="Không thích"
                  >
                    <ThumbsDown className="w-3 h-3 " />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

// Memoized Section Item Component
const SectionItem = memo(
  ({ section, isSelected, onSelect, onRemove, isDisabled }) => {
    const handleClick = useCallback(() => {
      if (!isDisabled) onSelect(section._id);
    }, [section._id, onSelect, isDisabled]);

    const handleRemove = useCallback(
      (e) => {
        e.stopPropagation();
        onRemove(section._id);
      },
      [section._id, onRemove]
    );

    return (
      <button
        className={`w-full flex items-center gap-2 justify-between px-2 py-1 border border-gray-300 rounded-md hover:shadow-sm cursor-pointer transition-all duration-200 ${
          isSelected
            ? "bg-blue-100 border-blue-500 shadow-sm"
            : "hover:bg-gray-100"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={handleClick}
        disabled={isDisabled}
        title={section.title}
      >
        <div className="flex-1 text-xs font-medium truncate text-start pr-2">
          {section.title}
        </div>
        <div
          className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
          onClick={handleRemove}
          title="Xóa cuộc trò chuyện"
        >
          <SquareMinus className="text-light-500 h-3.5 w-3.5" />
        </div>
      </button>
    );
  }
);

// Loading Skeleton Component
const LoadingSkeleton = memo(() => (
  <div className="w-full flex items-center justify-center py-8">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
      <p className="text-gray-500 text-sm">Đang tải thông tin collection...</p>
    </div>
  </div>
));

// Optimized Sidebar Component
const ChatSidebar = memo(
  ({
    sections,
    loading,
    currentSectionId,
    isSubmitting,
    onSelectSection,
    onRemoveSection,
    onNewConversation,
    onRefreshSections,
    isDarkMode,
  }) => {
    return (
      <div
        className={`w-[250px] flex flex-col text-sm transition-colors duration-200 ${
          isDarkMode ? "bg-light-50 text-dark-50" : "bg-dark-200 text-light-50"
        }`}
      >
        {/* New Conversation Button */}
        <div className="w-full p-2 border-b border-gray-300">
          <button
            onClick={onNewConversation}
            className="w-full p-2 flex items-center gap-2  text-dark-500 cursor-pointer rounded-md transition-colors text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            <MessageSquareDiff className="w-5 h-5" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Chat History Header */}
        <div className="w-full px-3 pt-2  border-gray-300 flex items-center justify-between">
          <span className="font-bold text-xs">Đoạn chat</span>
          <button
            onClick={onRefreshSections}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
            title="Làm mới danh sách"
            disabled={loading}
          >
            {loading && (
              <Loader2 className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            )}
          </button>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full flex flex-col gap-1 p-2">
            {loading && sections.length === 0 ? (
              <div className="text-center text-gray-400 text-xs py-4">
                <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                Đang tải...
              </div>
            ) : sections.length > 0 ? (
              sections.map((section) => (
                <SectionItem
                  key={section._id}
                  section={section}
                  isSelected={currentSectionId === section._id}
                  onSelect={onSelectSection}
                  onRemove={onRemoveSection}
                  isDisabled={isSubmitting}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 text-xs py-4">
                Chưa có cuộc trò chuyện nào
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Main ChatBot Component
const ChatBotBox = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const { notifySuccess, notifyError, notifyConfirm } = useNotify();
  const { loading, sections, section, collection } = useSelector(
    (state) => state.chatbot
  );
  const { user } = useSelector((state) => state.auth);

  // States
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [shouldStopAllTypewriter, setShouldStopAllTypewriter] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Memoize collection info
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

  // Initialize chat logic
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

  // Initialize collection data
  useEffect(() => {
    if (!isInitialized) {
      dispatch(getCollectionActive());
      setIsInitialized(true);
    }
  }, [dispatch, isInitialized]);

  // Load sections only when needed
  useEffect(() => {
    if (collection && sections.length === 0) {
      dispatch(getAllSectionsChat());
    }
  }, [collection, dispatch, sections.length]);

  // Sync section ID
  useEffect(() => {
    if (section && section._id !== currentSectionId) {
      setCurrentSectionId(section._id);
    }
  }, [section, currentSectionId]);

  // Auto refresh for new conversations
  useEffect(() => {
    if (!currentSectionId && messages.length > 0 && user) {
      const timer = setTimeout(refreshSections, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentSectionId, messages.length, refreshSections, user]);

  // Reset typewriter on new messages
  useEffect(() => {
    if (isNewMessage) {
      setShouldStopAllTypewriter(false);
    }
  }, [latestMessageId, isNewMessage]);

  // Optimized handlers
  const handleSelectSection = useCallback(
    async (sectionId) => {
      try {
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
        setShouldStopAllTypewriter(false);
        await handleSubmitQuestion(question);

        if (wasNewConversation) {
          setTimeout(refreshSections, 1500);
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
      notifyConfirm,
      currentSectionId,
      handleNewConversation,
    ]
  );

  // Show loading if not initialized
  if (!isInitialized || !collection) {
    return <LoadingSkeleton />;
  }

  return (
    <div
      style={{ height: "calc(100vh - 65px)" }}
      className="w-full min-h-full flex rounded-md overflow-hidden"
    >
      {/* Sidebar */}
      {user && (
        <ChatSidebar
          sections={sections}
          loading={loading}
          currentSectionId={currentSectionId}
          isSubmitting={isSubmitting}
          onSelectSection={handleSelectSection}
          onRemoveSection={handleRemoveSection}
          onNewConversation={handleNewConversation}
          onRefreshSections={refreshSections}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col items-center p-6 bg-[#94c0d11d] relative">
        {/* Header */}
        {messages.length === 0 && (
          <div className="w-full mb-4">
            <div className="text-center">
              {!currentSectionId && <WelcomeScreen userName={user?.fullName} />}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div
          ref={containerRef}
          className="w-full h-full max-h-full overflow-y-auto sidebar-scroll-none flex flex-col gap-2 rounded-md"
        >
          {messages?.map((message) => (
            <SimpleChatMessage
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

        <Suspense
          fallback={
            <div className="w-full h-20 bg-gray-100 rounded animate-pulse" />
          }
        >
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
        </Suspense>
      </div>
    </div>
  );
};

export default memo(ChatBotBox);
