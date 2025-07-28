import React, { useState, useRef, useEffect } from "react";
import {
  cleanTextForSpeech,
  splitTextIntoChunks,
} from "../../../utils/cleanTextForSpeech";
import { useDispatch } from "react-redux";
import { askChatBot } from "../../../services/chatbot.service";
import { convertMarkdownToJSX } from "../../../utils/convertMarkdownToJSX";

// Icon components (since we can't import lucide-react)
const MessageCircle = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const X = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const Mic = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const MicOff = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.77-1.77" />
    <path d="M17 4.5V5a3 3 0 0 1-2.12 2.88" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const VolumeX = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="11 5,6 9,2 9,2 15,6 15,11 19" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
);

const Send = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22,2 15,22 11,13 2,9" />
  </svg>
);

const Settings = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 10v6m11-7h-6m-10 0H1m15.5-6.5L19 7.5m-14 14L7.5 19m0-14L5 7.5m14 14L16.5 19" />
  </svg>
);

const VoiceChatbot = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Zalo TTS settings
  const [zaloVoice, setZaloVoice] = useState("female_south");
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedFallbackVoice, setSelectedFallbackVoice] = useState(null);

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  const APIKEY_ZALO = "QRzyNkvKdIQm4KM3b6dynIBHglnLF6pZ";

  // Zalo voice options
  const zaloVoiceOptions = [
    { value: "female_south", label: "Nữ miền Nam" },
    { value: "male_south", label: "Nam miền Nam" },
    { value: "female_north", label: "Nữ miền Bắc" },
    { value: "male_north", label: "Nam miền Bắc" },
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "vi-VN";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Load fallback voices for backup
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      // Find best Vietnamese voice as fallback
      const vietnameseVoice = voices.find(
        (voice) =>
          voice.lang?.includes("vi") ||
          voice.name.toLowerCase().includes("vietnamese") ||
          voice.name.toLowerCase().includes("linh")
      );

      setSelectedFallbackVoice(vietnameseVoice || voices[0]);
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Zalo Text-to-Speech
  async function textToSpeechZalo(text, speakerId = 1, speed = 1.0) {
    try {
      const params = new URLSearchParams();
      params.append("input", text);
      params.append("speaker_id", speakerId); // Ví dụ: 1 - Nữ miền Nam
      params.append("speed", speed); // Tốc độ đọc: từ 0.8 đến 1.2
      params.append("encode_type", 1); // 1 = MP3

      const response = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
        method: "POST",
        headers: {
          apikey: APIKEY_ZALO,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      const data = await response.json();

      if (data.error_code !== 0) {
        console.error("Zalo TTS API error:", data.error_message);
        throw new Error(data.error_message);
      }

      const audioUrl = data.data.url;
      return audioUrl;
    } catch (error) {
      console.error("TTS request failed:", error);
      throw error;
    }
  }

  // Fallback Web Speech TTS
  const fallbackTextToSpeech = (text) => {
    return new Promise((resolve, reject) => {
      if (!selectedFallbackVoice) {
        reject(new Error("No fallback voice available"));
        return;
      }

      window.speechSynthesis.cancel();
      const cleanedText = cleanTextForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);

      utterance.voice = selectedFallbackVoice;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      window.speechSynthesis.speak(utterance);
    });
  };

  // Main speak function
  const speakText = async (text) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    const cleanedText = cleanTextForSpeech(text);

    try {
      if (!useFallbackTTS) {
        try {
          const audioUrl = await textToSpeechZalo(cleanedText);
          await playAudio(audioUrl);
        } catch (zaloError) {
          console.log("Zalo TTS failed, fallback to Web Speech API");
          await fallbackTextToSpeech(cleanedText);
        }
      } else {
        await fallbackTextToSpeech(cleanedText);
      }
    } catch (error) {
      console.error("All TTS methods failed:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Play audio from URL
  const playAudio = (audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => resolve();
      audio.onerror = (error) => reject(error);

      audio.play().catch(reject);
    });
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle sending message
  const handleSendMessage = async (text = inputText) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: text.trim(), sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await dispatch(
        askChatBot({
          collectionId: "685c69b3e22c9f7ae915310e",
          conversationContext: null,
          k: 5,
          maxToken: 2000,
          modelId: "68551d30f366945ce68b7e09",
          prompt:
            "Bạn là một bác sĩ tư vấn sức khỏe chuyên nghiệp, có kiến thức chuyên môn sâu rộng trong các lĩnh vực nội khoa, nhi khoa, sản khoa, dinh dưỡng và y học tổng quát. Hãy trả lời câu hỏi của người dùng một cách rõ ràng, chính xác, dễ hiểu và mang tính nhân văn.\n\nNguyên tắc tư vấn:\n- Luôn lắng nghe kỹ triệu chứng người dùng mô tả.\n- Nếu triệu chứng không rõ, hãy gợi ý thêm các câu hỏi làm rõ.\n- Tư vấn dựa trên kiến thức y khoa, đưa ra khả năng cao nhất và các bước cần làm tiếp theo.\n- Cảnh báo người dùng đi khám nếu có dấu hiệu nguy hiểm.\n- Không chẩn đoán hay kê đơn thuốc cụ thể nếu không có đầy đủ thông tin.\n\n\nTrả lời với giọng điệu chuyên nghiệp, thân thiện, và dễ hiểu với người không chuyên.\n\n",
          question: text,
          similarityThreshold: 0.2,
          temperature: 0.3,
        })
      );

      // Auto-speak the response
      if (response.success && response.data.answer) {
        const botMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: convertMarkdownToJSX(response.data.answer.content),
          timestamp: response.data.answer.timestamp,
        };

        setMessages((prev) => [...prev, botMessage]);

        // Tự động phát âm câu trả lời
        speakText(response.data.answer.content);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <MessageCircle />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl w-80 h-96 flex flex-col border border-gray-200">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">Voice Chatbot</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="hover:bg-blue-600 p-1 rounded"
              >
                <Settings />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-600 p-1 rounded"
              >
                <X />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 p-3 border-b">
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">
                  Giọng nói Zalo:
                </label>
                <select
                  value={zaloVoice}
                  onChange={(e) => setZaloVoice(e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                  disabled={useFallbackTTS}
                >
                  {zaloVoiceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={useFallbackTTS}
                    onChange={(e) => setUseFallbackTTS(e.target.checked)}
                    className="mr-2"
                  />
                  Dùng Web Speech API
                </label>
              </div>

              {useFallbackTTS && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giọng nói dự phòng:
                  </label>
                  <select
                    value={selectedFallbackVoice?.name || ""}
                    onChange={(e) => {
                      const voice = availableVoices.find(
                        (v) => v.name === e.target.value
                      );
                      setSelectedFallbackVoice(voice);
                    }}
                    className="w-full p-1 border rounded text-sm"
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-8">
                <p>Chào mừng bạn đến với Voice Chatbot!</p>
                <p>Hãy gửi tin nhắn hoặc nhấn nút mic để bắt đầu.</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-gray-100 rounded-lg">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent px-3 py-2 outline-none text-sm"
                  disabled={isLoading}
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-2 m-1 rounded ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                  }`}
                  disabled={isLoading}
                  title={isListening ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
                >
                  {isListening ? <MicOff /> : <Mic />}
                </button>
              </div>

              <button
                onClick={isSpeaking ? stopSpeaking : () => handleSendMessage()}
                className={`p-2 rounded ${
                  isSpeaking
                    ? "bg-red-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                disabled={isLoading}
                title={isSpeaking ? "Dừng đọc" : "Gửi tin nhắn"}
              >
                {isSpeaking ? <VolumeX /> : <Send />}
              </button>
            </div>

            {/* Status indicator */}
            <div className="mt-2 text-xs text-gray-500 text-center">
              {isListening && (
                <span className="text-red-500">🎤 Đang nghe...</span>
              )}
              {isSpeaking && (
                <span className="text-blue-500">🔊 Đang đọc...</span>
              )}
              {isLoading && (
                <span className="text-orange-500">⏳ Đang xử lý...</span>
              )}
              {!isListening && !isSpeaking && !isLoading && (
                <span>Sẵn sàng</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceChatbot;
