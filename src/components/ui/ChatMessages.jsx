import React, { useState, useEffect, useCallback, useRef } from "react";
import { MarkdownRenderer } from "../../utils/convertMarkdownToJSX";
import TypewriterText from "./TypewriterText";

const ChatMessage = ({
  message,
  isLatest,
  hasBeenAnimated,
  markAnimated,
  shouldStopTypewriter, // **THÊM prop mới**
}) => {
  if (message.role === "user") {
    return (
      <div className="w-full flex justify-end">
        <div className="w-fit max-w-[80%] flex justify-end p-[10px] text-justify bg-[#44444414] rounded-md">
          <span className="text-sm">{message.content}</span>
        </div>
      </div>
    );
  }

  if (message.role === "assistant") {
    return (
      <div className="w-full flex justify-start text-sm">
        <div className="w-fit max-w-[80%] p-[10px] text-justify rounded-md">
          <AssistantMessage
            message={message}
            isLatest={isLatest}
            hasBeenAnimated={hasBeenAnimated}
            markAnimated={markAnimated}
            shouldStopTypewriter={shouldStopTypewriter} // **TRUYỀN prop xuống**
          />
        </div>
      </div>
    );
  }

  return <div key={message._id}></div>;
};

const AssistantMessage = ({
  message,
  isLatest,
  hasBeenAnimated,
  markAnimated,
  shouldStopTypewriter, // **NHẬN prop mới**
}) => {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [internalShouldStop, setInternalShouldStop] = useState(false);
  const completedRef = useRef(false);

  const shouldAnimate =
    isLatest &&
    !hasBeenAnimated &&
    !message.isLoading &&
    !message.isError &&
    !completedRef.current;

  // **THÊM: Effect để theo dõi shouldStopTypewriter từ parent**
  useEffect(() => {
    if (shouldStopTypewriter) {
      setInternalShouldStop(true);
      // Nếu đang chạy typewriter thì dừng ngay và hiển thị full content
      if (showTypewriter && !isTypingComplete) {
        setShowTypewriter(false);
        setIsTypingComplete(true);
        completedRef.current = true;
        markAnimated();
      }
    }
  }, [shouldStopTypewriter, showTypewriter, isTypingComplete, markAnimated]);

  // Khởi tạo typewriter khi cần
  useEffect(() => {
    // **UPDATED: Chỉ khởi tạo typewriter nếu không bị yêu cầu dừng từ parent**
    if (
      shouldAnimate &&
      message.content &&
      !showTypewriter &&
      !shouldStopTypewriter
    ) {
      console.log("Starting typewriter for message:", message._id);
      setShowTypewriter(true);
      setInternalShouldStop(false);
      setIsTypingComplete(false);
      completedRef.current = false;
    }
  }, [shouldAnimate, message.content, showTypewriter, shouldStopTypewriter]);

  // Reset khi message thay đổi
  useEffect(() => {
    if (!shouldAnimate) {
      setShowTypewriter(false);
      setIsTypingComplete(false);
      setInternalShouldStop(false);
      completedRef.current = false;
    }
  }, [shouldAnimate, message._id]);

  const handleTypewriterComplete = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      setIsTypingComplete(true);
      markAnimated();

      // Scroll xuống sau khi hoàn thành
      setTimeout(() => {
        const messagesEnd = document.querySelector("[data-messages-end]");
        if (messagesEnd) {
          messagesEnd.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  }, [markAnimated]);

  // Loading state
  if (message.isLoading) {
    return (
      <div className="bg-gray-100 animate-pulse text-sm p-[10px]">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (message.isError) {
    return (
      <div className="bg-red-50 border border-red-200 p-[10px]">
        <MarkdownRenderer content={message.content} />
      </div>
    );
  }

  // Normal message rendering
  return (
    <div className="p-[10px]">
      <div className="text-sm">
        {shouldAnimate &&
        showTypewriter &&
        !isTypingComplete &&
        !shouldStopTypewriter ? (
          <TypewriterText
            key={`${message._id}-typewriter`}
            text={message.content}
            speed={5}
            onComplete={handleTypewriterComplete}
            shouldStop={internalShouldStop || shouldStopTypewriter} // **CẬP NHẬT logic**
            messageId={message._id}
          />
        ) : (
          <MarkdownRenderer content={message.content} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
