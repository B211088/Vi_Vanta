import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Text processing utilities
export const TextProcessor = {
  // Split text into words while preserving formatting
  splitIntoWords: (text) => {
    if (!text) return [];

    // Split by spaces but preserve punctuation and line breaks
    return text.split(/(\s+|\n)/).filter((part) => part.length > 0);
  },

  // Split text into sentences for better pacing
  splitIntoSentences: (text) => {
    if (!text) return [];

    return text.split(/([.!?]+\s*)/).filter((part) => part.trim().length > 0);
  },

  // Estimate reading time for adaptive speed
  estimateReadingTime: (text) => {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.split(/\s+/).length;
    return (wordCount / wordsPerMinute) * 60 * 1000; // in milliseconds
  },

  // Clean text for better display
  cleanText: (text) => {
    return text
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .replace(/\n\s*\n/g, "\n\n") // Multiple newlines to double newline
      .trim();
  },

  // Check if text contains code blocks
  hasCodeBlocks: (text) => {
    return /```[\s\S]*?```|`[^`]+`/.test(text);
  },

  // Extract code blocks for special handling
  extractCodeBlocks: (text) => {
    const codeBlocks = [];
    const regex = /```([\s\S]*?)```|`([^`]+)`/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      codeBlocks.push({
        content: match[1] || match[2],
        start: match.index,
        end: regex.lastIndex,
        isBlock: !!match[1],
      });
    }

    return codeBlocks;
  },
};

