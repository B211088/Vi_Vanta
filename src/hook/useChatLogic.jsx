import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { askChatBot, getAllAIModel } from "../services/chatbot.service";
import { useNotify } from "./useNotify";

export const useChatLogic = (collectionId) => {
  const { loading, section } = useSelector((state) => state.chatbot);
  const dispatch = useDispatch();
  const { notifySuccess, notifyWarning, notifyError } = useNotify();

  // Refs
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // States
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collectionId);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedAiModel, setSelectedAiModel] = useState();
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(1);
  const [maxToken, setMaxToken] = useState(4000);
  const [messages, setMessages] = useState([]);
  const [chunkLimit, setChunkLimit] = useState(5);
  const [conversationContext, setConversationContext] = useState(null);
  const [animatedMessageIds, setAnimatedMessageIds] = useState(new Set());
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2);
  // Utility functions
  const generateMessageId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  useEffect(() => {
    setSelectedCollectionId(collectionId);
  }, [collectionId]);
  console.log({ selectedCollectionId });
  // Fetch AI models
  useEffect(() => {
    const fetchModelAI = async () => {
      try {
        const response = await dispatch(getAllAIModel());

        if (response?.success && response.data.length > 0) {
          setModels(response.data);
          setSelectedAiModel(response.data[0]);
        } else {
          notifyError("Không có model nào");
        }
      } catch (error) {
        notifyError("Không thể lấy models");
      }
    };

    fetchModelAI();
  }, [dispatch, notifyError]);

  // Track latest assistant message
  useEffect(() => {
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant"
    );
    if (assistantMessages.length > 0) {
      const latestAssistant = assistantMessages[assistantMessages.length - 1];
      if (
        latestAssistant._id !== latestMessageId &&
        !latestAssistant.isLoading
      ) {
        setLatestMessageId(latestAssistant._id);
      }
    }
  }, [messages, latestMessageId]);

  // Load section messages
  useEffect(() => {
    if (section?.messages && messages.length === 0) {
      setMessages(section.messages);
      setAnimatedMessageIds(new Set());
    }
  }, [section, messages.length]);

  // API call function
  const callChatbotAPI = useCallback(
    async (question) => {
      try {
        const payload = {
          collectionId: selectedCollectionId,
          question,
          modelId: selectedAiModel._id,
          prompt: prompt,
          k: chunkLimit || 5,
          maxToken: maxToken,
          temperature: temperature,
          similarityThreshold: similarityThreshold, // THÊM DÒNG NÀY
        };

        const response = await dispatch(askChatBot(payload));

        if (response?.payload?.success || response?.data?.success) {
          const responseData = response.payload || response.data;
          const sectionData =
            responseData.section || responseData.data?.section;

          if (sectionData?.conversationContext) {
            setConversationContext(sectionData.conversationContext);
          }

          return {
            success: true,
            data: sectionData,
            messages: sectionData?.messages || [],
            context: sectionData?.context || null,
          };
        }

        if (response?.payload || response?.data) {
          const responseData = response.payload || response.data;
          const sectionData =
            responseData.section || responseData.data?.section;

          return {
            success: true,
            data: sectionData,
            messages: sectionData?.messages || [],
            context: sectionData?.context || null,
          };
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error("API call failed:", error);
        throw new Error(
          `API Error: ${error.message || error.status || "Unknown error"}`
        );
      }
    },
    [
      selectedCollectionId,
      selectedAiModel,
      prompt,
      chunkLimit,
      maxToken,
      temperature,
      similarityThreshold, // THÊM VÀO DEPENDENCY ARRAY
      dispatch,
    ]
  );

  // Submit question handler
  const handleSubmitQuestion = useCallback(
    async (question) => {
      if (!question.trim() || isSubmitting) return;

      const userMessage = {
        _id: generateMessageId(),
        role: "user",
        content: question.trim(),
        timestamp: new Date().toISOString(),
        __v: 0,
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setUserInput("");
      setIsSubmitting(true);

      const loadingMessageId = generateMessageId();

      try {
        const loadingMessage = {
          _id: loadingMessageId,
          role: "assistant",
          content: "Đang xử lý câu hỏi của bạn...",
          timestamp: new Date().toISOString(),
          isLoading: true,
          __v: 0,
        };

        setMessages((prevMessages) => [...prevMessages, loadingMessage]);

        const response = await callChatbotAPI(question);

        if (response.success) {
          if (response.messages && response.messages.length > 0) {
            const assistantMessages = response.messages.filter(
              (msg) => msg.role === "assistant"
            );
            const latestAssistantMessage =
              assistantMessages[assistantMessages.length - 1];

            if (latestAssistantMessage) {
              const finalMessageId =
                latestAssistantMessage._id || generateMessageId();

              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg._id === loadingMessageId
                    ? {
                        ...latestAssistantMessage,
                        _id: finalMessageId,
                        timestamp:
                          latestAssistantMessage.timestamp ||
                          new Date().toISOString(),
                      }
                    : msg
                )
              );

              setLatestMessageId(finalMessageId);
            }
          } else {
            let content = "";

            if (response.data?.content) {
              content = response.data.content;
            } else if (response.data?.response) {
              content = response.data.response;
            } else if (response.data?.message) {
              content = response.data.message;
            } else if (response.data?.answer) {
              content = response.data.answer;
            } else {
              console.log("Response data structure:", response.data);
              content =
                "Hệ thống đã xử lý câu hỏi nhưng không trả về nội dung phù hợp. Vui lòng thử lại.";
            }

            const finalMessageId = generateMessageId();
            const botMessage = {
              _id: finalMessageId,
              role: "assistant",
              content: content,
              timestamp: new Date().toISOString(),
              __v: 0,
            };

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg._id === loadingMessageId ? botMessage : msg
              )
            );

            setLatestMessageId(finalMessageId);
          }
        } else {
          throw new Error("API response indicates failure");
        }
      } catch (error) {
        console.error("Error sending message:", error);

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
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, generateMessageId, callChatbotAPI]
  );

  // Clear chat handler
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setConversationContext(null);
    setAnimatedMessageIds(new Set());
    setLatestMessageId(null);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Handle textarea resize
  const handleTextareaResize = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, []);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmitQuestion(userInput);
      }
    },
    [userInput, handleSubmitQuestion]
  );

  return {
    // States
    messages,
    models,
    selectedAiModel,
    setSelectedAiModel,
    userInput,
    setUserInput,
    isSubmitting,
    conversationContext,
    prompt,
    setPrompt,
    temperature,
    setTemperature,
    maxToken,
    setMaxToken,
    chunkLimit,
    setChunkLimit,
    similarityThreshold, // THÊM DÒNG NÀY
    setSimilarityThreshold, // THÊM DÒNG NÀY
    latestMessageId,
    animatedMessageIds,
    setAnimatedMessageIds,
    selectedCollectionId,
    setSelectedCollectionId,
    loading,

    // Refs
    containerRef,
    messagesEndRef,
    textareaRef,

    // Handlers
    handleSubmitQuestion,
    handleClearChat,
    handleKeyPress,
    handleTextareaResize,
    scrollToBottom,

    // Utilities
    generateMessageId,
  };
};
