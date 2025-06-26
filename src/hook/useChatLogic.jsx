import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  askChatBot,
  getAllAIModel,
  getAllSectionsChat,
} from "../services/chatbot.service";
import { useNotify } from "./useNotify";
import { updateCollection } from "../services/collection.service";

export const useChatLogic = (collectionId, currentSectionId) => {
  const { loading, section } = useSelector((state) => state.chatbot);
  const dispatch = useDispatch();
  const { notifyError, notifySuccess, notifyWarning } = useNotify();

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
  const [maxToken, setMaxToken] = useState(1000);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [chunkLimit, setChunkLimit] = useState(5);
  const [conversationContext, setConversationContext] = useState(null);
  const [animatedMessageIds, setAnimatedMessageIds] = useState(new Set());
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2);

  // **THÊM: State để track khi nào là message mới (không phải từ section cũ)**
  const [isNewMessage, setIsNewMessage] = useState(false);

  // Utility functions
  const generateMessageId = useCallback(() => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }, []);

  // Update collection ID when prop changes
  useEffect(() => {
    setSelectedCollectionId(collectionId);
  }, [collectionId]);

  // **UPDATED: Load messages when section changes**
  useEffect(() => {
    if (section?.messages) {
      console.log("Loading messages from section:", section.messages);
      setMessages(section.messages);

      // **THAY ĐỔI: Không reset animatedMessageIds và latestMessageId khi load section cũ**
      // Thay vào đó, mark tất cả messages cũ là đã animated
      const allMessageIds = section.messages
        .filter((msg) => msg.role === "assistant")
        .map((msg) => msg._id);
      setAnimatedMessageIds(new Set(allMessageIds));

      // **KHÔNG set latestMessageId = null** để tránh trigger typewriter cho messages cũ
      setIsNewMessage(false);

      // Set conversation context if available
      if (section.conversationContext) {
        setConversationContext(section.conversationContext);
      }

      // Scroll to bottom after loading messages
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else if (section === null && currentSectionId === null) {
      // Clear messages when starting new conversation
      console.log("Clearing messages for new conversation");
      setMessages([]);
      setAnimatedMessageIds(new Set());
      setLatestMessageId(null);
      setConversationContext(null);
      setIsNewMessage(false);
    }
  }, [section, currentSectionId]);

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
      } catch {
        notifyError("Không thể lấy models");
      }
    };

    fetchModelAI();
  }, [dispatch, notifyError]);

  // **UPDATED: Track latest assistant message - chỉ cho messages mới**
  useEffect(() => {
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant" && !msg.isLoading
    );

    if (assistantMessages.length > 0 && isNewMessage) {
      const latestAssistant = assistantMessages[assistantMessages.length - 1];
      if (latestAssistant._id !== latestMessageId) {
        console.log("Setting new latest message ID:", latestAssistant._id);
        setLatestMessageId(latestAssistant._id);
      }
    }
  }, [messages, latestMessageId, isNewMessage]);

  // API call function
  const callChatbotAPI = useCallback(
    async (question) => {
      try {
        if (!selectedCollectionId || !collectionId) {
          notifyWarning("Vui lòng chọn bộ dữ liệu!");
          return;
        }
        const payload = {
          collectionId: selectedCollectionId,
          question,
          modelId: selectedAiModel._id,
          prompt: prompt,
          k: chunkLimit || 5,
          maxToken: maxToken,
          temperature: temperature,
          similarityThreshold: similarityThreshold,
          sectionId: currentSectionId || "",
        };

        console.log("Payload being sent:", payload);

        const response = await dispatch(askChatBot(payload));

        if (response?.success || response?.data?.success) {
          const responseData = response.data || response;
          const sectionData =
            responseData.section || responseData.data?.section;

          if (sectionData?.conversationContext) {
            setConversationContext(sectionData.conversationContext);
          }
          if (sectionData?.message) {
            setAnswer(response.data?.message);
          }

          return {
            success: true,
            data: sectionData,
            messages: sectionData?.messages || [],
            message: response.data.message,
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
      similarityThreshold,
      currentSectionId,
      dispatch,
    ]
  );

  // **UPDATED: Submit question handler - Mark là message mới**
  const handleSubmitQuestion = useCallback(
    async (question) => {
      if (!question.trim() || isSubmitting) return;

      setUserInput("");
      setIsSubmitting(true);

      // **QUAN TRỌNG: Đánh dấu đây là message mới**
      setIsNewMessage(true);

      // Tạo loading message trước
      const loadingMessageId = generateMessageId();
      const loadingMessage = {
        _id: loadingMessageId,
        role: "assistant",
        content: "Đang xử lý câu hỏi của bạn...",
        timestamp: new Date().toISOString(),
        isLoading: true,
        __v: 0,
      };

      // Thêm user message và loading message vào state
      const userMessage = {
        _id: generateMessageId(),
        role: "user",
        content: question.trim(),
        timestamp: new Date().toISOString(),
        __v: 0,
      };

      setMessages((prevMessages) => [
        ...prevMessages,
        userMessage,
        loadingMessage,
      ]);

      try {
        const response = await callChatbotAPI(question);

        if (response.success) {
          // Luôn luôn sử dụng messages từ API response để đảm bảo thứ tự đúng
          if (response.messages && response.messages.length > 0) {
            console.log("Updating messages from API response");
            setMessages(response.messages);

            // **UPDATED: Set latest message cho message mới**
            const assistantMessages = response.messages.filter(
              (msg) => msg.role === "assistant" && !msg.isLoading
            );
            const latestAssistant =
              assistantMessages[assistantMessages.length - 1];
            if (latestAssistant) {
              console.log(
                "Setting latest message from API response:",
                latestAssistant._id
              );
              setLatestMessageId(latestAssistant._id);
            }
          } else {
            // Fallback: nếu không có messages array, thay thế loading message
            let content = "";

            if (response.data?.content) {
              content = response.data.content;
            } else if (response.data?.response) {
              content = response.data.response;
            } else if (response.data?.message) {
              content = response.data.message;
            } else if (response.data?.answer) {
              content = response.data.answer;
            } else if (response.message?.content) {
              content = response.message.content;
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

          // Refresh sections list để cập nhật section mới (nếu tạo mới)
          if (!currentSectionId) {
            dispatch(getAllSectionsChat());
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
    [
      isSubmitting,
      generateMessageId,
      callChatbotAPI,
      currentSectionId,
      dispatch,
    ]
  );

  // Clear chat handler
  const handleClearChat = useCallback(() => {
    setMessages([]);
    setConversationContext(null);
    setAnimatedMessageIds(new Set());
    setLatestMessageId(null);
    setIsNewMessage(false); // **THÊM: Reset flag**
  }, []);

  // Refresh sections
  const refreshSections = useCallback(() => {
    dispatch(getAllSectionsChat());
  }, [dispatch]);

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
    similarityThreshold,
    setSimilarityThreshold,
    latestMessageId,
    animatedMessageIds,
    setAnimatedMessageIds,
    selectedCollectionId,
    setSelectedCollectionId,
    loading,
    isNewMessage, // **THÊM: Export flag**

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
    refreshSections,

    // Utilities
    generateMessageId,
  };
};
