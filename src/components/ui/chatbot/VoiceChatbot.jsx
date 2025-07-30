import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { askChatBot } from "../../../services/chatbot.service";
import { convertMarkdownToJSX } from "../../../utils/convertMarkdownToJSX";
import {
  cleanTextForSpeech,
  splitTextIntoChunks,
} from "../../../utils/cleanTextForSpeech";

const APIKEY_ZALO = "QRzyNkvKdIQm4KM3b6dynIBHglnLF6pZ";
const VoiceChatbot = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [zaloVoice, setZaloVoice] = useState("female_south");
  const [useFallbackTTS, setUseFallbackTTS] = useState(false);
  const [selectedFallbackVoice, setSelectedFallbackVoice] = useState(null);

  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const APIKEY_ZALO = "QRzyNkvKdIQm4KM3b6dynIBHglnLF6pZ";

  // Zalo voice options
  const zaloVoiceMapping = {
    female_south: 1, // Nữ miền Nam
    male_south: 2, // Nam miền Nam
    female_north: 3, // Nữ miền Bắc
    male_north: 4, // Nam miền Bắc
  };

  // Khởi tạo Speech Recognition
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

  useEffect(() => {
    if (isOpen) {
      speakText(
        "Chào bạn!Đây là trợ lý ảo sức khỏe vivanta, Hãy bắt đầu cuộc trò chuyện bằng cách nhấn micro hoặc gõ tin nhắn."
      );
    }
  }, [isOpen]);

  // Khởi tạo và load voices
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

  // Tìm giọng Việt Nam tốt nhất
  // Thay thế hàm findBestVietnameseVoice trong code của bạn

  async function textToSpeechZalo(
    text,
    voiceType = "female_south",
    speed = 1.0
  ) {
    try {
      // Validate input
      if (!text || text.trim().length === 0) {
        throw new Error("Text is required for TTS");
      }

      // Get speaker ID from voice type
      const speakerId = zaloVoiceMapping[voiceType] || 1;

      // Prepare form data
      const params = new URLSearchParams();
      params.append("input", text.trim());
      params.append("speaker_id", speakerId);
      params.append("speed", Math.max(0.8, Math.min(1.2, speed))); // Clamp speed between 0.8-1.2
      params.append("encode_type", 1); // 1 = MP3

      const response = await fetch("https://api.zalo.ai/v1/tts/synthesize", {
        method: "POST",
        headers: {
          apikey: APIKEY_ZALO,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check for API errors
      if (data.error_code !== 0) {
        console.error("Zalo TTS API error:", data.error_message);
        throw new Error(data.error_message || "Unknown API error");
      }

      // Validate response data
      if (!data.data || !data.data.url) {
        throw new Error("Invalid response: missing audio URL");
      }

      return data.data.url;
    } catch (error) {
      console.error("TTS request failed:", error);
      throw error;
    }
  }

  // Fallback Web Speech TTS

  // Text-to-Speech cải tiến
  const speakText = async (text) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    const cleanedText = cleanTextForSpeech(text);

    try {
      if (!useFallbackTTS) {
        try {
          // Use selected Zalo voice
          const audioUrl = await textToSpeechZalo(cleanedText, zaloVoice);
          await playAudio(audioUrl);
          return; // Exit if successful
        } catch (zaloError) {
          console.warn(
            "Zalo TTS failed, falling back to Web Speech API:",
            zaloError
          );
          // Fall through to fallback TTS
        }
      }

      // Fallback to Web Speech API
    } catch (error) {
      console.error("All TTS methods failed:", error);
    } finally {
      setIsSpeaking(false);
    }
  };

  const playAudio = (audioUrl) => {
    return new Promise((resolve, reject) => {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio();
      audioRef.current = audio;

      // Set up event listeners before setting src
      audio.onloadeddata = () => {
        console.log("Audio loaded successfully");
      };

      audio.onended = () => {
        console.log("Audio playback ended");
        resolve();
      };

      audio.onerror = (error) => {
        console.error("Audio playback error:", error);
        reject(new Error("Audio playback failed"));
      };

      audio.oncanplaythrough = () => {
        // Audio is ready to play
        audio.play().catch(reject);
      };

      // Set the audio source (this will trigger loading)
      audio.src = audioUrl;
      audio.load(); // Explicitly load the audio
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

  // Gửi tin nhắn đến API
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      // Gọi API sử dụng Redux dispatch
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

      console.log({ response });

      if (response.success && response.data.answer) {
        const botMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: convertMarkdownToJSX(response.data.answer.content),
          timestamp: response.data.answer.timestamp,
        };

        setMessages((prev) => [...prev, botMessage]);

        // Tự động phát âm câu trả lời
        await speakText(response.data.answer.content);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý gửi tin nhắn từ input
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    handleSendMessage(inputText);
  };

  // Đóng chatbot và dọn dẹp
  const handleClose = () => {
    setIsOpen(false);
    stopSpeaking();
    stopListening();
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Trợ lý AI</h3>
              {selectedVoice && (
                <p className="text-xs opacity-75">
                  Giọng:{" "}
                  {selectedVoice.name.length > 20
                    ? selectedVoice.name.substring(0, 20) + "..."
                    : selectedVoice.name}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                handleClose();
                stopSpeaking();
              }}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                Chào bạn! Hãy bắt đầu cuộc trò chuyện bằng cách nhấn mic hoặc gõ
                tin nhắn.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-gray-200">
            {/* Voice Controls */}
            <div className="flex justify-center space-x-4 mb-3">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button
                onClick={isSpeaking ? stopSpeaking : () => {}}
                disabled={!isSpeaking}
                className={`p-3 rounded-full transition-all duration-200 ${
                  isSpeaking
                    ? "bg-green-500 hover:bg-green-600 text-white animate-pulse"
                    : "bg-gray-300 text-gray-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>

            {/* Text Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
                placeholder="Nhập tin nhắn..."
                disabled={isLoading || isListening}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isLoading || isListening}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Status */}
            <div className="text-xs text-gray-500 mt-2 text-center">
              {isListening && "🎤 Đang nghe..."}
              {isSpeaking && "🔊 Đang phát âm..."}
              {isLoading && "⏳ Đang xử lý..."}
              {!selectedVoice &&
                availableVoices.length === 0 &&
                "⚠️ Đang tải giọng đọc..."}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceChatbot;
