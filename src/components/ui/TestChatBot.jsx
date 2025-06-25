import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ChatMessage from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import ScrollToBottom from "./ScrollToBottom";
import { useChatLogic } from "../../hook/useChatLogic";
import {
  getAllSectionsChat,
  getSectionChat,
} from "../../services/chatbot.service";
import { clearCurrentSection } from "../../store/slices/chatbot.slice";

const TestChatBot = () => {
  const dispatch = useDispatch();
  const { loading, sections, section } = useSelector((state) => state.chatbot);
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("id");
  const collectionName = searchParams.get("name");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collectionId);
  const [currentSectionId, setCurrentSectionId] = useState(null);

  // THÊM: State để theo dõi khi nào cần dừng typewriter
  const [shouldStopAllTypewriter, setShouldStopAllTypewriter] = useState(false);

  useEffect(() => {
    if (section && section?._id !== currentSectionId) {
      setCurrentSectionId(section._id);
    }
  }, [section]);

  useEffect(() => {
    setCurrentSectionId(null);
  }, []);

  useEffect(() => {
    dispatch(clearCurrentSection());
  }, []);

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
    conversationContext,
    prompt,
    setPrompt,
    temperature,
    setTemperature,
    maxToken,
    setMaxToken,
    chunkLimit,
    setChunkLimit,
    similarityThreshold,
    setSimilarityThreshold,
    containerRef,
    messagesEndRef,
    latestMessageId,
    animatedMessageIds,
    setAnimatedMessageIds,
    refreshSections,
    isNewMessage, // **THÊM: Lấy flag từ hook**
  } = useChatLogic(selectedCollectionId, currentSectionId);

  // Load sections khi component mount
  useEffect(() => {
    dispatch(getAllSectionsChat());
  }, [dispatch]);

  // **THÊM: Auto refresh sections sau khi gửi tin nhắn trong cuộc trò chuyện mới**
  useEffect(() => {
    if (!currentSectionId && messages.length > 0) {
      const timer = setTimeout(() => {
        console.log("Auto-refreshing sections after new conversation");
        refreshSections();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentSectionId, messages.length, refreshSections]);

  // **THÊM: Reset shouldStopAllTypewriter chỉ khi có message mới thật sự**
  useEffect(() => {
    // Reset flag chỉ khi có message mới (không phải load từ section cũ)
    if (isNewMessage) {
      setShouldStopAllTypewriter(false);
    }
  }, [latestMessageId, isNewMessage]);

  // FIXED: Xử lý chọn section với logic đơn giản hơn
  const handleSelectSection = async (sectionId) => {
    try {
      console.log("Selecting section:", sectionId);

      // **THÊM: Dừng tất cả typewriter khi chọn section khác**
      setShouldStopAllTypewriter(true);

      // Set current section ID trước
      setCurrentSectionId(sectionId);

      // Load section data - section sẽ được cập nhật qua Redux
      await dispatch(getSectionChat(sectionId));
    } catch (error) {
      console.error("Error selecting section:", error);
      // Reset nếu có lỗi
      setCurrentSectionId(null);
    }
  };

  const handleNewConversation = () => {
    // **THÊM: Dừng typewriter khi tạo cuộc trò chuyện mới**
    setShouldStopAllTypewriter(true);

    // Clear section hiện tại
    dispatch(clearCurrentSection());
    setCurrentSectionId(null);
    // Clear messages
    handleClearChat();
  };

  const handleEnhancedSubmitQuestion = async (question) => {
    const wasNewConversation = !currentSectionId;

    await handleSubmitQuestion(question);

    // Nếu là cuộc trò chuyện mới, refresh sections sau khi gửi thành công
    if (wasNewConversation) {
      setTimeout(() => {
        console.log(
          "Refreshing sections after first message in new conversation"
        );
        refreshSections();
      }, 1500);
    }
  };

  return (
    <div
      style={{ height: "calc(100vh - 95px)" }}
      className="w-full min-h-full flex rounded-md overflow-hidden"
    >
      {/* Sidebar trái - Danh sách sections */}
      <div className="w-[200px] flex flex-col bg-light-50 text-sm">
        {/* Nút tạo cuộc trò chuyện mới */}
        <div className="w-full p-[10px] border-b border-gray-300">
          <button
            onClick={handleNewConversation}
            className="w-full p-[8px] bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            + Cuộc trò chuyện mới
          </button>
        </div>

        {/* Header */}
        <div className="w-full p-[10px] border-b border-gray-300">
          <span className="font-semibold text-gray-700">Lịch sử chat</span>
          {/* **THÊM: Nút refresh thủ công** */}
          <button
            onClick={refreshSections}
            className="ml-2 text-xs text-blue-600 hover:text-blue-800"
            title="Làm mới danh sách"
          >
            ↻
          </button>
        </div>

        {/* Danh sách sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full flex flex-col gap-[5px] p-[10px]">
            {loading && sections.length === 0 ? (
              <div className="text-center text-gray-500 text-xs">
                Đang tải...
              </div>
            ) : sections.length > 0 ? (
              sections.map((sectionItem) => (
                <div
                  key={sectionItem._id}
                  onClick={() => handleSelectSection(sectionItem._id)}
                  className={`w-full px-[8px] py-[10px] border border-gray-300 rounded-md hover:shadow-sm cursor-pointer truncate transition-all ${
                    currentSectionId === sectionItem._id
                      ? "bg-blue-100 border-blue-500 shadow-sm"
                      : "hover:bg-gray-50"
                  }`}
                  title={sectionItem.title}
                >
                  <div className="text-xs font-medium text-gray-800 line-clamp-2">
                    {sectionItem.title}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-xs">
                Chưa có cuộc trò chuyện nào
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Khu vực chat chính */}
      <div className="flex-1 h-full flex flex-col items-center p-[30px] bg-[#94c0d11d] relative">
        {/* Hiển thị thông tin section hiện tại */}
        <div className="w-full mb-4">
          <div className="text-center">
            {currentSectionId ? (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Đang chat trong: </span>
                <span className="text-blue-600">
                  {section?.title || "Đang tải..."}
                </span>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                <span className="text-green-600 font-medium">
                  Cuộc trò chuyện mới
                </span>
                <span className="text-xs block text-gray-500">
                  Tin nhắn đầu tiên sẽ tạo cuộc trò chuyện mới
                </span>
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
              shouldStopTypewriter={shouldStopAllTypewriter} // **THÊM prop mới**
            />
          ))}
          <div ref={messagesEndRef} />
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
        />
      </div>

      <ChatSidebar
        collectionId={collectionId}
        messagesLength={messages.length}
        selectedAiModel={selectedAiModel}
        loading={loading}
        conversationContext={conversationContext}
        section={section}
        prompt={prompt}
        setPrompt={setPrompt}
        isSubmitting={isSubmitting}
        maxToken={maxToken}
        setMaxToken={setMaxToken}
        temperature={temperature}
        setTemperature={setTemperature}
        chunkLimit={chunkLimit}
        setChunkLimit={setChunkLimit}
        similarityThreshold={similarityThreshold}
        setSimilarityThreshold={setSimilarityThreshold}
        setCollectionId={(collectionId) =>
          setSelectedCollectionId(collectionId)
        }
        collectionName={collectionName}
        currentSectionId={currentSectionId}
      />
    </div>
  );
};

export default TestChatBot;
