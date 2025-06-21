import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import ChatMessage from "./ChatMessages";
import ChatInput from "./ChatInput";
import ChatSidebar from "./ChatSidebar";
import ScrollToBottom from "./ScrollToBottom";
import { useChatLogic } from "../../hook/useChatLogic";

const TestChatBot = () => {
  const { loading, section } = useSelector((state) => state.chatbot);
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get("id");
  const collectionName = searchParams.get("name");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collectionId);
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
  } = useChatLogic(selectedCollectionId);

  return (
    <div
      style={{ height: "calc(100vh - 95px)" }}
      className="w-full min-h-full flex gap-[5px] rounded-md overflow-hidden"
    >
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
      />
    </div>
  );
};

export default TestChatBot;
