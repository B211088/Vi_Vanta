// Enhanced Character-by-Character Typewriter with Speed Options
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { MarkdownRenderer } from "../../../utils/convertMarkdownToJSX";

const CharacterTypewriter = memo(
  ({
    text,
    speed = "normal", // 'slow', 'normal', 'fast', 'lightning' or number (ms)
    onComplete,
    shouldStop = false,
    messageId,
    className = "",
    showCursor = true,
    naturalPauses = true, // Pauses after punctuation
  }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const timerRef = useRef(null);
    const mountedRef = useRef(true);

    // Speed mapping
    const getSpeed = () => {
      if (typeof speed === "number") return speed;

      const speedMap = {
        lightning: 10, // Very fast - 10ms per character
        fast: 20, // Fast - 20ms per character
        normal: 30, // Normal - 30ms per character
        slow: 50, // Slow - 50ms per character
        "very-slow": 80, // Very slow - 80ms per character
      };

      return speedMap[speed] || 30;
    };

    const typingSpeed = getSpeed();

    // Reset when text changes
    useEffect(() => {
      if (!text) return;
      setDisplayedText("");
      setCurrentIndex(0);
      setIsCompleted(false);
    }, [text]);

    // Main typing function - character by character
    const typeNextChar = useCallback(() => {
      if (!mountedRef.current || shouldStop || isCompleted) {
        return;
      }

      if (currentIndex >= text.length) {
        setIsCompleted(true);
        onComplete?.();
        return;
      }

      const currentChar = text[currentIndex];
      setDisplayedText((prev) => prev + currentChar);
      setCurrentIndex((prev) => prev + 1);

      // Calculate delay for next character
      let delay = typingSpeed;

      if (naturalPauses) {
        // Natural pauses for better reading experience
        if (/[.!?]/.test(currentChar)) {
          delay *= 4; // Long pause after sentences
        } else if (/[,;:]/.test(currentChar)) {
          delay *= 2; // Medium pause after commas
        } else if (/[\n\r]/.test(currentChar)) {
          delay *= 3; // Pause for line breaks
        } else if (/\s/.test(currentChar)) {
          delay *= 0.7; // Slightly faster for spaces
        }
      }

      // Continue typing
      timerRef.current = setTimeout(() => {
        requestAnimationFrame(typeNextChar);
      }, delay);
    }, [
      text,
      currentIndex,
      typingSpeed,
      naturalPauses,
      onComplete,
      shouldStop,
      isCompleted,
    ]);

    // Start typing effect
    useEffect(() => {
      if (text && !isCompleted && !shouldStop) {
        const initialDelay = setTimeout(() => {
          typeNextChar();
        }, 150); // Small initial delay
        return () => clearTimeout(initialDelay);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, [text, typeNextChar, isCompleted, shouldStop]);

    // Cleanup
    useEffect(() => {
      return () => {
        mountedRef.current = false;
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    // Handle stop command
    useEffect(() => {
      if (shouldStop && !isCompleted && text) {
        setDisplayedText(text);
        setCurrentIndex(text.length);
        setIsCompleted(true);
        onComplete?.();
      }
    }, [shouldStop, text, isCompleted, onComplete]);

    // Progress percentage for debugging
    const progress = text ? (currentIndex / text.length) * 100 : 0;

    return (
      <div className={`character-typewriter ${className}`}>
        <MarkdownRenderer content={displayedText} />
        {showCursor && !isCompleted && !shouldStop && (
          <span className="typewriter-cursor inline-block w-0.5 h-4 bg-gray-500 ml-1 animate-pulse" />
        )}

        {/* Optional progress indicator for debugging */}
      </div>
    );
  }
);

// Usage example component
const TypewriterDemo = () => {
  const [speed, setSpeed] = useState("normal");
  const [text, setText] = useState(
    "Xin chào! Tôi là AI assistant. Tôi có thể giúp bạn trả lời câu hỏi, viết code, và nhiều việc khác. Hãy hỏi tôi bất cứ điều gì bạn muốn biết!"
  );

  return (
    <div className="p-6 max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Character Typewriter Demo</h3>

      {/* Speed Controls */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Tốc độ:</label>
        <select
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
          className="border rounded px-3 py-1"
        >
          <option value="lightning">⚡ Lightning (10ms)</option>
          <option value="fast">🏃 Fast (20ms)</option>
          <option value="normal">🚶 Normal (30ms)</option>
          <option value="slow">🐌 Slow (50ms)</option>
          <option value="very-slow">🐢 Very Slow (80ms)</option>
        </select>
      </div>

      {/* Text Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Text:</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded px-3 py-2 h-20"
          placeholder="Nhập text để test typewriter effect..."
        />
      </div>

      {/* Typewriter Output */}
      <div className="border rounded p-4 bg-gray-50 min-h-[100px]">
        <CharacterTypewriter
          key={`${speed}-${text}`} // Force re-render when speed or text changes
          text={text}
          speed={speed}
          naturalPauses={true}
          onComplete={() => console.log("Typing completed!")}
        />
      </div>
    </div>
  );
};

export { CharacterTypewriter, TypewriterDemo };
export default CharacterTypewriter;