// Advanced typewriter hook with multiple modes
export const useAdvancedTypewriter = ({
  text,
  mode = "word", // 'word', 'sentence', 'character', 'smart'
  baseSpeed = 50,
  onComplete,
  shouldStop = false,
  pauseOnPunctuation = true,
  highlightCurrentWord = false,
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(-1);

  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  // Process text based on mode
  const processedText = useMemo(() => {
    switch (mode) {
      case "word":
        return TextProcessor.splitIntoWords(text);
      case "sentence":
        return TextProcessor.splitIntoSentences(text);
      case "character":
        return text.split("");
      case "smart":
        // Automatically choose best mode
        if (TextProcessor.hasCodeBlocks(text)) return text.split("");
        if (text.length > 200) return TextProcessor.splitIntoWords(text);
        return text.split("");
      default:
        return TextProcessor.splitIntoWords(text);
    }
  }, [text, mode]);

  // Calculate adaptive speed
  const adaptiveSpeed = useMemo(() => {
    const textLength = processedText.length;
    const hasCode = TextProcessor.hasCodeBlocks(text);

    let speed = baseSpeed;

    // Slower for code
    if (hasCode) speed *= 1.5;

    // Faster for long text
    if (textLength > 100) speed *= 0.8;
    if (textLength > 300) speed *= 0.6;

    // Device performance adjustment
    if (navigator.hardwareConcurrency < 4) speed *= 1.2;

    return Math.max(speed, 10);
  }, [processedText.length, text, baseSpeed]);

  // Reset when text changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsPaused(false);
    setCurrentHighlight(-1);
  }, [text]);

  // Main typing function
  const typeNext = useCallback(() => {
    if (!mountedRef.current || isCompleted || shouldStop || isPaused) {
      return;
    }

    if (currentIndex >= processedText.length) {
      setIsCompleted(true);
      setCurrentHighlight(-1);
      onComplete?.();
      return;
    }

    const currentPart = processedText[currentIndex];

    // Update displayed text
    setDisplayedText((prev) => prev + currentPart);

    // Update highlight if enabled
    if (highlightCurrentWord && mode === "word") {
      setCurrentHighlight(currentIndex);
    }

    setCurrentIndex((prev) => prev + 1);

    // Calculate pause duration
    let pauseDuration = adaptiveSpeed;

    if (pauseOnPunctuation && /[.!?]$/.test(currentPart.trim())) {
      pauseDuration *= 3; // Longer pause after sentences
    } else if (/[,;:]$/.test(currentPart.trim())) {
      pauseDuration *= 1.5; // Medium pause after commas
    }

    // Schedule next character/word
    timerRef.current = setTimeout(() => {
      requestAnimationFrame(typeNext);
    }, pauseDuration);
  }, [
    processedText,
    currentIndex,
    adaptiveSpeed,
    pauseOnPunctuation,
    highlightCurrentWord,
    mode,
    onComplete,
    isCompleted,
    shouldStop,
    isPaused,
  ]);

  // Start typing
  useEffect(() => {
    if (processedText.length > 0 && !isCompleted && !shouldStop) {
      const initialDelay = setTimeout(() => {
        typeNext();
      }, 100);

      return () => clearTimeout(initialDelay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [processedText, typeNext, isCompleted, shouldStop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Handle stop command
  useEffect(() => {
    if (shouldStop && !isCompleted) {
      setDisplayedText(text);
      setCurrentIndex(processedText.length);
      setIsCompleted(true);
      setCurrentHighlight(-1);
      onComplete?.();
    }
  }, [shouldStop, text, processedText.length, isCompleted, onComplete]);

  // Control functions
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);
  const reset = useCallback(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    setIsCompleted(false);
    setIsPaused(false);
    setCurrentHighlight(-1);
  }, []);

  return {
    displayedText,
    isCompleted,
    isPaused,
    currentIndex,
    totalLength: processedText.length,
    progress:
      processedText.length > 0
        ? (currentIndex / processedText.length) * 100
        : 0,
    currentHighlight,
    controls: {
      pause,
      resume,
      reset,
    },
  };
};

// Smart typewriter hook that automatically optimizes
export const useSmartTypewriter = ({
  text,
  onComplete,
  shouldStop = false,
  userPreferences = {},
}) => {
  const [optimalSettings, setOptimalSettings] = useState(null);

  // Analyze text and determine optimal settings
  useEffect(() => {
    if (!text) return;

    const analysis = {
      length: text.length,
      wordCount: text.split(/\s+/).length,
      hasCode: TextProcessor.hasCodeBlocks(text),
      complexity: text.split(/[.!?]+/).length, // Sentence count
      readingTime: TextProcessor.estimateReadingTime(text),
    };

    // Determine optimal mode
    let mode = "word";
    let speed = 50;

    if (analysis.hasCode) {
      mode = "character";
      speed = 30;
    } else if (analysis.length < 50) {
      mode = "character";
      speed = 40;
    } else if (analysis.wordCount < 20) {
      mode = "word";
      speed = 60;
    } else {
      mode = "word";
      speed = Math.max(20, 80 - analysis.complexity * 5);
    }

    // Apply user preferences
    if (userPreferences.preferFastTyping) speed *= 0.7;
    if (userPreferences.preferSlowTyping) speed *= 1.5;
    if (userPreferences.forceWordMode) mode = "word";
    if (userPreferences.forceCharacterMode) mode = "character";

    setOptimalSettings({
      mode,
      baseSpeed: speed,
      pauseOnPunctuation: !analysis.hasCode,
      highlightCurrentWord: mode === "word" && analysis.wordCount < 50,
    });
  }, [text, userPreferences]);

  return useAdvancedTypewriter({
    text,
    mode: optimalSettings?.mode || "word",
    baseSpeed: optimalSettings?.baseSpeed || 50,
    onComplete,
    shouldStop,
    pauseOnPunctuation: optimalSettings?.pauseOnPunctuation ?? true,
    highlightCurrentWord: optimalSettings?.highlightCurrentWord ?? false,
  });
};

// Performance monitoring for typewriter
export const useTypewriterPerformance = () => {
  const [metrics, setMetrics] = useState({
    averageSpeed: 0,
    totalCharacters: 0,
    totalTime: 0,
    efficiency: 100,
  });

  const startTimeRef = useRef(null);
  const characterCountRef = useRef(0);

  const startTracking = useCallback((textLength) => {
    startTimeRef.current = performance.now();
    characterCountRef.current = textLength;
  }, []);

  const endTracking = useCallback(() => {
    if (!startTimeRef.current) return;

    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    const characters = characterCountRef.current;

    setMetrics((prev) => {
      const newTotalTime = prev.totalTime + duration;
      const newTotalCharacters = prev.totalCharacters + characters;
      const newAverageSpeed = newTotalCharacters / (newTotalTime / 1000); // chars per second

      return {
        averageSpeed: newAverageSpeed,
        totalCharacters: newTotalCharacters,
        totalTime: newTotalTime,
        efficiency: Math.min(100, (newAverageSpeed / 20) * 100), // Assuming 20 chars/sec is optimal
      };
    });

    startTimeRef.current = null;
    characterCountRef.current = 0;
  }, []);

  return {
    metrics,
    startTracking,
    endTracking,
  };
};

// Modern ChatGPT-style typewriter component
export const ChatGPTTypewriter = ({
  text,
  speed = 30,
  onComplete,
  shouldStop = false,
  className = "",
}) => {
  const { displayedText, isCompleted, progress, controls } = useSmartTypewriter(
    {
      text,
      onComplete,
      shouldStop,
      userPreferences: {
        preferFastTyping: true, // ChatGPT is relatively fast
      },
    }
  );

  const { startTracking, endTracking } = useTypewriterPerformance();

  // Track performance
  useEffect(() => {
    if (text && !isCompleted) {
      startTracking(text.length);
    } else if (isCompleted) {
      endTracking();
    }
  }, [text, isCompleted, startTracking, endTracking]);

  return (
    <div className={`chatgpt-typewriter ${className}`}>
      <div className="content">
        {displayedText}
        {!isCompleted && !shouldStop && <span className="cursor-blink">|</span>}
      </div>

      {/* Progress indicator (optional) */}
      {!isCompleted && (
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      )}
    </div>
  );
};

// Claude-style typewriter (word-by-word with smooth transitions)
export const ClaudeTypewriter = ({
  text,
  onComplete,
  shouldStop = false,
  className = "",
}) => {
  const words = useMemo(() => TextProcessor.splitIntoWords(text), [text]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  const timerRef = useRef(null);

  // Reset on text change
  useEffect(() => {
    setDisplayedText("");
    setCurrentWordIndex(0);
    setIsCompleted(false);
  }, [text]);

  // Word-by-word animation
  useEffect(() => {
    if (shouldStop || isCompleted || currentWordIndex >= words.length) {
      if (currentWordIndex >= words.length && !isCompleted) {
        setIsCompleted(true);
        onComplete?.();
      }
      return;
    }

    const delay = words[currentWordIndex]?.includes("\n") ? 200 : 80;

    timerRef.current = setTimeout(() => {
      setDisplayedText((prev) => prev + words[currentWordIndex]);
      setCurrentWordIndex((prev) => prev + 1);
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentWordIndex, words, shouldStop, isCompleted, onComplete]);

  // Handle stop
  useEffect(() => {
    if (shouldStop && !isCompleted) {
      setDisplayedText(text);
      setIsCompleted(true);
      onComplete?.();
    }
  }, [shouldStop, text, isCompleted, onComplete]);

  return (
    <div className={`claude-typewriter ${className}`}>
      {displayedText}
      {!isCompleted && !shouldStop && (
        <span className="claude-cursor animate-pulse">▌</span>
      )}
    </div>
  );
};

// Export utilities
export default {
  TextProcessor,
  useAdvancedTypewriter,
  useSmartTypewriter,
  useTypewriterPerformance,
  ChatGPTTypewriter,
  ClaudeTypewriter,
};
