import React, { useRef, useCallback } from "react";

const ChatInput = ({
  userInput,
  setUserInput,
  isSubmitting,
  onSubmit,
  onClearChat,
  models,
  selectedAiModel,
  setSelectedAiModel,
  messagesLength,
  latestMessageId,
  animatedMessageIds,
  setAnimatedMessageIds,
}) => {
  const textareaRef = useRef(null);

  // Xử lý thay đổi input
  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setUserInput(value);

      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }

      // FIXED: Chỉ dừng animation typewriter khi user BẮT ĐẦU gõ (không phải mỗi keystroke)
      // Kiểm tra nếu đây là lần đầu user gõ từ sau khi nhận được response mới
      if (
        latestMessageId &&
        !animatedMessageIds.has(latestMessageId) &&
        value.length === 1
      ) {
        // Chỉ dừng khi user bắt đầu gõ ký tự đầu tiên
        setAnimatedMessageIds((prev) => new Set([...prev, latestMessageId]));
      }
    },
    [setUserInput, latestMessageId, animatedMessageIds, setAnimatedMessageIds]
  );

  // Xử lý phím Enter
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (userInput.trim() && !isSubmitting) {
          onSubmit(userInput);
        }
      }
    },
    [userInput, isSubmitting, onSubmit]
  );

  // Xử lý click send
  const handleSendClick = useCallback(() => {
    if (userInput.trim() && !isSubmitting) {
      onSubmit(userInput);
    }
  }, [userInput, isSubmitting, onSubmit]);

  // Xử lý thay đổi model
  const handleModelChange = useCallback(
    (e) => {
      const selectedId = e.target.value;
      const selectedModel = models.find((model) => model._id === selectedId);
      setSelectedAiModel(selectedModel);
    },
    [models, setSelectedAiModel]
  );

  return (
    <div className="w-full shadow-sm rounded-md p-[10px] mt-[20px] bg-light-50 relative">
      <div className="w-full">
        <textarea
          ref={textareaRef}
          className="w-full min-h-[40px] max-h-[360px] overflow-y-auto text-sm outline-none overflow-hidden resize-none"
          placeholder="Hãy nhập câu hỏi của bạn!"
          value={userInput}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={isSubmitting}
        />
      </div>

      <div className="w-full flex justify-end items-center mt-2">
        <div className="flex items-center gap-[10px]">
          <button
            onClick={handleSendClick}
            disabled={isSubmitting || !userInput.trim()}
            className={`aspect-square w-[30px] h-[30px] rounded-full flex items-center justify-center bg-teal-400 text-light-50 cursor-pointer transition-all  ${
              isSubmitting || !userInput.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white "></div>
            ) : (
              <i className="fa-solid fa-arrow-up"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
