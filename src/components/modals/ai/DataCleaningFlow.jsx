import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  FileText,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "../../../utils/pdfWorkerLoader"; // 👈 đảm bảo worker được cấu hình

const DataCleaningFlow = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cleanedText, setCleanedText] = useState("");
  const [originalStats, setOriginalStats] = useState({});
  const [cleanedStats, setCleanedStats] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [fileNameInput, setFileNameInput] = useState("cleaned_text.txt");
  const supportedFormats = [
    { ext: "PDF", desc: "Trích xuất text từ PDF", icon: "📄" },
    { ext: "DOC/DOCX", desc: "Microsoft Word documents", icon: "📝" },
    { ext: "CSV/XLSX", desc: "Dữ liệu bảng tính", icon: "📊" },
    { ext: "TXT/JSON", desc: "Plain text và structured data", icon: "🗂️" },
  ];

  const steps = [
    "Đọc file",
    "Phân tích cấu trúc",
    "Làm sạch dữ liệu",
    "Định dạng text",
    "Hoàn thành",
  ];

  const analyzeText = (text) => {
    return {
      length: text.length,
      lines: text.split("\n").length,
      words: text.split(/\s+/).filter((word) => word.length > 0).length,
      paragraphs: text.split(/\n\s*\n/).length,
    };
  };

  const cleanText = (text) => {
    let cleaned = text;

    // Remove extra spaces
    cleaned = cleaned.replace(/\s+/g, " ");

    // Split into sentences and clean each
    const sentences = cleaned
      .split(/[.!?]+/)
      .map((sentence) => {
        return sentence.trim().replace(/^\s*[-•*]\s*/, "");
      })
      .filter((sentence) => sentence.length > 10);

    return sentences.join(". ").trim();
  };

  const formatForAI = (text) => {
    let formatted = text;

    // Ensure proper sentence endings
    formatted = formatted.replace(
      /([.!?])\s*([A-ZÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ])/g,
      "$1 $2"
    );

    // Remove redundant phrases
    const redundantPhrases = [
      /\b(theo như|như đã|như vậy|bằng cách|một cách|tại sao|vì sao|làm thế nào)\b/gi,
      /\b(page \d+|trang \d+|© \d+|\d+\/\d+\/\d+)\b/gi,
    ];

    redundantPhrases.forEach((pattern) => {
      formatted = formatted.replace(pattern, "");
    });

    return formatted.replace(/\s+/g, " ").trim();
  };

  const readPDFFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let textContent = "";
    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const text = await page.getTextContent();
      const pageText = text.items.map((item) => item.str).join(" ");
      textContent += pageText + "\n\n";
    }

    return textContent;
  };

  const readTextFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file, "UTF-8");
    });
  };

  const readCSVFile = async (file) => {
    const text = await readTextFile(file);
    const lines = text.split("\n");
    let result = "";

    lines.forEach((line, index) => {
      if (line.trim()) {
        const columns = line
          .split(",")
          .map((col) => col.trim().replace(/"/g, ""));
        if (index === 0) {
          result += "Headers: " + columns.join(" | ") + "\n\n";
        } else {
          result += "Row " + index + ": " + columns.join(" | ") + "\n";
        }
      }
    });

    return result;
  };

  const readJSONFile = async (file) => {
    const text = await readTextFile(file);
    try {
      const jsonData = JSON.parse(text);
      return JSON.stringify(jsonData, null, 2);
    } catch (error) {
      return text;
    }
  };

  const processFile = async (selectedFile) => {
    setProcessing(true);
    setCurrentStep(0);
    setProgress(0);

    try {
      // Step 1: Read file
      setCurrentStep(1);
      setProgress(20);
      await new Promise((resolve) => setTimeout(resolve, 500));

      let rawText = "";
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

      switch (fileExtension) {
        case "txt":
          rawText = await readTextFile(selectedFile);
          break;
        case "csv":
          rawText = await readCSVFile(selectedFile);
          break;
        case "json":
          rawText = await readJSONFile(selectedFile);
          break;
        case "pdf":
          rawText = await readPDFFile(selectedFile); // ✅ PDF đúng cách
          break;
        default:
          rawText = await readTextFile(selectedFile);
      }
      // Step 2: Analyze structure
      setCurrentStep(2);
      setProgress(40);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const originalTextStats = analyzeText(rawText);
      setOriginalStats(originalTextStats);

      // Step 3: Clean data
      setCurrentStep(3);
      setProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const cleaned = cleanText(rawText);

      // Step 4: Format text
      setCurrentStep(4);
      setProgress(80);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const formatted = formatForAI(cleaned);
      setCleanedText(formatted);

      // Step 5: Complete
      setCurrentStep(5);
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const finalStats = analyzeText(formatted);
      setCleanedStats(finalStats);
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Lỗi khi xử lý file: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processFile(selectedFile);
    }
  };
  const downloadCleanedTextWithName = (name) => {
    if (!name) return;

    const safeFileName = name.endsWith(".txt") ? name : name + ".txt";
    const blob = new Blob([cleanedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFileName;
    a.click();
    URL.revokeObjectURL(url);
  };
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(cleanedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const resetFlow = () => {
    setFile(null);
    setProcessing(false);
    setCurrentStep(0);
    setProgress(0);
    setCleanedText("");
    setOriginalStats({});
    setCleanedStats({});
    setCopied(false);
  };

  return (
    <div className="w-full  bg-light-50 p-6">
      {showSaveModal && (
        <div className="fixed inset-0 bg-[#00000020] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Đặt tên file để tải xuống
            </h2>
            <input
              type="text"
              value={fileNameInput}
              onChange={(e) => setFileNameInput(e.target.value)}
              placeholder="Nhập tên file..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-md border border-gray-400 hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  downloadCleanedTextWithName(fileNameInput);
                  setShowSaveModal(false);
                }}
                className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600"
              >
                Tải xuống
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-full mx-auto rounded-3xl ">
        {/* Header */}
        <div className=" mb-10">
          <h1 className="text-xl font-bold text-blue-500 mb-2">
            Data Cleaning Flow Control
          </h1>
          <p className="text-sm text-gray-600">
            Làm sạch và chuyển đổi dữ liệu từ nhiều định dạng file khác nhau
            thành text sạch cho AI
          </p>
        </div>
        <div className="mt-12  rounded-2xl">
          <h3 className="text-md  font-semibold text-gray-700">
            Các định dạng được hỗ trợ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-[10px]">
            {supportedFormats.map((format, index) => (
              <div
                key={index}
                className="flex items-center gap-[5px] bg-white py-[10px] px-[10px] rounded-xl text-center shadow-sm border-1 border-dark-800"
              >
                <div className="text-3xl ">{format.icon}</div>
                <div className="font-semibold text-gray-700 ">{format.ext}</div>
                <div className="text-sm text-gray-500">{format.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        {!processing && !cleanedText && (
          <div
            className={`border-1 w-full border-dashed rounded-2xl p-12 my-[20px] text-center transition-all duration-300 cursor-pointer ${
              dragActive
                ? "border-purple-500 bg-purple-50 scale-105"
                : "border-blue-400 hover:border-purple-500 hover:bg-blue-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-6 text-blue-500" />
            <h3 className="text-md font-semibold mb-4 text-gray-700">
              Kéo thả file vào đây hoặc nhấp để chọn file
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Hỗ trợ: PDF, DOC, DOCX, TXT, CSV, XLSX, XLS, JSON, XML
            </p>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-18 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer">
              Chọn File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.json,.xml"
              className="hidden"
            />
          </div>
        )}

        {/* Processing Section */}
        {processing && (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 mx-auto mb-6 text-blue-500 animate-spin" />
            <h3 className="text-xl font-semibold mb-6 text-gray-700">
              Đang xử lý dữ liệu...
            </h3>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step Indicator */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg transition-all duration-300 ${
                    index < currentStep
                      ? "bg-green-500 text-white"
                      : index === currentStep
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <div className="font-semibold">
                    {index + 1}. {step}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {!processing && cleanedText && (
          <div className="space-y-2 py-[20px] ">
            <div className="flex items-center justify-between  ">
              <h3 className="text-md font-semibold text-gray-700">
                Kết quả làm sạch
              </h3>
              <button
                onClick={resetFlow}
                className="border-1 border-dark-600  px-6 py-2 rounded-lg hover:bg-blue-500 hover:border-transparent hover:text-light-50  transition-colors cursor-pointer text-sm"
              >
                Xử lý file khác
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl text-center border-1 border-blue-500">
                <div className="text-2xl font-bold text-blue-600">
                  {originalStats.words}
                </div>
                <div className="text-gray-600 text-sm">Từ gốc</div>
              </div>
              <div className="bg-green-50 p-6 rounded-xl text-center border-1 border-green-500">
                <div className="text-2xl font-bold text-green-600">
                  {cleanedStats.words}
                </div>
                <div className="text-gray-600 text-sm">Từ sau làm sạch</div>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl text-center border-1 border-purple-500">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    (cleanedStats.length / originalStats.length) * 100
                  )}
                  %
                </div>
                <div className="text-gray-600 text-sm">Tỷ lệ giữ lại</div>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl text-center border-1 border-orange-500">
                <div className="text-2xl font-bold text-orange-600">
                  {cleanedStats.length}
                </div>
                <div className="text-gray-600 text-sm">Ký tự cuối</div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border-1 border-dark-800 rounded-xl p-6">
              <h4 className="font-semibold mb-4 text-gray-700">
                Preview (2000 ký tự đầu):
              </h4>
              <div className="bg-dark-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {cleanedText.substring(0, 2000)}
                {cleanedText.length > 2000 ? "..." : ""}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 py-2 justify-center">
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 text-sm bg-green-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-600 transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Tải xuống TXT
              </button>
              <button
                onClick={copyToClipboard}
                className={`flex items-center text-sm gap-2 px-6 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Đã copy!" : "Copy Text"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCleaningFlow;
