import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "../../../utils/convertMarkdownToJSX";

const CharacterTypewriter = memo(
  ({
    text,
    speed = "normal",
    onComplete,
    shouldStop = false,
    messageId,
    className = "",
    showCursor = true,
    naturalPauses = true,
  }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);

    // Sử dụng refs để tránh stale closure và re-render issues
    const currentIndexRef = useRef(0);
    const timerRef = useRef(null);
    const mountedRef = useRef(true);
    const textRef = useRef(text);
    const isTypingRef = useRef(false);

    // Speed mapping
    const getSpeed = () => {
      if (typeof speed === "number") return speed;
      const speedMap = {
        lightning: 10,
        fast: 20,
        normal: 30,
        slow: 50,
        "very-slow": 80,
      };
      return speedMap[speed] || 30;
    };

    const typingSpeed = getSpeed();

    // Clear timer function
    const clearTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    // Reset function
    const resetTypewriter = useCallback(() => {
      clearTimer();
      currentIndexRef.current = 0;
      setDisplayedText("");
      setIsCompleted(false);
      isTypingRef.current = false;
    }, [clearTimer]);

    // Update text ref when text changes
    useEffect(() => {
      textRef.current = text;
    }, [text]);

    // Reset when text changes (sử dụng messageId để detect thay đổi thực sự)
    useEffect(() => {
      console.log("📝 Text/MessageId changed:", {
        messageId,
        text: text?.substring(0, 30) + "...",
        textLength: text?.length,
      });

      if (!text) return;

      resetTypewriter();
    }, [messageId, resetTypewriter]); // Chỉ reset khi messageId thay đổi

    // Main typing function - không có dependencies để tránh re-creation
    const typeNextChar = useCallback(() => {
      const currentText = textRef.current;
      const currentIndex = currentIndexRef.current;

      console.log("⚡ typeNextChar:", {
        currentIndex,
        textLength: currentText?.length || 0,
        shouldStop,
        isTyping: isTypingRef.current,
      });

      if (
        !mountedRef.current ||
        shouldStop ||
        !currentText ||
        !isTypingRef.current
      ) {
        console.log("🛑 Stopping - conditions not met");
        return;
      }

      if (currentIndex >= currentText.length) {
        console.log("✅ Typing completed!");
        setIsCompleted(true);
        isTypingRef.current = false;
        onComplete?.();
        return;
      }

      const currentChar = currentText[currentIndex];
      console.log(`📝 Adding char ${currentIndex}: "${currentChar}"`);

      setDisplayedText((prev) => {
        // Đảm bảo không duplicate characters
        const expectedText = currentText.substring(0, currentIndex + 1);
        console.log(`Expected: "${expectedText}", Current: "${prev}"`);
        return expectedText;
      });

      currentIndexRef.current = currentIndex + 1;

      // Calculate delay
      let delay = typingSpeed;
      if (naturalPauses) {
        if (/[.!?]/.test(currentChar)) delay *= 4;
        else if (/[,;:]/.test(currentChar)) delay *= 2;
        else if (/[\n\r]/.test(currentChar)) delay *= 3;
        else if (/\s/.test(currentChar)) delay *= 0.7;
      }

      timerRef.current = setTimeout(typeNextChar, delay);
    }, []); // Empty deps để tránh re-creation

    // Start typing when conditions are right
    useEffect(() => {
      if (text && !isCompleted && !shouldStop && !isTypingRef.current) {
        console.log("🚀 Starting typewriter...");
        isTypingRef.current = true;

        const startTimer = setTimeout(() => {
          if (mountedRef.current && textRef.current && !shouldStop) {
            typeNextChar();
          }
        }, 100);

        return () => clearTimeout(startTimer);
      }
    }, [text, isCompleted, shouldStop, typeNextChar]);

    // Handle shouldStop
    useEffect(() => {
      if (shouldStop && !isCompleted && text && isTypingRef.current) {
        console.log("🛑 Force stopping");
        clearTimer();
        setDisplayedText(text);
        currentIndexRef.current = text.length;
        setIsCompleted(true);
        isTypingRef.current = false;
        onComplete?.();
      }
    }, [shouldStop, isCompleted, text, onComplete, clearTimer]);

    // Cleanup
    useEffect(() => {
      mountedRef.current = true;
      return () => {
        console.log("🧹 Cleanup");
        mountedRef.current = false;
        clearTimer();
        isTypingRef.current = false;
      };
    }, [clearTimer]);

    if (!text) {
      return <div className="text-red-500">No text provided</div>;
    }

    return (
      <div className={`character-typewriter ${className}`}>
        {/* Debug info - xóa khi production */}
        <div className="debug-info text-xs text-gray-400 mb-1 font-mono">
          {displayedText.length}/{text.length} | Idx:{currentIndexRef.current} |
          Done:{isCompleted.toString()} | Stop:{shouldStop.toString()} | Typing:
          {isTypingRef.current.toString()}
        </div>

        <MarkdownRenderer content={displayedText} />

        {showCursor && !isCompleted && !shouldStop && isTypingRef.current && (
          <span className="typewriter-cursor inline-block w-0.5 h-4 bg-blue-500 ml-1 animate-pulse" />
        )}
      </div>
    );
  }
);

CharacterTypewriter.displayName = "CharacterTypewriter";

export default CharacterTypewriter;
