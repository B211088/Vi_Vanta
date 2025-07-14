import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  askChatBot,
  getAllAIModel,
  getAllSectionsChat,
} from "../services/chatbot.service";
import { useNotify } from "./useNotify";

export const useChatLogic = (collectionId, currentSectionId) => {
  const { loading, section, collection } = useSelector(
    (state) => state.chatbot
  );
  const dispatch = useDispatch();
  const { notifyError, notifyWarning } = useNotify();

  // Refs
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);

  // States
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedAiModel, setSelectedAiModel] = useState();
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [conversationContext, setConversationContext] = useState(null);
  const [animatedMessageIds, setAnimatedMessageIds] = useState(new Set());
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [isNewMessage, setIsNewMessage] = useState(false);
  const [apiCallCount, setApiCallCount] = useState(0);

  // Extract collection settings với memoization
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

  // Utility functions
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Validation function
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

    return true;
  }, [collectionId, collectionSettings, selectedAiModel, notifyWarning]);

  // Load messages when section changes
  useEffect(() => {
    if (section?.messages) {
      console.log("Loading messages from section:", section._id);
      setMessages(section.messages);

      // Mark all existing assistant messages as animated
      const assistantMessageIds = section.messages
        .filter((msg) => msg.role === "assistant" && !msg.isLoading)
        .map((msg) => msg._id);

      setAnimatedMessageIds(new Set(assistantMessageIds));
      setIsNewMessage(false);

      // Set conversation context if available
      if (section.conversationContext) {
        setConversationContext(section.conversationContext);
      }

      // Scroll to bottom after loading
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else if (section === null && currentSectionId === null) {
      // Clear state for new conversation
      console.log("Clearing state for new conversation");
      setMessages([]);
      setAnimatedMessageIds(new Set());
      setLatestMessageId(null);
      setConversationContext(null);
      setIsNewMessage(false);
      setApiCallCount(0);
    }
  }, [section, currentSectionId]);

  // Fetch AI models with error handling
  useEffect(() => {
    const fetchModelAI = async () => {
      try {
        const response = await dispatch(getAllAIModel());

        if (response?.success && response.data?.length > 0) {
          setModels(response.data);
          // Set default model if none selected
          if (!selectedAiModel) {
            setSelectedAiModel(response.data[0]);
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
  }, [dispatch]);

  // Track latest assistant message for new messages only
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

  // Enhanced API call function
  const callChatbotAPI = useCallback(
    async (question) => {
      if (!validateChatRequest()) {
        throw new Error("Invalid chat request");
      }

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

        if (response?.success || response?.data?.success) {
          const responseData = response.data || response;
          return {
            success: true,
            data: responseData,
            messages: responseData.section?.messages || [],
            conversationContext:
              responseData.section?.conversationContext || null,
          };
        }

        throw new Error(response?.message || "API call failed");
      } catch (error) {
        console.error("Chatbot API Error:", error);
        throw new Error(
          error?.response?.data?.message ||
            error?.message ||
            "Lỗi kết nối đến server"
        );
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
    ]
  );

  // Enhanced submit question handler
  const handleSubmitQuestion = useCallback(
    async (question) => {
      if (!question?.trim() || isSubmitting) return;

      const trimmedQuestion = question.trim();
      setUserInput("");
      setIsSubmitting(true);
      setIsNewMessage(true);
      setApiCallCount((prev) => prev + 1);

      // Generate IDs for new messages
      const userMessageId = generateMessageId();
      const loadingMessageId = generateMessageId();

      // Create user message
      const userMessage = {
        _id: userMessageId,
        role: "user",
        content: trimmedQuestion,
        timestamp: new Date().toISOString(),
        __v: 0,
      };

      // Create loading message
      const loadingMessage = {
        _id: loadingMessageId,
        role: "assistant",
        content: "Loading...",
        timestamp: new Date().toISOString(),
        isLoading: true,
        __v: 0,
      };

      // Add messages to state
      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        loadingMessage,
      ]);

      try {
        const response = await callChatbotAPI(trimmedQuestion);

        if (response.success) {
          // Update messages from API response
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
      }
    },
    [
      isSubmitting,
      generateMessageId,
      callChatbotAPI,
      currentSectionId,
      dispatch,

      notifyError,
    ]
  );

  // Clear chat handler
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setConversationContext(null);
    setAnimatedMessageIds(new Set());
    setLatestMessageId(null);
    setIsNewMessage(false);
    setApiCallCount(0);
    lastMessageRef.current = null;

    // Clear input
    setUserInput("");

    // Focus textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Refresh sections with loading state
  const refreshSections = useCallback(async () => {
    try {
      await dispatch(getAllSectionsChat());
    } catch (error) {
      console.error("Error refreshing sections:", error);
      notifyError("Không thể làm mới danh sách cuộc hội thoại");
    }
  }, [dispatch, notifyError]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Effect to scroll when messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages.length, scrollToBottom]);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Textarea resize handler
  const handleTextareaResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  // Enhanced key press handler
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (userInput.trim() && !isSubmitting) {
          handleSubmitQuestion(userInput);
        }
      }
    },
    [userInput, isSubmitting, handleSubmitQuestion]
  );

  // Input change handler
  const handleInputChange = useCallback(
    (value) => {
      setUserInput(value);
      handleTextareaResize();
    },
    [handleTextareaResize]
  );

  // Computed values
  const hasMessages = messages.length > 0;
  const canSubmit =
    userInput.trim().length > 0 &&
    !isSubmitting &&
    collectionSettings?.isActive;
  const isCollectionReady =
    collectionSettings?.isActive && collectionSettings?.status;

  return {
    // Core States
    messages,
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
    isCollectionReady,

    // Computed Values
    hasMessages,
    canSubmit,
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
  };
};
