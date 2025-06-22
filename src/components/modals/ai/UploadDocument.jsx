import React, { useEffect, useState } from "react";
import SubmitButton from "../../common/buttons/SubmitButton";
import CancelButton from "../../common/buttons/CancelButton";
import { useDispatch, useSelector } from "react-redux";
import { addDocument } from "../../../services/collection.service";
import { useNotify } from "../../../hook/useNotify";

const UploadDocument = ({ closeModal, collectionId }) => {
  const dispatch = useDispatch();
  const { notifySuccess, notifyWarning, notifyError, notifyConfirm } =
    useNotify();
  const { loading } = useSelector((state) => state.collection);
  const [selectLocationGetDocument, setSelectLocationGetDocument] =
    useState(null);
  const MAX_FILES = 20;
  const [documentFiles, setDocumentFiles] = useState([]);
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentAccessToken, setCurrentAccessToken] = useState(null);

  // States cho processing bar
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentProcessingFile, setCurrentProcessingFile] = useState("");
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  console.log({ collectionId });

  // Google Drive API configuration
  const CLIENT_ID =
    "667056488068-p32l14s4vbnr4734gkjaoro6abionjhc.apps.googleusercontent.com";
  const API_KEY = "AIzaSyCOnluAgWnJGd_Xrm7s8ORbDKNM2T_-gro";
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest";
  const SCOPES =
    "https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.file";

  // Xử lý file upload từ máy tính
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const totalFiles = [...documentFiles, ...selectedFiles];

    if (totalFiles.length > MAX_FILES) {
      notifyWarning(`Chỉ cho phép tối đa ${MAX_FILES} tệp!`);
      return;
    }

    // Validate file types
    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = selectedFiles.filter((file) => {
      const isValidType = allowedTypes.includes(file.type);
      if (!isValidType) {
        notifyWarning(
          `File ${file.name} không được hỗ trợ. Chỉ chấp nhận: .txt, .pdf, .doc, .docx`
        );
      }
      return isValidType;
    });

    if (validFiles.length > 0) {
      setDocumentFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...documentFiles];
    newFiles.splice(index, 1);
    setDocumentFiles(newFiles);
  };

  // Load Google Scripts
  const loadGoogleScripts = async () => {
    const loadScript = (src, id) => {
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.onload = resolve;
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
      });
    };

    try {
      // Load Google Identity Services
      await loadScript("https://accounts.google.com/gsi/client", "google-gsi");

      // Load Google API
      await loadScript("https://apis.google.com/js/api.js", "google-api");

      // Load Google Picker
      await loadScript(
        "https://apis.google.com/js/api.js?onload=initGooglePicker",
        "google-picker"
      );

      return true;
    } catch (error) {
      console.error("Error loading Google scripts:", error);
      throw error;
    }
  };

  // Khởi tạo Google API với GIS mới
  const initializeGoogleAPI = async () => {
    if (isInitializing || isGoogleApiLoaded) return;

    setIsInitializing(true);

    try {
      // Load all required scripts
      await loadGoogleScripts();

      // Wait for gapi to be available
      await new Promise((resolve) => {
        const checkGapi = () => {
          if (window.gapi) {
            resolve();
          } else {
            setTimeout(checkGapi, 100);
          }
        };
        checkGapi();
      });

      // Load Google API client and Picker
      await new Promise((resolve) => {
        window.gapi.load("client:picker", resolve);
      });

      // Initialize the client
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });

      console.log("Google API initialized successfully");
      setIsGoogleApiLoaded(true);
    } catch (error) {
      console.error("Error initializing Google API:", error);
      notifyError(`Không thể khởi tạo Google Drive API: ${error.message}`);
    } finally {
      setIsInitializing(false);
    }
  };

  // Xử lý đăng nhập Google với GIS mới
  const handleGoogleSignIn = async () => {
    try {
      if (!isGoogleApiLoaded) {
        notifyWarning("Google API chưa được khởi tạo. Vui lòng đợi...");
        return;
      }

      if (!window.google?.accounts?.oauth2) {
        throw new Error("Google Identity Services not loaded");
      }

      // Initialize OAuth2 token client
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (response) => {
          if (response.error) {
            console.error("OAuth error:", response.error);
            notifyError(`Lỗi đăng nhập: ${response.error}`);
            return;
          }

          console.log("Access token received:", response.access_token);
          setCurrentAccessToken(response.access_token);
          openGoogleDrivePicker(response.access_token);
        },
        error_callback: (error) => {
          console.error("OAuth error callback:", error);
          notifyError(`Lỗi đăng nhập: ${error.message || "Không xác định"}`);
        },
      });

      // Request access token
      tokenClient.requestAccessToken({
        prompt: "consent", // Force consent screen to ensure we get a fresh token
        hint: "", // Optional: can specify user email
      });
    } catch (error) {
      console.error("Error signing in to Google:", error);
      notifyError(
        `Không thể đăng nhập Google: ${error.message || "Lỗi không xác định"}`
      );
    }
  };

  // Mở Google Drive Picker với GIS
  const openGoogleDrivePicker = (accessToken) => {
    try {
      if (!window.gapi?.picker) {
        notifyWarning("Google Picker chưa sẵn sàng. Vui lòng thử lại.");
        return;
      }

      if (!accessToken) {
        notifyWarning("Không có token truy cập. Vui lòng đăng nhập lại.");
        return;
      }

      // Create and configure the picker
      const docsView = new window.google.picker.DocsView(
        window.google.picker.ViewId.DOCS
      )
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
        .setMimeTypes(
          "text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(CLIENT_ID.split("-")[0])
        .setOAuthToken(accessToken)
        .addView(docsView)
        .setDeveloperKey(API_KEY)
        .setOrigin(window.location.origin)
        .setCallback((data) =>
          handleGoogleDrivePickerCallback(data, accessToken)
        )
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error("Error opening Google Drive Picker:", error);
      notifyError(`Không thể mở Google Drive Picker: ${error.message}`);
    }
  };

  // Xử lý callback từ Google Drive Picker
  const handleGoogleDrivePickerCallback = async (data, accessToken) => {
    console.log("Picker callback data:", data);

    if (data.action === window.google.picker.Action.PICKED) {
      const selectedFiles = data.docs;

      // Kiểm tra số lượng file
      if (documentFiles.length + selectedFiles.length > MAX_FILES) {
        notifyWarning(`Chỉ cho phép tối đa ${MAX_FILES} tệp!`);
        return;
      }

      try {
        console.log("Processing files:", selectedFiles);

        const processedFiles = await Promise.all(
          selectedFiles.map(async (file) => {
            try {
              console.log(`Processing file: ${file.name} (${file.id})`);

              // Get file metadata first
              const metadataResponse = await window.gapi.client.drive.files.get(
                {
                  fileId: file.id,
                  fields: "id,name,mimeType,size",
                }
              );

              const metadata = metadataResponse.result;

              // Download file content
              const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status}: ${response.statusText}`
                );
              }

              const blob = await response.blob();

              // Create File object from blob với đúng type và size
              const processedFile = new File([blob], metadata.name, {
                type: metadata.mimeType,
                lastModified: Date.now(), // Thêm timestamp
              });

              // Thêm custom properties (không gán lại size vì nó read-only)
              Object.defineProperty(processedFile, "googleDriveId", {
                value: metadata.id,
                writable: false,
                enumerable: true,
              });

              Object.defineProperty(processedFile, "googleDriveUrl", {
                value: file.url,
                writable: false,
                enumerable: true,
              });

              // Không cần gán lại size vì File constructor đã tự động set size từ blob
              console.log(
                `Successfully processed: ${processedFile.name}, Size: ${processedFile.size} bytes`
              );
              return processedFile;
            } catch (error) {
              console.error(`Error processing file ${file.name}:`, error);
              notifyError(
                `Không thể tải file "${file.name}": ${error.message}`
              );
              return null;
            }
          })
        );

        // Filter out null files (failed downloads)
        const validFiles = processedFiles.filter((file) => file !== null);

        if (validFiles.length > 0) {
          setDocumentFiles((prev) => [...prev, ...validFiles]);
          notifySuccess(`Đã thêm ${validFiles.length} tệp từ Google Drive`);
        }

        if (validFiles.length !== selectedFiles.length) {
          const failedCount = selectedFiles.length - validFiles.length;
          notifyWarning(
            `${failedCount} tệp không thể tải xuống. Vui lòng thử lại.`
          );
        }
      } catch (error) {
        console.error("Error downloading files from Google Drive:", error);
        notifyError(`Không thể tải file từ Google Drive: ${error.message}`);
      }
    } else if (data.action === window.google.picker.Action.CANCEL) {
      console.log("User cancelled picker");
    }
  };

  // Khởi tạo Google API khi component mount hoặc khi chọn Google Drive
  useEffect(() => {
    if (
      selectLocationGetDocument === 2 &&
      !isGoogleApiLoaded &&
      !isInitializing
    ) {
      initializeGoogleAPI();
    }
  }, [selectLocationGetDocument, isGoogleApiLoaded, isInitializing]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      // Revoke access token if exists
      if (currentAccessToken && window.google?.accounts?.oauth2) {
        try {
          window.google.accounts.oauth2.revoke(currentAccessToken);
        } catch (error) {
          console.log("Error revoking token:", error);
        }
      }
    };
  }, [currentAccessToken]);

  // Xử lý submit với processing bar
  const handleSubmit = async () => {
    if (documentFiles.length === 0) {
      notifyWarning("Vui lòng chọn ít nhất một tệp để tải lên.");
      return;
    }

    // Khởi tạo processing states
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessedCount(0);
    setTotalFiles(documentFiles.length);

    let successCount = 0;
    let failedFiles = [];

    try {
      // Upload từng file một
      for (let i = 0; i < documentFiles.length; i++) {
        const file = documentFiles[i];

        // Cập nhật file đang xử lý
        setCurrentProcessingFile(file.name);
        setProcessedCount(i);

        try {
          console.log(
            `Đang tải file ${i + 1}/${documentFiles.length}: ${file.name}`
          );

          // Tạo FormData cho từng file
          const formData = new FormData();
          formData.append("file", file);
          formData.append("collectionId", collectionId);

          // Xác định source dựa trên file origin
          const source = file.googleDriveId ? "google_drive" : "local";
          formData.append("source", source);

          // Gọi API upload
          const result = await dispatch(addDocument(formData));

          if (result.success) {
            successCount++;
            console.log(`✅ Tải thành công: ${file.name}`);
          }
        } catch (fileError) {
          console.error(`❌ Lỗi tải file ${file.name}:`, fileError);
          failedFiles.push({
            name: file.name,
            error:
              fileError.response?.data?.message ||
              fileError.message ||
              "Lỗi không xác định",
          });
        }

        // Cập nhật progress
        const progress = ((i + 1) / documentFiles.length) * 100;
        setProcessingProgress(progress);
        setProcessedCount(i + 1);

        // Thêm delay nhỏ để user thấy được progress
        if (i < documentFiles.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // Hiển thị kết quả
      if (successCount === documentFiles.length) {
        notifySuccess(`🎉 Tải lên thành công tất cả ${successCount} tệp!`);
      } else if (successCount > 0) {
        notifySuccess(
          `⚠️ Tải lên hoàn tất!\n` +
            `✅ Thành công: ${successCount} tệp\n` +
            `❌ Thất bại: ${failedFiles.length} tệp\n\n` +
            `Các tệp thất bại:\n${failedFiles
              .map((f) => `• ${f.name}: ${f.error}`)
              .join("\n")}`
        );
      } else {
        notifyError(
          `❌ Không thể tải lên tệp nào!\n\n${failedFiles
            .map((f) => `• ${f.name}: ${f.error}`)
            .join("\n")}`
        );
      }

      // Đóng modal nếu có ít nhất 1 file thành công
      if (successCount > 0) {
        setTimeout(() => {
          closeModal();
        }, 1500); // Delay để user thấy progress hoàn thành
      }
    } catch (error) {
      console.error("Error in upload process:", error);
      notifyError("Có lỗi xảy ra trong quá trình tải lên. Vui lòng thử lại.");
    } finally {
      // Reset processing states sau 2 giây
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingProgress(0);
        setCurrentProcessingFile("");
        setProcessedCount(0);
        setTotalFiles(0);
      }, 2000);
    }
  };

  // Render file icon based on type
  const renderFileIcon = (file) => {
    const type = file.type;
    if (type.includes("pdf")) return <i className="fa-regular fa-file-pdf"></i>;
    if (type.includes("word"))
      return <i className="fa-regular fa-file-word"></i>;
    if (type.includes("text"))
      return <i className="fa-regular fa-file-lines"></i>;
    return <i className="fa-regular fa-file"></i>;
  };

  // Component Processing Bar
  const ProcessingBar = () => {
    if (!isProcessing) return null;

    return (
      <div className="fixed top-0 left-0 right-0 z-60 bg-white border-b shadow-lg">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <h3 className="font-semibold text-gray-800">
                Đang xử lý dữ liệu...
              </h3>
            </div>
            <div className="text-sm text-gray-600">
              {processedCount}/{totalFiles} tệp
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>

          {/* Current Processing File */}
          <div className="text-sm text-gray-600 truncate">
            {currentProcessingFile && (
              <>
                <span className="font-medium">Đang xử lý:</span>{" "}
                {currentProcessingFile}
              </>
            )}
          </div>

          {/* Progress Percentage */}
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(processingProgress)}% hoàn thành
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Processing Bar */}
      <ProcessingBar />

      <div
        role="dialog"
        aria-modal="true"
        tabIndex="-1"
        className="w-full h-full flex justify-center overflow-hidden overflow-y-hidden items-center fixed inset-0 z-50 font-nunito bg-[#1818182d] cursor-pointer"
        onClick={closeModal}
        style={{ paddingTop: isProcessing ? "100px" : "0" }} // Thêm padding khi có processing bar
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-[70%] min-w-[500px] rounded-md bg-light-50 max-h-[90vh] overflow-y-auto"
        >
          <div className="w-full flex flex-col pt-[20px] pb-[10px]">
            <h1 className="font-bold px-[20px]">Dữ liệu</h1>
            <p className="text-sm text-dark-300 px-[20px]">
              Chọn nơi muốn nhập dữ liệu
            </p>

            <div className="w-full flex flex-wrap pb-[20px] px-[20px] mr-[20px]">
              {options?.map((option) => (
                <div
                  key={option.id}
                  onClick={() =>
                    !isProcessing && setSelectLocationGetDocument(option.id)
                  }
                  className={`w-4/12 min-w-[250px] pr-[20px] mt-[20px] ${
                    isProcessing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <div
                    className={`w-full h-full flex items-center gap-[10px] border-1 rounded-lg hover:shadow-md hover:translate-y-[-2px] hover:text-blue-500 p-[10px] transition-all duration-300 cursor-pointer ${
                      option.id === selectLocationGetDocument
                        ? "border-blue-500 text-blue-500"
                        : "border-dark-800"
                    } ${isProcessing ? "pointer-events-none" : ""}`}
                  >
                    <div className="flex items-center justify-center border-1 border-dark-800 rounded-lg p-[10px] aspect-square">
                      <i className={option?.icon}></i>
                    </div>
                    <span className="font-bold text-[0.9rem]">
                      {option?.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload từ máy tính */}
            {selectLocationGetDocument === 1 && (
              <div className="w-full flex flex-col">
                <h1 className="font-bold text-sm px-[20px] py-[8px]">
                  Thêm từ máy tính
                </h1>
                <p className="px-[20px] text-sm text-dark-500">
                  <span>Được phép thêm các file: .txt .pdf .doc .docx</span>
                </p>
                <p className="px-[20px] text-sm text-dark-500">
                  <span>Đã thêm: {`${documentFiles.length}/${MAX_FILES}`}</span>
                </p>
                <div className="w-full flex flex-col gap-[10px] px-[20px] py-[10px]">
                  <label
                    htmlFor="file-upload"
                    className={`w-fit flex items-center gap-[5px] border-1 border-blue-500 rounded-md px-[10px] py-[5px] text-sm text-blue-500 font-semibold cursor-pointer hover:bg-blue-50 transition-colors ${
                      isProcessing
                        ? "opacity-50 cursor-not-allowed pointer-events-none"
                        : ""
                    }`}
                  >
                    <i className="fa-regular fa-square-plus"></i>
                    <span>Thêm một tài liệu</span>
                    <input
                      key={Date.now()}
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".txt,.pdf,.doc,.docx"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isProcessing}
                    />
                  </label>

                  {/* Danh sách files */}
                  {documentFiles.length > 0 ? (
                    <div className="mt-4 h-[220px] w-full overflow-y-auto flex flex-col gap-[5px] space-y-2">
                      {documentFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 rounded-md"
                        >
                          <div className="flex items-center gap-3 p-[8px]">
                            <div className="text-xl text-blue-500">
                              {renderFileIcon(file)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {file.name}
                              </p>
                              <p className="text-xs text-dark-500">
                                {file.type} •{" "}
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                {file.googleDriveId && (
                                  <span className="text-green-600">
                                    {" "}
                                    • Google Drive
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            className={`w-[28px] h-[28px] flex justify-center items-center cursor-pointer hover:bg-gray-200 rounded mr-2 ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() =>
                              !isProcessing && handleRemoveFile(index)
                            }
                            disabled={isProcessing}
                          >
                            <i className="fa-regular fa-square-minus text-red-500"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-[220px] mt-4 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <i className="fa-regular fa-file-arrow-up text-4xl mb-2"></i>
                        <p>Chưa có tệp nào được chọn</p>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-[10px] pt-[10px]">
                    <button
                      className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
                                ${
                                  loading
                                    ? "bg-gray-400"
                                    : "bg-blue-500 hover:bg-dark-600"
                                } 
                                transition-colors cursor-pointer`}
                      loading={loading}
                      onClick={handleSubmit}
                    >
                      {loading ? (
                        <div className="flex items-center gap-[10px] animate-pulse text-sm ">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                          <span>Đang xử lý dữ liệu...</span>
                        </div>
                      ) : (
                        <span>Tải dữ liệu</span>
                      )}
                    </button>
                    <CancelButton
                      loading={loading || isProcessing}
                      closeModal={closeModal}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Upload từ Google Drive */}
            {selectLocationGetDocument === 2 && (
              <div className="w-full flex flex-col">
                <h1 className="font-bold text-sm px-[20px] py-[8px]">
                  Thêm từ Google Drive
                </h1>
                <p className="px-[20px] text-sm text-dark-500">
                  <span>Được phép thêm các file: .txt .pdf .doc .docx</span>
                </p>
                <p className="px-[20px] text-sm text-dark-500">
                  <span>Đã thêm: {`${documentFiles.length}/${MAX_FILES}`}</span>
                </p>

                <div className="w-full flex flex-col gap-[10px] px-[20px] py-[10px]">
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={
                      isInitializing || !isGoogleApiLoaded || isProcessing
                    }
                    className={`w-fit flex items-center gap-[5px] border-1 border-blue-500 rounded-md px-[10px] py-[5px] text-sm text-blue-500 font-semibold cursor-pointer hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isProcessing ? "pointer-events-none" : ""
                    }`}
                  >
                    <i className="fa-brands fa-google-drive"></i>
                    <span>
                      {isInitializing
                        ? "Đang khởi tạo..."
                        : isGoogleApiLoaded
                        ? "Chọn từ Google Drive"
                        : "Đang tải API..."}
                    </span>
                  </button>

                  {/* Status indicator */}
                  {selectLocationGetDocument === 2 && (
                    <div className="text-xs text-gray-600 px-[10px]">
                      {isInitializing && "⏳ Đang khởi tạo Google API..."}
                      {isGoogleApiLoaded && "✅ Google API đã sẵn sàng"}
                      {!isGoogleApiLoaded &&
                        !isInitializing &&
                        "❌ Google API chưa sẵn sàng"}
                    </div>
                  )}

                  {/* Danh sách files */}
                  {documentFiles.length > 0 ? (
                    <div className="mt-4 h-[220px] w-full overflow-y-auto flex flex-col gap-[5px] space-y-2">
                      {documentFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 rounded-md"
                        >
                          <div className="flex items-center gap-3 p-[8px]">
                            <div className="text-xl text-blue-500">
                              {renderFileIcon(file)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                {file.name}
                              </p>
                              <p className="text-xs text-dark-500">
                                {file.type} •{" "}
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                {file.googleDriveId && (
                                  <span className="text-green-600">
                                    {" "}
                                    • Google Drive
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <button
                            className={`w-[28px] h-[28px] flex justify-center items-center cursor-pointer hover:bg-gray-200 rounded mr-2 ${
                              isProcessing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            onClick={() =>
                              !isProcessing && handleRemoveFile(index)
                            }
                            disabled={isProcessing}
                          >
                            <i className="fa-regular fa-square-minus text-red-500"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-[220px] mt-4 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <i className="fa-brands fa-google-drive text-4xl mb-2"></i>
                        <p>Chưa có tệp nào được chọn từ Google Drive</p>
                      </div>
                    </div>
                  )}

                  <div className="w-full flex flex-col gap-[10px] pt-[10px]">
                    <button
                      className={`w-full flex justify-center items-center rounded-sm py-[8px] text-sm text-light-50 font-bold 
                                ${
                                  loading
                                    ? "bg-gray-400"
                                    : "bg-blue-500 hover:bg-dark-600"
                                } 
                                transition-colors cursor-pointer`}
                      loading={loading}
                      onClick={handleSubmit}
                    >
                      {loading ? (
                        <div className="flex items-center gap-[10px] animate-pulse text-sm ">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          </div>
                          <span>Đang xử lý dữ liệu...</span>
                        </div>
                      ) : (
                        <span>Tải dữ liệu</span>
                      )}
                    </button>
                    <CancelButton
                      loading={loading || isProcessing}
                      closeModal={closeModal}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Options data for document sources
const options = [
  {
    id: 1,
    name: "Máy tính",
    icon: "fa-solid fa-computer",
  },
  {
    id: 2,
    name: "Google Drive",
    icon: "fa-brands fa-google-drive",
  },
];

export default UploadDocument;
