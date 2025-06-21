import React, { useState, useEffect, useCallback, useRef } from "react";
import { MarkdownRenderer } from "../../utils/convertMarkdownToJSX";
import TypewriterText from "./TypewriterText";

const ChatMessage = ({ message, isLatest, hasBeenAnimated, markAnimated }) => {
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
}) => {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [shouldStopTypewriter, setShouldStopTypewriter] = useState(false);
  const completedRef = useRef(false);

  const shouldAnimate =
    isLatest &&
    !hasBeenAnimated &&
    !message.isLoading &&
    !message.isError &&
    !completedRef.current;

  // Khởi tạo typewriter khi cần
  useEffect(() => {
    if (shouldAnimate && message.content && !showTypewriter) {
      setShowTypewriter(true);
      setShouldStopTypewriter(false);
      setIsTypingComplete(false);
      completedRef.current = false;
    }
  }, [shouldAnimate, message.content, showTypewriter]);

  // Reset khi message thay đổi
  useEffect(() => {
    if (!shouldAnimate) {
      setShowTypewriter(false);
      setIsTypingComplete(false);
      setShouldStopTypewriter(false);
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

  // Hàm để dừng typewriter (có thể gọi từ parent component)
  const stopTypewriter = useCallback(() => {
    setShouldStopTypewriter(true);
  }, []);

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
        {shouldAnimate && showTypewriter && !isTypingComplete ? (
          <TypewriterText
            key={`${message._id}-typewriter`}
            text={message.content}
            speed={5}
            onComplete={handleTypewriterComplete}
            shouldStop={shouldStopTypewriter}
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
