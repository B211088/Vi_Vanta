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

      <div className="w-full flex justify-between items-center mt-2">
        <button
          onClick={onClearChat}
          disabled={isSubmitting || messagesLength === 0}
          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
        >
          Xóa chat
        </button>

        <div className="flex items-center gap-[10px]">
          <select
            className="outline-none text-[0.8rem] text-dark-300 border-1 border-dark-800 p-[5px] rounded-md"
            value={selectedAiModel?._id || ""}
            onChange={handleModelChange}
            disabled={isSubmitting}
          >
            {models?.map((model) => (
              <option key={model._id} value={model._id}>
                {model.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleSendClick}
            disabled={isSubmitting || !userInput.trim()}
            className={`aspect-square w-[30px] h-[30px] rounded-full flex items-center justify-center text-light-50 cursor-pointer transition-all ${
              isSubmitting || !userInput.trim()
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
