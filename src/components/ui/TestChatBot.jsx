import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { MarkdownRenderer } from "../../utils/convertMarkdownToJSX";
import { askChatBot, getAllAIModel } from "../../services/chatbot.service";
import { useNotify } from "../../hook/useNotify";

const TestChatBot = () => {
  const { loading, section } = useSelector((state) => state.chatbot);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { notifySuccess, notifyWarning, notifyError } = useNotify();
  const collectionId = searchParams.get("id");
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collectionId);
  const [userInput, setUserInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [models, setModels] = useState([]);
  const [selectedAiModel, setSelectedAiModel] = useState();
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(1);
  const [maxToken, setMaxToken] = useState(4000);
  const [messages, setMessages] = useState([]);
  const [chunkLimit, setChunkLimit] = useState(5);
  const [conversationContext, setConversationContext] = useState(null);

  // FIX: Sử dụng Set để track những tin nhắn đã được animate
  const [animatedMessageIds, setAnimatedMessageIds] = useState(new Set());
  const [latestMessageId, setLatestMessageId] = useState(null);
  const [showButtonScrollBottom, setShowButtonScrollBottom] = useState(false);

  // Tự động scroll xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  console.log({ showButtonScrollBottom });

  useEffect(() => {
    const fetchModelAI = async () => {
      try {
        const response = await dispatch(getAllAIModel());
        console.log("Get model response:", response);

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
  }, []);

  // FIX: Cải thiện logic xác định tin nhắn mới nhất
  useEffect(() => {
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant"
    );
    if (assistantMessages.length > 0) {
      const latestAssistant = assistantMessages[assistantMessages.length - 1];
      // Chỉ cập nhật nếu thực sự có tin nhắn mới
      if (
        latestAssistant._id !== latestMessageId &&
        !latestAssistant.isLoading
      ) {
        setLatestMessageId(latestAssistant._id);
      }
    }
  }, [messages, latestMessageId]);

  // Chỉ set lại messages khi clear chat hoặc load lại trang
  useEffect(() => {
    if (section?.messages && messages.length === 0) {
      setMessages(section.messages);
      setAnimatedMessageIds(new Set()); // reset luôn trạng thái đã animate
    }
  }, [section]);

  // Reset textarea height
  const handleChange = (e) => {
    setUserInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const generateMessageId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const callChatbotAPI = async (question) => {
    try {
      const payload = {
        collectionId: selectedCollectionId,
        question,
        modelId: selectedAiModel._id,
        prompt: prompt,
        k: chunkLimit || 5,
        maxToken: maxToken,
        temperature: temperature,
      };

      const response = await dispatch(askChatBot(payload));

      if (response?.payload?.success || response?.data?.success) {
        const responseData = response.payload || response.data;
        const sectionData = responseData.section || responseData.data?.section;

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
        const sectionData = responseData.section || responseData.data?.section;

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
  };

  const handleSubmitQuestion = async (question) => {
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

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

            // FIX: Đánh dấu tin nhắn mới sẽ được animate
            setLatestMessageId(finalMessageId);
          }
        } else {
          let content = "";

          if (response.data?.content) {
            content = response.data.content;
          } else if (response.data?.message) {
            content = response.data.message;
          } else if (response.data?.answer) {
            content = response.data.answer;
          } else if (response.data?.response) {
            content = response.data.response;
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
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitQuestion(userInput);
    } else {
      return;
    }
  };

  const handleSendClick = () => {
    handleSubmitQuestion(userInput);
  };

  const handleClearChat = () => {
    setMessages([]);
    setConversationContext(null);
    setAnimatedMessageIds(new Set());
    setLatestMessageId(null);
  };

  const TypewriterText = ({ text, speed = 5, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (currentIndex < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex]);
          setCurrentIndex(currentIndex + 1);
        }, speed);

        return () => clearTimeout(timer);
      } else if (onComplete) {
        onComplete();
      }
    }, [currentIndex, text.length, speed, onComplete]);

    useEffect(() => {
      setDisplayedText("");
      setCurrentIndex(0);
    }, []);

    return (
      <div>
        <MarkdownRenderer content={displayedText} />
        {currentIndex < text.length && (
          <span className="animate-pulse text-gray-400">|</span>
        )}
      </div>
    );
  };

  const AssistantMessage = ({ message, isLatest }) => {
    const [showTypewriter, setShowTypewriter] = useState(false);
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    const hasBeenAnimated = animatedMessageIds.has(message._id);
    const shouldAnimate =
      isLatest && !hasBeenAnimated && !message.isLoading && !message.isError;

    useEffect(() => {
      if (shouldAnimate && message.content) {
        const timer = setTimeout(() => {
          setShowTypewriter(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [shouldAnimate, message.content]);

    const handleTypewriterComplete = () => {
      setIsTypingComplete(true);
      setAnimatedMessageIds((prev) => new Set([...prev, message._id]));

      // Scroll xuống khi animation xong
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    };

    if (message.isLoading) {
      return (
        <div className="bg-gray-100 animate-pulse text-sm">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>{message.content}</span>
          </div>
        </div>
      );
    }

    if (message.isError) {
      return (
        <div className="bg-red-50 border border-red-200">
          <MarkdownRenderer content={message.content} />
        </div>
      );
    }

    return (
      <div className="p-[10px]">
        <div className="text-sm">
          {shouldAnimate && showTypewriter && !isTypingComplete ? (
            <TypewriterText
              text={message.content}
              speed={5}
              onComplete={handleTypewriterComplete}
            />
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ height: "calc(100vh - 95px)" }}
      className="w-full min-h-full flex gap-[5px] rounded-md overflow-hidden"
    >
      <div className="flex-1 h-full flex flex-col items-center p-[30px] bg-[#94c0d11d] relative">
        <div
          ref={containerRef}
          className="w-full h-full max-h-full overflow-y-auto sidebar-scroll-none flex flex-col gap-[30px] rounded-md"
        >
          {messages?.map((message) =>
            message.role === "user" ? (
              <div key={message._id} className="w-full flex justify-end">
                <div className="w-fit max-w-[80%] flex justify-end p-[10px] text-justify bg-[#44444414] rounded-md">
                  <span className="text-sm">{message.content}</span>
                </div>
              </div>
            ) : message.role === "assistant" ? (
              <div
                key={message._id}
                className="w-full flex justify-start textsm"
              >
                <div className="w-fit max-w-[80%] p-[10px] text-justify rounded-md">
                  <AssistantMessage
                    message={message}
                    isLatest={message._id === latestMessageId}
                  />
                </div>
              </div>
            ) : (
              <div key={message._id}></div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="w-full shadow-sm rounded-md p-[10px] mt-[20px] bg-light-50 relative">
          {showButtonScrollBottom && (
            <div
              onClick={scrollToBottom}
              className="absolute top-[-20%] left-[50%] w-[28px] h-[28px] flex justify-center items-center border-1 rounded-full bg-[#1f1f1f43] border-dark-700 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-down"></i>
            </div>
          )}
          <div className="w-full">
            <textarea
              ref={textareaRef}
              className="w-full min-h-[40px] max-h-[360px] overflow-y-auto text-sm outline-none overflow-hidden resize-none"
              placeholder="Hãy nhập câu hỏi của bạn!"
              value={userInput}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={isSubmitting}
            />
          </div>
          <div className="w-full flex justify-between items-center">
            <button
              onClick={handleClearChat}
              disabled={isSubmitting || messages.length === 0}
              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Xóa chat
            </button>
            <div className="flex items-center gap-[10px]">
              <select
                className="outline-none text-sm border-1 border-dark-800 p-[5px] rounded-md"
                value={selectedAiModel?._id || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedModel = models.find(
                    (model) => model._id === selectedId
                  );
                  setSelectedAiModel(selectedModel);
                }}
              >
                {models?.map((model) => (
                  <option key={model._id} value={model._id}>
                    {model.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSendClick}
                disabled={isSubmitting || !userInput.trim()}
                className={`aspect-square w-[30px] h-[30px] rounded-full flex items-center justify-center text-light-50 cursor-pointer transition-all ${
                  isSubmitting || !userInput.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <i className="fa-solid fa-arrow-up"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-3/12 h-full items-center p-[10px]">
        <div className="w-full h-full flex flex-col gap-[20px] border-[1px] border-dark-800 rounded-md p-4">
          <div className="text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Thông tin phiên chat</h3>
            <p>Collection ID: {collectionId || "Không có"}</p>
            <p>Số tin nhắn: {messages.length}</p>
            <p>
              Model AI: {selectedAiModel ? selectedAiModel?.name : "Chưa chọn"}
            </p>
            <p>Trạng thái: {loading ? "Đang tải..." : "Sẵn sàng"}</p>

            {conversationContext && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1">Context:</h4>
                <p className="text-xs">{conversationContext.summary}</p>

                {conversationContext.keyPoints && (
                  <div className="mt-2">
                    <h5 className="font-semibold text-xs">Điểm chính:</h5>
                    <ul className="text-xs list-disc list-inside">
                      {conversationContext.keyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {section?.context?.relevantChunks && (
              <div className="mt-4">
                <h4 className="font-semibold mb-1">Tài liệu liên quan:</h4>
                <p className="text-xs">
                  {section.context.relevantChunks.length} đoạn văn bản
                </p>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col">
            <h1 className="font-bold text-sm pb-[5px]">Ngữ cảnh</h1>
            <div className="w-full border-[1px] border-dark-800 rounded-md p-[10px] text-sm">
              <textarea
                className="w-full min-h-[300px] max-h-[360px] overflow-y-auto text-sm outline-none overflow-hidden resize-none"
                placeholder="Thêm prompt để AI trả lời chính xác hơn"
                disabled={isSubmitting}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestChatBot;
