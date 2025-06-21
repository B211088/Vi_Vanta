import React, { useState, useEffect } from "react";

// Component hiệu ứng typewriter
const TypewriterText = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Reset khi text thay đổi
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <div>
      <MarkdownRenderer content={displayedText} />
      {currentIndex < text.length && (
        <span className="animate-pulse text-gray-400">|</span>
      )}
    </div>
  );
};

// Component tin nhắn assistant với hiệu ứng
const AssistantMessage = ({ message }) => {
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  useEffect(() => {
    // Chỉ hiển thị hiệu ứng typewriter cho tin nhắn mới (không loading, không error)
    if (!message.isLoading && !message.isError && message.content) {
      // Delay nhỏ để tạo hiệu ứng mượt mà
      const timer = setTimeout(() => {
        setShowTypewriter(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [message.isLoading, message.isError, message.content]);

  const handleTypewriterComplete = () => {
    setIsTypingComplete(true);
  };

  if (message.isLoading) {
    return (
      <div className="bg-gray-100 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="bg-red-50 border border-red-200">
        <MarkdownRenderer content={message.content} />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      <div className="text-sm">
        {showTypewriter && !isTypingComplete ? (
          <TypewriterText
            text={message.content}
            speed={30} // Tốc độ hiển thị (ms per character)
            onComplete={handleTypewriterComplete}
          />
        ) : isTypingComplete ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          // Hiển thị placeholder trong khi chờ
          <div className="flex items-center gap-2 text-gray-400">
            <div className="animate-pulse">Đang chuẩn bị câu trả lời...</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Component chính với messages
const ChatMessages = ({ messages, messagesEndRef }) => {
  return (
    <div className="w-full h-full max-h-full overflow-y-auto flex flex-col gap-[30px] rounded-md">
      {messages?.map((message) =>
        message.role === "user" ? (
          <div key={message._id} className="w-full flex justify-end">
            <div className="w-fit max-w-[80%] flex justify-end p-[10px] text-justify bg-[#44444414] rounded-md">
              <span className="text-sm">{message.content}</span>
            </div>
          </div>
        ) : message.role === "assistant" ? (
          <div key={message._id} className="w-full flex justify-start">
            <div className="w-fit max-w-[80%] p-[10px] text-justify rounded-md">
              <AssistantMessage message={message} />
            </div>
          </div>
        ) : (
          <div key={message._id}></div>
        )
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
