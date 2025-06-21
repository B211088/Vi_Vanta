import React, { useState, useEffect, useCallback, useRef } from "react";

const ScrollToBottom = ({ containerRef, messagesEndRef }) => {
  const [showButton, setShowButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const lastScrollTopRef = useRef(0);

  // Hàm scroll xuống bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      setIsScrolling(true);
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });

      // Ẩn button sau khi scroll
      setTimeout(() => {
        setIsScrolling(false);
        setShowButton(false);
      }, 500);
    }
  }, [messagesEndRef]);

  // Theo dõi scroll position để hiển thị/ẩn button
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Clear timeout cũ
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce scroll event
      scrollTimeoutRef.current = setTimeout(() => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const currentScrollTop = scrollTop;

        // Kiểm tra xem có đang scroll lên không
        const isScrollingUp = currentScrollTop < lastScrollTopRef.current;
        lastScrollTopRef.current = currentScrollTop;

        // Tính toán khoảng cách từ bottom (threshold 100px)
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const shouldShowButton =
          distanceFromBottom > 100 && isScrollingUp && !isScrolling;

        setShowButton(shouldShowButton);
      }, 100); // Debounce 100ms
    };

    // Sử dụng passive listener để tối ưu performance
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [containerRef, isScrolling]);

  // Auto-hide button sau 3 giây không hoạt động
  useEffect(() => {
    if (showButton && !isScrolling) {
      const hideTimeout = setTimeout(() => {
        setShowButton(false);
      }, 3000);

      return () => clearTimeout(hideTimeout);
    }
  }, [showButton, isScrolling]);

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToBottom}
      disabled={isScrolling}
      className={`
        fixed bottom-36 left-[48%] transform -translate-x-1/2 z-10
        w-[28px] h-[28px] bg-white border border-gray-300 rounded-full shadow-lg
        flex items-center justify-center
        hover:bg-gray-50 hover:shadow-xl
        transition-all duration-300 ease-in-out
        cursor-pointer
        ${
          isScrolling
            ? "opacity-50 cursor-not-allowed"
            : "opacity-90 hover:opacity-100"
        }
        ${showButton ? "scale-100" : "scale-0"}
      `}
      title="Scroll to bottom"
    >
      {isScrolling ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      ) : (
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      )}
    </button>
  );
};

export default ScrollToBottom;
