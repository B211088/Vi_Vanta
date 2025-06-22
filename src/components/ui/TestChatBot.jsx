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

const TestChatBot = () => {
  const dispatch = useDispatch();
  const { loading, sections, section } = useSelector((state) => state.chatbot);
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("id");
  const collectionName = searchParams.get("name");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collectionId);
  const [selectedSection, setSelectedSection] = useState(null);

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
    currentSectionId, // Thêm từ hook
    setCurrentSectionId, // Thêm từ hook
  } = useChatLogic(selectedCollectionId);

  useEffect(() => {
    dispatch(getAllSectionsChat());
  }, []);

  const handleSelecSection = async (id) => {
    try {
      const response = await dispatch(getSectionChat(id));
      setSelectedSection(response.data);

      // Cập nhật currentSectionId trong hook
      setCurrentSectionId(id);

      console.log("Selected section:", response.data);
    } catch (error) {
      console.log(error);
    }
  };

  console.log("selectedSection:", selectedSection);
  console.log("currentSectionId:", currentSectionId);

  return (
    <div
      style={{ height: "calc(100vh - 95px)" }}
      className="w-full min-h-full flex  rounded-md overflow-hidden"
    >
      <div className="w-[200px] flex flex-col items-center bg-light-50 text-sm ">
        <div className="w-full p-[5px] rounded-md border-1 border-dark-700 hover:shadow-sm cursor-pointer">
          Tôi bị suy thận
        </div>
        <div className="w-full p-[5px] ">
          <span>Đoạn chat</span>
        </div>
        <div className="w-full flex flex-col gap-[5px] items-center p-[10px]">
          {sections.length > 0 &&
            sections?.map((section) => (
              <div
                onClick={() => handleSelecSection(section._id)}
                key={section._id}
                className={`w-full px-[5px] py-[8px] border-1 border-dark-700 rounded-md hover:shadow-sm cursor-pointer truncate line-clamp-1 ${
                  currentSectionId === section._id
                    ? "bg-blue-100 border-blue-500"
                    : ""
                }`}
              >
                {section.title}
              </div>
            ))}
        </div>
      </div>
      <div className="flex-1 h-full flex flex-col items-center p-[30px] bg-[#94c0d11d] relative">
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
          onSubmit={handleSubmitQuestion}
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
        currentSectionId={currentSectionId} // Truyền xuống sidebar nếu cần
      />
    </div>
  );
};

export default TestChatBot;
