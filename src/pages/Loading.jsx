import { useState, useEffect } from "react";

const Loading = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Simulate theme toggle for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setIsDarkMode((prev) => !prev);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`fixed top-0 bottom-0 right-0 left-0 flex items-center justify-center z-[100] transition-all duration-1000 ${
        isDarkMode
          ? "bg-dark-200"
          : "bg-gradient-to-br from-vivanta-bg-gradient-start via-vivanta-bg-gradient-via to-vivanta-bg-gradient-end"
      }`}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              isDarkMode ? "bg-vivanta-400" : "bg-vivanta-300"
            } opacity-30 animate-pulse`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      {/* Medical cross background decoration */}
      <div className="absolute inset-0 right-[20%] top-[10%] flex items-center justify-center opacity-5">
        <div
          className={`w-30 h-30 ${
            isDarkMode ? "text-white" : "text-vivanta-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" />
          </svg>
        </div>
      </div>{" "}
      <div className="absolute inset-0 right-[16%] top-[-40%] flex items-center justify-center opacity-5">
        <div
          className={`w-24 h-24 ${
            isDarkMode ? "text-white" : "text-vivanta-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-0 left-[20%]  bottom-[20%] flex items-center justify-center opacity-5">
        <div
          className={`w-38 h-38 ${
            isDarkMode ? "text-white" : "text-vivanta-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-full h-full"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" />
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-center relative z-10">
        {/* Animated medical mascot */}
        <div className="relative mb-8">
          {/* Main mascot container */}
          <div className="w-32 h-32 flex justify-center items-center relative">
            {/* Mascot body */}
            <div className="relative">
              {/* Head */}
              <div
                className={`w-24 h-24 rounded-full ${
                  isDarkMode ? "bg-vivanta-400" : "bg-vivanta-500"
                } relative animate-bounce shadow-2xl`}
              >
                {/* Medical cap */}
                <div
                  className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-6 rounded-full ${
                    isDarkMode ? "bg-white" : "bg-vivanta-100"
                  } shadow-md`}
                >
                  <div
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${
                      isDarkMode ? "text-vivanta-500" : "text-vivanta-600"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" />
                    </svg>
                  </div>
                </div>

                {/* Eyes */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isDarkMode ? "bg-dark-800" : "bg-white"
                    } animate-pulse`}
                  />
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isDarkMode ? "bg-dark-800" : "bg-white"
                    } animate-pulse`}
                  />
                </div>

                {/* Mouth */}
                <div
                  className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-6 h-3 rounded-full ${
                    isDarkMode ? "bg-dark-800" : "bg-white"
                  } animate-pulse`}
                />

                {/* Cheeks */}
                <div
                  className={`absolute top-8 left-2 w-4 h-4 rounded-full ${
                    isDarkMode ? "bg-vivanta-300" : "bg-vivanta-400"
                  } opacity-60 animate-pulse`}
                />
                <div
                  className={`absolute top-8 right-2 w-4 h-4 rounded-full ${
                    isDarkMode ? "bg-vivanta-300" : "bg-vivanta-400"
                  } opacity-60 animate-pulse`}
                />
              </div>

              {/* Arms */}
              <div
                className={`absolute top-16 -left-8 w-6 h-12 rounded-full ${
                  isDarkMode ? "bg-vivanta-400" : "bg-vivanta-500"
                } animate-pulse transform rotate-12`}
              />
              <div
                className={`absolute top-16 -right-8 w-6 h-12 rounded-full ${
                  isDarkMode ? "bg-vivanta-400" : "bg-vivanta-500"
                } animate-pulse transform -rotate-12`}
              />

              {/* Hands with medical tools */}
              <div
                className={`absolute top-24 -left-10 w-4 h-4 rounded-full ${
                  isDarkMode ? "bg-vivanta-300" : "bg-vivanta-400"
                } animate-bounce`}
              >
                <div
                  className={`absolute -top-1 -left-1 w-2 h-6 ${
                    isDarkMode ? "bg-white" : "bg-vivanta-100"
                  } rounded-full`}
                />
              </div>
              <div
                className={`absolute top-24 -right-10 w-4 h-4 rounded-full ${
                  isDarkMode ? "bg-vivanta-300" : "bg-vivanta-400"
                } animate-bounce`}
              >
                <div
                  className={`absolute -top-1 -right-1 w-2 h-6 ${
                    isDarkMode ? "bg-white" : "bg-vivanta-100"
                  } rounded-full`}
                />
              </div>
            </div>
          </div>

          {/* Floating hearts */}
          <div className="absolute -top-4 -left-4 animate-bounce">
            <div
              className={`w-4 h-4 ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
          <div
            className="absolute -top-2 -right-6 animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            <div
              className={`w-3 h-3 ${
                isDarkMode ? "text-red-400" : "text-red-500"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Animated loading spinner */}
        <div className="relative mb-6">
          <div
            className={`w-16 h-16 border-4 border-transparent rounded-full animate-spin ${
              isDarkMode ? "border-t-vivanta-400" : "border-t-vivanta-500"
            }`}
          />
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${
              isDarkMode ? "bg-vivanta-400" : "bg-vivanta-500"
            } animate-pulse`}
          />
        </div>

        {/* Loading text */}
        <div
          className={`text-xl font-nunito font-bold flex items-center gap-3 ${
            isDarkMode ? "text-white" : "text-vivanta-text-primary"
          }`}
        >
          <span className="animate-pulse">Đang tải hệ thống...</span>
          <div
            className={`w-6 h-6 ${
              isDarkMode ? "text-vivanta-400" : "text-vivanta-500"
            } animate-bounce`}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4V8H18C19.1 8 20 8.9 20 10V14C20 15.1 19.1 16 18 16H14V20C14 21.1 13.1 22 12 22H10C8.9 22 8 21.1 8 20V16H4C2.9 16 2 15.1 2 14V10C2 8.9 2.9 8 4 8H8V4C8 2.9 8.9 2 10 2H12Z" />
            </svg>
          </div>
        </div>

        {/* Subtitle */}
        <div
          className={`text-sm font-nunito mt-2 ${
            isDarkMode ? "text-vivanta-300" : "text-vivanta-text-muted"
          } animate-pulse`}
        >
          Vui lòng chờ trong giây lát...
        </div>

        {/* Progress bar */}
        <div
          className={`w-64 h-2 rounded-full mt-6 ${
            isDarkMode ? "bg-dark-600" : "bg-vivanta-100"
          } overflow-hidden`}
        >
          <div
            className={`h-full rounded-full ${
              isDarkMode ? "bg-vivanta-400" : "bg-vivanta-500"
            } animate-pulse`}
            style={{
              width: "60%",
              animation: "progress 2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
