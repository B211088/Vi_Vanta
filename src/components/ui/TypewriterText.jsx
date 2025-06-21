import React, { useState, useEffect, useRef, useMemo } from "react";
import { MarkdownRenderer } from "../../utils/convertMarkdownToJSX";

const TypewriterText = ({
  text,
  speed = 5,
  onComplete,
  shouldStop = false, // Prop để dừng animation từ bên ngoài
  messageId, // ID để track message cụ thể
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // Memoize text để tránh re-render không cần thiết
  const memoizedText = useMemo(() => text, [text]);

  // Reset khi text thay đổi
  useEffect(() => {
    if (memoizedText !== text) {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsCompleted(false);
    }
  }, [memoizedText, text]);

  // Logic typewriter chính
  useEffect(() => {
    // Clear timer cũ nếu có
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Nếu đã hoàn thành hoặc bị dừng, không làm gì thêm
    if (isCompleted || shouldStop || currentIndex >= memoizedText.length) {
      if (currentIndex >= memoizedText.length && !isCompleted) {
        setIsCompleted(true);
        if (onComplete && mountedRef.current) {
          onComplete();
        }
      }
      return;
    }

    // Tiếp tục animation
    timerRef.current = setTimeout(() => {
      if (mountedRef.current && currentIndex < memoizedText.length) {
        setDisplayedText((prev) => prev + memoizedText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, memoizedText, speed, onComplete, isCompleted, shouldStop]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Nếu bị dừng, hiển thị toàn bộ text ngay lập tức
  useEffect(() => {
    if (shouldStop && !isCompleted) {
      setDisplayedText(memoizedText);
      setCurrentIndex(memoizedText.length);
      setIsCompleted(true);
      if (onComplete && mountedRef.current) {
        onComplete();
      }
    }
  }, [shouldStop, memoizedText, isCompleted, onComplete]);

  const showCursor =
    !isCompleted && !shouldStop && currentIndex < memoizedText.length;

  return (
    <div>
      <MarkdownRenderer content={displayedText} />
      {showCursor && (
        <span className="animate-pulse text-gray-400 ml-1">|</span>
      )}
    </div>
  );
};

export default TypewriterText;
