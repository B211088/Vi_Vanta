import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  askChatBot,
  getAllAIModel,
  getAllSectionsChat,
} from "../services/chatbot.service";
import { useNotify } from "./useNotify";

// Debounce utility
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Performance monitoring utility
const usePerformanceMonitor = () => {
  const metricsRef = useRef({
    apiCalls: 0,
    avgResponseTime: 0,
    totalResponseTime: 0,
  });

  const recordApiCall = useCallback((responseTime) => {
    metricsRef.current.apiCalls++;
    metricsRef.current.totalResponseTime += responseTime;
    metricsRef.current.avgResponseTime =
      metricsRef.current.totalResponseTime / metricsRef.current.apiCalls;
  }, []);

  const getMetrics = useCallback(() => metricsRef.current, []);

  return { recordApiCall, getMetrics };
};

// Enhanced chat logic hook
export const useChatLogic = (collectionId, currentSectionId) => {
  const { loading, section, collection } = useSelector(
    (state) => state.chatbot
  );
  const dispatch = useDispatch();
  const { notifyError, notifyWarning } = useNotify();
  const { recordApiCall } = usePerformanceMonitor();

  // Refs for performance
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const abortControllerRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Core states
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedAiModel, setSelectedAiModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationContext, setConversationContext] = useState(null);
  const [animatedMessageIds, setAnimatedMessageIds] = useState(new Set());
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);

  // Performance states
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [lastAPICallTime, setLastAPICallTime] = useState(null);

  // Debounced input for search optimization
  const debouncedUserInput = useDebounce(userInput, 300);

  // Memoized collection settings
  const collectionSettings = useMemo(() => {
    if (!collection) return null;

    return {
      prompt: collection.prompt || "",
      temperature: collection.temperature || 0.7,
      maxToken: collection.maxToken || 1000,
      chunkLimit: collection.chunkLimit || 5,
      similarityThreshold: collection.similarityThreshold || 0.2,
      isActive: collection.isActive || false,
      status: collection.status || false,
    };
  }, [collection]);

  // Optimized message ID generator
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Optimized scroll function with RAF
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }
    });
  }, []);

  // Enhanced validation with caching
  const validateChatRequest = useCallback(() => {
    if (!collectionId) {
      notifyWarning("Vui lòng chọn bộ dữ liệu!");
      return false;
    }

    if (!collectionSettings?.isActive || !collectionSettings?.status) {
      notifyWarning("Collection hiện không khả dụng!");
      return false;
    }

    if (!selectedAiModel?._id) {
      notifyWarning("Vui lòng chọn AI model!");
      return false;
    }

    // Rate limiting check
    if (lastAPICallTime && Date.now() - lastAPICallTime < 1000) {
      notifyWarning("Vui lòng đợi một chút trước khi gửi tin nhắn tiếp theo!");
      return false;
    }

    return true;
  }, [
    collectionId,
    collectionSettings,
    selectedAiModel,
    lastAPICallTime,
    notifyWarning,
  ]);

  // Optimized API call with abort controller
  const callChatbotAPI = useCallback(
    async (question) => {
      const startTime = Date.now();

      if (!validateChatRequest()) {
        throw new Error("Invalid chat request");
      }

      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const payload = {
        collectionId: collectionId,
        question: question.trim(),
        modelId: selectedAiModel._id,
        prompt: collectionSettings.prompt,
        k: collectionSettings.chunkLimit,
        maxToken: collectionSettings.maxToken,
        temperature: collectionSettings.temperature,
        similarityThreshold: collectionSettings.similarityThreshold,
        sectionId: currentSectionId || "",
        conversationContext: conversationContext || null,
      };

      console.log("API Payload:", payload);

      try {
        const response = await dispatch(askChatBot(payload));

        const responseTime = Date.now() - startTime;
        recordApiCall(responseTime);
        setLastAPICallTime(Date.now());

        if (response?.success || response?.data?.success) {
          const responseData = response.data || response;
          return {
            success: true,
            data: responseData,
            messages: responseData.section?.messages || [],
            conversationContext:
              responseData.section?.conversationContext || null,
            responseTime,
          };
        }

        throw new Error(response?.message || "API call failed");
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("API call was aborted");
          return null;
        }

        console.error("Chatbot API Error:", error);
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            "Lỗi kết nối đến server"
        );
      } finally {
        abortControllerRef.current = null;
      }
    },
    [
      validateChatRequest,
      collectionId,
      selectedAiModel,
      collectionSettings,
      currentSectionId,
      conversationContext,
      dispatch,
      recordApiCall,
    ]
  );

  // Enhanced submit with optimistic updates
  const handleSubmitQuestion = useCallback(
    async (question) => {
      if (!question?.trim() || isSubmittingRef.current) return;

      const trimmedQuestion = question.trim();
      setUserInput("");
      setIsSubmitting(true);
      isSubmittingRef.current = true;
      setIsNewMessage(true);
      setApiCallCount((prev) => prev + 1);

      // Generate IDs
      const userMessageId = generateMessageId();
      const loadingMessageId = generateMessageId();

      // Create optimistic messages
      const userMessage = {
        _id: userMessageId,
        role: "user",
        content: trimmedQuestion,
        timestamp: new Date().toISOString(),
        __v: 0,
      };

      const loadingMessage = {
        _id: loadingMessageId,
        role: "assistant",
        content: "Đang xử lý câu hỏi của bạn...",
        timestamp: new Date().toISOString(),
        isLoading: true,
        __v: 0,
      };

      // Optimistic update
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        loadingMessage,
      ]);

      // Auto-scroll immediately for better UX
      setTimeout(() => {
        scrollToBottom();
      }, 50);

      try {
        const response = await callChatbotAPI(trimmedQuestion);

        if (!response) {
          // Request was aborted
          setMessages((prev) =>
            prev.filter((msg) => msg._id !== loadingMessageId)
          );
          return;
        }

        if (response.success) {
          console.log(`API Response time: ${response.responseTime}ms`);

          // Update with real messages
          if (response.messages?.length > 0) {
            console.log("Updating messages from API response");
            setMessages(response.messages);

            // Update conversation context
            if (response.conversationContext) {
              setConversationContext(response.conversationContext);
            }

            // Set latest message ID for typewriter effect
            const assistantMessages = response.messages.filter(
              (msg) =>
                msg.role === "assistant" && !msg.isLoading && !msg.isError
            );

            if (assistantMessages.length > 0) {
              const latestAssistant =
                assistantMessages[assistantMessages.length - 1];
              console.log(
                "Setting latest message from API:",
                latestAssistant._id
              );
              setLatestMessageId(latestAssistant._id);
            }
          } else {
            // Fallback: create assistant message from response
            const content =
              response.data?.content ||
              response.data?.message ||
              response.data?.answer ||
              "Đã nhận được phản hồi nhưng không có nội dung.";

            const assistantMessageId = generateMessageId();
            const assistantMessage = {
              _id: assistantMessageId,
              role: "assistant",
              content: content,
              timestamp: new Date().toISOString(),
              __v: 0,
            };

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === loadingMessageId ? assistantMessage : msg
              )
            );

            setLatestMessageId(assistantMessageId);
          }

          // Refresh sections list for new conversations
          if (!currentSectionId) {
            setTimeout(() => {
              dispatch(getAllSectionsChat());
            }, 1000);
          }
        } else {
          throw new Error("API response indicates failure");
        }
      } catch (error) {
        console.error("Error in handleSubmitQuestion:", error);

        const errorMessageId = generateMessageId();
        const errorMessage = {
          _id: errorMessageId,
          role: "assistant",
          content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}. Vui lòng thử lại sau.`,
          timestamp: new Date().toISOString(),
          isError: true,
          __v: 0,
        };

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === loadingMessageId ? errorMessage : msg
          )
        );

        notifyError("Gửi tin nhắn thất bại");
      } finally {
        setIsSubmitting(false);
        isSubmittingRef.current = false;
      }
    },
    [
      generateMessageId,
      callChatbotAPI,
      currentSectionId,
      dispatch,
      notifyError,
      scrollToBottom,
    ]
  );

  // Optimized clear chat
  const handleClearChat = useCallback(() => {
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setMessages([]);
    setOptimisticMessages([]);
    setConversationContext(null);
    setAnimatedMessageIds(new Set());
    setLatestMessageId(null);
    setIsNewMessage(false);
    setApiCallCount(0);
    lastMessageRef.current = null;
    setUserInput("");

    // Focus textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Enhanced refresh sections
  const refreshSections = useCallback(async () => {
    try {
      await dispatch(getAllSectionsChat());
    } catch (error) {
      console.error("Error refreshing sections:", error);
    }
  }, [dispatch]);

  // Optimized textarea resize with RAF
  const handleTextareaResize = useCallback(() => {
    if (textareaRef.current) {
      requestAnimationFrame(() => {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      });
    }
  }, []);

  // Enhanced key press handler with shortcuts
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        if (e.shiftKey) {
          // Allow new line
          return;
        } else {
          e.preventDefault();
          if (userInput.trim() && !isSubmitting) {
            handleSubmitQuestion(userInput);
          }
        }
      } else if (e.key === "Escape") {
        // Clear input on escape
        setUserInput("");
      } else if (e.ctrlKey && e.key === "k") {
        // Clear chat shortcut
        e.preventDefault();
        handleClearChat();
      }
    },
    [userInput, isSubmitting, handleSubmitQuestion, handleClearChat]
  );

  // Optimized input change handler
  const handleInputChange = useCallback(
    (value) => {
      setUserInput(value);
      handleTextareaResize();
    },
    [handleTextareaResize]
  );

  // Optimized message loading with batch updates
  useEffect(() => {
    if (section?.messages) {
      console.log("Loading messages from section:", section._id);

      // Batch update for better performance
      requestAnimationFrame(() => {
        setMessages(section.messages);

        // Mark existing assistant messages as animated
        const assistantMessageIds = section.messages
          .filter((msg) => msg.role === "assistant" && !msg.isLoading)
          .map((msg) => msg._id);

        setAnimatedMessageIds(new Set(assistantMessageIds));
        setIsNewMessage(false);

        if (section.conversationContext) {
          setConversationContext(section.conversationContext);
        }
      });

      // Smooth scroll with delay
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else if (section === null && currentSectionId === null) {
      // Reset state efficiently
      console.log("Clearing state for new conversation");
      setMessages([]);
      setOptimisticMessages([]);
      setAnimatedMessageIds(new Set());
      setLatestMessageId(null);
      setConversationContext(null);
      setIsNewMessage(false);
      setApiCallCount(0);
    }
  }, [section, currentSectionId, scrollToBottom]);

  // Optimized model fetching with caching
  useEffect(() => {
    const fetchModelAI = async () => {
      try {
        const response = await dispatch(getAllAIModel());

        if (response?.success && response.data?.length > 0) {
          setModels(response.data);
          // Set default model intelligently
          if (!selectedAiModel) {
            const defaultModel =
              response.data.find((model) => model.isDefault) ||
              response.data[0];
            setSelectedAiModel(defaultModel);
          }
        } else {
          notifyError("Không có model AI nào khả dụng");
        }
      } catch (error) {
        console.error("Error fetching AI models:", error);
        notifyError("Không thể tải danh sách model AI");
      }
    };

    if (models.length === 0) {
      fetchModelAI();
    }
  }, []);

  // Enhanced latest message tracking
  useEffect(() => {
    if (!isNewMessage) return;

    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant" && !msg.isLoading && !msg.isError
    );

    if (assistantMessages.length > 0) {
      const latestAssistant = assistantMessages[assistantMessages.length - 1];

      if (latestAssistant._id !== latestMessageId) {
        console.log("Setting new latest message ID:", latestAssistant._id);
        setLatestMessageId(latestAssistant._id);
        lastMessageRef.current = latestAssistant;
      }
    }
  }, [messages, latestMessageId, isNewMessage]);

  // Enhanced scroll effect with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50); // Reduced delay for faster UX

    return () => clearTimeout(timer);
  }, [messages.length, scrollToBottom]);

  // Auto-focus effect
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Computed values with memoization
  const computedValues = useMemo(
    () => ({
      hasMessages: messages.length > 0,
      canSubmit:
        userInput.trim().length > 0 &&
        !isSubmitting &&
        collectionSettings?.isActive,
      isCollectionReady:
        collectionSettings?.isActive && collectionSettings?.status,
      messageCount: messages.length,
      lastUserMessage: messages.filter((m) => m.role === "user").pop(),
      lastAssistantMessage: messages
        .filter((m) => m.role === "assistant" && !m.isLoading)
        .pop(),
    }),
    [messages, userInput, isSubmitting, collectionSettings]
  );

  // Performance metrics
  const performanceMetrics = useMemo(
    () => ({
      totalMessages: messages.length,
      apiCallCount,
      averageResponseTime: lastAPICallTime ? Date.now() - lastAPICallTime : 0,
    }),
    [messages.length, apiCallCount, lastAPICallTime]
  );

  return {
    // Core States
    messages: messages.concat(optimisticMessages),
    models,
    selectedAiModel,
    setSelectedAiModel,
    userInput,
    setUserInput: handleInputChange,
    isSubmitting,
    conversationContext,
    latestMessageId,
    animatedMessageIds,
    setAnimatedMessageIds,
    loading,
    isNewMessage,

    // Collection Settings
    collectionSettings,
    ...computedValues,

    // Performance Metrics
    performanceMetrics,
    apiCallCount,

    // Refs
    containerRef,
    messagesEndRef,
    textareaRef,

    // Core Handlers
    handleSubmitQuestion,
    handleClearChat,
    handleKeyPress,
    handleTextareaResize,
    scrollToBottom,
    refreshSections,

    // Utilities
    generateMessageId,
    validateChatRequest,

    // Enhanced features
    debouncedUserInput,
    abortCurrentRequest: () => abortControllerRef.current?.abort(),
  };
};
