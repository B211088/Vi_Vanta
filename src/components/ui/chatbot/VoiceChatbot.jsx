import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  BotMessageSquare,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  chatVoice,
  getChatVoiceMessages,
} from "../../../services/chatbot.service";
import { convertMarkdownToJSX } from "../../../utils/convertMarkdownToJSX";

import { API_URL } from "../../../config/api.config";
import { addVoiceMessage } from "../../../store/slices/chatbot.slice";

const VoiceChatbot = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, voicesMessages } = useSelector((state) => state.chatbot);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [transcript, setTranscript] = useState(""); // Để hiển thị transcript đang được thu
  const [silenceTimer, setSilenceTimer] = useState(null); // Timer để detect silence

  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (user) {
      dispatch(getChatVoiceMessages(user._id));
    }
  }, [user]);

  useEffect(() => {
    if (voicesMessages) {
      setMessages(voicesMessages);
    }
  }, [voicesMessages]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Trình duyệt không hỗ trợ Speech Recognition.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();

    // ✅ Cải thiện cấu hình Speech Recognition
    recognitionRef.current.continuous = true; // Cho phép thu liên tục
    recognitionRef.current.interimResults = true; // Hiển thị kết quả tạm thời
    recognitionRef.current.lang = "vi-VN";
    recognitionRef.current.maxAlternatives = 1;

    // ✅ Xử lý kết quả thu âm
    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Hiển thị transcript tạm thời
      setTranscript(finalTranscript + interimTranscript);
      setInputText(finalTranscript + interimTranscript);

      // ✅ Reset timer khi có âm thanh mới
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }

      // ✅ Nếu có finalTranscript, gửi ngay lập tức thay vì chờ
      if (finalTranscript.trim()) {
        // Delay nhỏ để user có thể thấy text trước khi gửi
        setTimeout(() => {
          handleSendMessage(finalTranscript.trim());
          stopListening();
        }, 300); // Chỉ delay 300ms để user thấy được text
      } else if (interimTranscript.trim()) {
        // Chỉ set timer cho interim results
        const newTimer = setTimeout(() => {
          const currentText = inputText.trim();
          if (currentText) {
            handleSendMessage(currentText);
            stopListening();
          }
        }, 1500);
        setSilenceTimer(newTimer);
      }
    };

    // ✅ Xử lý khi bắt đầu thu
    recognitionRef.current.onstart = () => {
      console.log("Speech recognition started");
      setTranscript("");
      setInputText("");
    };

    // ✅ Xử lý khi kết thúc thu
    recognitionRef.current.onend = () => {
      setIsListening(false);
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    };

    // ✅ Xử lý lỗi
    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);

      if (event.error === "no-speech") {
        // Thử khởi động lại nếu không có tiếng nói
        setTimeout(() => {
          if (!isListening) {
            startListening();
          }
        }, 1000);
      }
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceTimer]);

  // Khởi tạo và load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
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
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  const playAudio = (audioUrl) => {
    return new Promise((resolve, reject) => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = "";
        audioRef.current.load();
      }

      const audio = new Audio();
      audioRef.current = audio;

      let wasManuallyStopped = false;

      const handleStop = () => {
        wasManuallyStopped = true;
        audio.pause();
        audio.src = "";
        audio.load();
        setIsSpeaking(false);
        resolve();
      };

      window.addEventListener("stop-audio", handleStop);

      audio.oncanplaythrough = () => {
        setIsSpeaking(true);
        audio.play().catch((err) => {
          if (!wasManuallyStopped) reject(err);
          setIsSpeaking(false);
        });
      };

      audio.onended = () => {
        setIsSpeaking(false);
        window.removeEventListener("stop-audio", handleStop);
        resolve();
      };

      audio.onerror = (err) => {
        setIsSpeaking(false);
        window.removeEventListener("stop-audio", handleStop);
        if (!wasManuallyStopped) reject(err);
        else resolve();
      };

      audio.src = audioUrl;
      audio.load();
    });
  };

  const stopSpeaking = () => {
    window.dispatchEvent(new Event("stop-audio"));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = "";
      audioRef.current.load();
    }

    setIsSpeaking(false);
  };

  // ✅ Cải thiện Start voice recognition
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        setIsListening(true);
        setTranscript("");
        setInputText("");
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setIsListening(false);
      }
    }
  };

  // ✅ Cải thiện Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (silenceTimer) {
        clearTimeout(silenceTimer);
        setSilenceTimer(null);
      }
    }
  };

  // Gửi tin nhắn đến API
  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      _id: Date.now(),
      role: "user",
      content: text,
    };

    addVoiceMessage(userMessage);

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setTranscript("");
    setIsLoading(true);

    try {
      const response = await dispatch(
        chatVoice({ question: userMessage.content, userId: user._id || null })
      );

      if (response.success && response.answer) {
        const botMessage = {
          _id: Date.now() + 1,
          role: "assistant",
          content: response.answer,
        };

        setMessages((prev) => [...prev, botMessage]);
        const voiceUrl = `${API_URL}${response.file}`;
        playAudio(voiceUrl);
        setIsLoading(false);
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
          className="fixed bottom-6 right-6 w-16 h-16 bg-teal-300 hover:bg-teal-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 cursor-pointer"
        >
          <BotMessageSquare size={24} />
        </button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="bg-teal-400 text-white p-4 rounded-t-lg flex items-center justify-between">
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
              className="text-white hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {loading && (
              <div className="text-gray-500 text-center py-8">
                Đang tải cuộc trò chuyện
              </div>
            )}

            {!loading && messages.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                Chào bạn! Hãy bắt đầu cuộc trò chuyện bằng cách nhấn mic hoặc gõ
                tin nhắn.
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end text-light-50"
                    : "justify-start text-dark-50"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-teal-300 text-light-50"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="text-sm">
                    {convertMarkdownToJSX(message.content)}
                  </div>
                </div>
              </div>
            ))}

            {/* ✅ Hiển thị transcript đang được thu */}
            {isListening && transcript && (
              <div className="flex justify-end">
                <div className="max-w-[80%] p-3 rounded-lg bg-teal-200 text-teal-800 border-2 border-teal-300 border-dashed">
                  <div className="text-sm flex items-center">
                    <span className="animate-pulse mr-2">🎤</span>
                    {transcript}
                  </div>
                </div>
              </div>
            )}

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
                    : "bg-teal-500 hover:bg-teal-600 text-white"
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
                placeholder={isListening ? "Đang nghe..." : "Nhập tin nhắn..."}
                disabled={isLoading}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isLoading}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>

            {/* Status */}
            <div className="text-xs text-gray-500 mt-2 text-center">
              {isListening &&
                "🎤 Đang nghe... (gửi tự động khi hoàn thành câu)"}
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
