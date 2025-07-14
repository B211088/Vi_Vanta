import React, { useState, useEffect, useRef } from "react";
import { MarkdownRenderer } from "../../../utils/convertMarkdownToJSX";

const TypewriterText = ({
  text,
  speed = 5,
  onComplete,
  shouldStop = false,
  messageId,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // Reset khi text thay đổi
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsCompleted(false);
  }, [text]);

  // Logic hiệu ứng typewriter
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (isCompleted || shouldStop || currentIndex >= text.length) {
      if (currentIndex >= text.length && !isCompleted) {
        setIsCompleted(true);
        if (onComplete && mountedRef.current) {
          onComplete();
        }
      }
      return;
    }

    timerRef.current = setTimeout(() => {
      if (mountedRef.current && currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentIndex, text, speed, onComplete, isCompleted, shouldStop]);

  // Cleanup khi unmount
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
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsCompleted(true);
      if (onComplete && mountedRef.current) {
        onComplete();
      }
    }
  }, [shouldStop, text, isCompleted, onComplete]);

  const showCursor = !isCompleted && !shouldStop && currentIndex < text.length;

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
