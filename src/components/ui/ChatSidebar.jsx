import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllInfoCollections,
  getDetailCollection,
  updateConfigCollection,
} from "../../services/collection.service";
import { formatDateDDMMYYHHMMSS } from "../../utils/formatDate";
import { useNotify } from "../../hook/useNotify";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../hook/useTheme";

const ChatSidebar = ({
  collectionName,
  collectionId,
  messagesLength,
  selectedAiModel,
  loading,
  conversationContext,
  section,
  prompt,
  setPrompt,
  isSubmitting,
  maxToken = 1000,
  setMaxToken,
  temperature = 0.7,
  setTemperature,
  chunkLimit = 5,
  setChunkLimit,
  similarityThreshold = 0.2,
  setSimilarityThreshold,
  setCollectionId,
}) => {
  const dispatch = useDispatch();
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const collectionIdParams = searchParams.get("id");
  const { collections, collection } = useSelector((state) => state.collection);
  const hasInitialized = useRef(false);
  const [selectedCollectionName, setSelectedCollectionName] = useState(null);
  const [selectedCollectionId, setSelectedCollectionId] =
    useState(collectionId);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState({});
  const { notifyError, notifySuccess } = useNotify();

  // Load collections on mount
  useEffect(() => {
    if (!collections || collections.length === 0) {
      dispatch(getAllInfoCollections());
    }
  }, [dispatch, collections]);

  useEffect(() => {
    if (collectionIdParams) {
      dispatch(getDetailCollection(collectionIdParams));
    }
  }, [collectionIdParams]);

  // Load collection config when collectionId changes
  useEffect(() => {
    const loadConfig = async () => {
      if (
        selectedCollectionId &&
        collection &&
        collection._id === selectedCollectionId
      ) {
        const config = {
          prompt: collection?.prompt || "",
          maxToken: collection?.maxToken || 1000,
          temperature: collection?.temperature || 0.7,
          chunkLimit: collection?.chunkLimit || 5,
          similarityThreshold: collection?.similarityThreshold || 0.2,
        };

        setOriginalConfig(config);

        // Chỉ set giá trị nếu các setter functions tồn tại
        if (setPrompt && config.prompt !== prompt) setPrompt(config.prompt);
        if (setMaxToken && config.maxToken !== maxToken)
          setMaxToken(config.maxToken);
        if (setTemperature && config.temperature !== temperature)
          setTemperature(config.temperature);
        if (setChunkLimit && config.chunkLimit !== chunkLimit)
          setChunkLimit(config.chunkLimit);
        if (
          setSimilarityThreshold &&
          config.similarityThreshold !== similarityThreshold
        )
          setSimilarityThreshold(config.similarityThreshold);

        setHasUnsavedChanges(false);
      }
    };

    loadConfig();
  }, [selectedCollectionId, collection, collectionId]);

  // Track changes to detect unsaved modifications
  useEffect(() => {
    if (originalConfig.prompt !== undefined) {
      const currentConfig = {
        prompt,
        maxToken,
        temperature,
        chunkLimit,
        similarityThreshold,
      };
      const hasChanges = Object.keys(originalConfig).some(
        (key) => originalConfig[key] !== currentConfig[key]
      );
      setHasUnsavedChanges(hasChanges);
    }
  }, [
    prompt,
    maxToken,
    temperature,
    chunkLimit,
    similarityThreshold,
    originalConfig,
  ]);

  // Auto-select first collection if no collection is selected
  useEffect(() => {
    if (
      collections?.length > 0 &&
      !selectedCollectionId &&
      setCollectionId &&
      !hasInitialized.current
    ) {
      const firstCollection = collections[0];
      setCollectionId(firstCollection._id);

      hasInitialized.current = true;
    }
  }, [collections, collectionId, setCollectionId]);

  // Find current collection based on collectionId
  const currentCollection = collections?.find(
    (c) => c._id === selectedCollectionId
  );

  // Display logic for collection name and ID
  const displayCollectionName =
    currentCollection?.name || collectionName || "Chưa chọn";

  const handleChangeCollection = async (e) => {
    const selectedId = e.target.value;
    if (selectedId && setCollectionId) {
      try {
        await dispatch(getDetailCollection(selectedId));
        const collection = collections.find((c) => c._id === selectedId);
        setSelectedCollectionName(collection?.name);
        setSelectedCollectionId(selectedId);
        setCollectionId(selectedId);
        setHasUnsavedChanges(false);
      } catch (error) {
        notifyError("Không thể tải collection");
      }
    }
  };

  const updateConfigCollectionHandle = async () => {
    if (!selectedCollectionId || isUpdating || !hasUnsavedChanges) return;

    try {
      setIsUpdating(true);
      const payload = {
        prompt,
        maxToken,
        temperature,
        similarityThreshold,
        chunkLimit,
      };

      console.log("Updating collection config:", payload);

      const response = await dispatch(
        updateConfigCollection(selectedCollectionId, payload)
      );

      if (response.success) {
        notifySuccess(response.message || "Cập nhật thành công");
        setOriginalConfig({
          prompt,
          maxToken,
          temperature,
          chunkLimit,
          similarityThreshold,
        });
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error("Update error:", error);
      notifyError(error.message || "Không thể cập nhật collection");
    } finally {
      setIsUpdating(false);
    }
  };

  const resetToDefaults = () => {
    const defaults = {
      prompt: "",
      maxToken: 1000,
      temperature: 0.7,
      chunkLimit: 5,
      similarityThreshold: 0.2,
    };

    setPrompt?.(defaults.prompt);
    setMaxToken?.(defaults.maxToken);
    setTemperature?.(defaults.temperature);
    setChunkLimit?.(defaults.chunkLimit);
    setSimilarityThreshold?.(defaults.similarityThreshold);
  };

  const resetToOriginal = () => {
    if (originalConfig.prompt !== undefined) {
      setPrompt?.(originalConfig.prompt);
      setMaxToken?.(originalConfig.maxToken);
      setTemperature?.(originalConfig.temperature);
      setChunkLimit?.(originalConfig.chunkLimit);
      setSimilarityThreshold?.(originalConfig.similarityThreshold);
    }
  };

  return (
    <div className="w-3/12 h-full items-center p-[10px]">
      <div className="w-full h-full flex flex-col gap-[20px] border-[1px] border-dark-800 rounded-md p-4 overflow-y-auto">
        {/* Information Section */}
        <div
          className={`text-sm ${
            isDarkMode ? "text-light-800 " : "text-light-50"
          }`}
        >
          <h3 className="font-semibold mb-2">Thông tin phiên chat</h3>

          <div className="space-y-1">
            {/* Collection Selection */}
            <div className="space-y-2">
              {!collectionId ? (
                <div className="flex items-center gap-[5px]">
                  <p className="font-medium">Collection:</p>
                  {collections?.length === 0 ? (
                    <p className="text-gray-300">Đang tải...</p>
                  ) : (
                    <select
                      disabled={loading}
                      className="outline-none border-[1px] border-dark-800 px-[10px] py-[3px] rounded-md text-sm flex-1"
                      value={collectionId || ""}
                      onChange={handleChangeCollection}
                    >
                      <option value="" disabled>
                        Chọn collection...
                      </option>
                      {collections.map((collection) => (
                        <option key={collection._id} value={collection._id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                ""
              )}

              {collectionId && (
                <div className="flex items-center gap-[5px]">
                  <p className="font-medium">Collection ID:</p>
                  <p className="text-sm text-gray-500 break-all">
                    {collectionId}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-[5px]">
              <p className="font-medium">Collection Name:</p>
              {selectedCollectionName && !collectionName && (
                <div className="space-y-2">
                  <div className="flex items-center gap-[5px]">
                    {selectedCollectionName}
                  </div>
                </div>
              )}
              {collectionName && !selectedCollectionName && (
                <div className="space-y-2">
                  <div className="flex items-center gap-[5px]">
                    {displayCollectionName}
                  </div>
                </div>
              )}
            </div>

            <p>
              <span className="font-medium">Số tin nhắn:</span>{" "}
              {messagesLength || 0}
            </p>
            <p>
              <span className="font-medium">Model AI:</span>{" "}
              {selectedAiModel?.name || "Chưa chọn"}
            </p>
            <p>
              <span className="font-medium">Trạng thái:</span>{" "}
              {loading ? "Đang tải..." : "Sẵn sàng"}
            </p>
          </div>

          {/* Context Section */}
          {conversationContext && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h4 className="font-semibold mb-2 text-gray-700">Context:</h4>
              <p className="text-xs text-gray-600 mb-2">
                {conversationContext.summary}
              </p>

              {conversationContext.keyPoints?.length > 0 && (
                <>
                  <h5 className="font-semibold text-xs text-gray-700 mb-1">
                    Điểm chính:
                  </h5>
                  <ul className="text-xs list-disc list-inside text-gray-600 space-y-1">
                    {conversationContext.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Related Documents */}
          {section?.context?.relevantChunks && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md relative">
              <h4 className="font-semibold mb-1 text-blue-700">
                Tài liệu liên quan:
              </h4>
              <p className="text-xs text-blue-600">
                {section.context.relevantChunks.length} đoạn văn bản được tham
                khảo
              </p>
              <div className="h-[300px] w-full flex flex-col overflow-y-auto bg-light-50 z-50 p-[5px] rounded-md">
                {section?.context?.relevantChunks.map((chunk) => (
                  <div key={chunk._id} className="text-[0.8rem] py-[10px]">
                    <div className="w-full flex flex-col mb-2 p-[5px] border-1 border-dark-800 rounded-sm">
                      <h1>Tên tài liệu: {chunk?.metadata?.fileName}</h1>
                      <p className="text-[0.76rem]">
                        Tạo lúc:{" "}
                        {formatDateDDMMYYHHMMSS(chunk?.metadata?.createdAt)}
                      </p>
                      <p>Nguồn {chunk?.metadata?.source}</p>
                    </div>
                    <p>{chunk.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Parameter Settings */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700">
              Cài đặt tham số AI
            </h3>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-600">Chưa lưu</span>
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Max Token */}
          <SettingSlider
            label="Max Token"
            value={maxToken}
            onChange={setMaxToken}
            min={100}
            max={10000}
            step={100}
            disabled={isSubmitting || isUpdating}
          />

          {/* Temperature */}
          <SettingSlider
            label="Temperature"
            value={temperature}
            onChange={setTemperature}
            min={0}
            max={2}
            step={0.1}
            disabled={isSubmitting || isUpdating}
            note="Thấp: Tập trung hơn | Cao: Sáng tạo hơn"
          />

          {/* Chunk Limit */}
          <SettingSlider
            label="Số lượng đoạn văn"
            value={chunkLimit}
            onChange={setChunkLimit}
            min={1}
            max={20}
            step={1}
            disabled={isSubmitting || isUpdating}
            note="Số lượng đoạn văn để tham khảo"
          />

          {/* Similarity Threshold */}
          <SettingSlider
            label="Ngưỡng độ liên quan"
            value={similarityThreshold}
            onChange={setSimilarityThreshold}
            min={0}
            max={1}
            step={0.05}
            disabled={isSubmitting || isUpdating}
            note="Thấp: Linh hoạt hơn | Cao: Chính xác hơn"
          />

          {/* Action buttons */}
          <div className="mt-4 pt-3 border-t space-y-2">
            {hasUnsavedChanges && (
              <button
                onClick={updateConfigCollectionHandle}
                disabled={isSubmitting || isUpdating}
                className="w-full text-xs px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdating ? "Đang lưu..." : "💾 Lưu cài đặt"}
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={resetToDefaults}
                disabled={isSubmitting || isUpdating}
                className="flex-1 text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔄 Mặc định
              </button>

              {hasUnsavedChanges && (
                <button
                  onClick={resetToOriginal}
                  disabled={isSubmitting || isUpdating}
                  className="flex-1 text-xs px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ↶ Hoàn tác
                </button>
              )}
            </div>
          </div>
        </div>

        {/* System Context Prompt */}
        <div className="w-full h-full flex flex-col flex-1 min-h-0">
          <h3 className="font-bold text-sm pb-[5px] text-gray-700">
            Ngữ cảnh hệ thống
          </h3>
          <div className="w-full h-full min-h-[300px] flex flex-col flex-1 border-[1px] border-dark-800 rounded-md p-[10px] text-sm min-h-0">
            <textarea
              className="w-full h-full min-h-full flex-1 text-sm outline-none resize-none"
              placeholder="Thêm prompt để AI trả lời chính xác hơn..."
              disabled={isSubmitting || isUpdating}
              value={prompt || ""}
              onChange={(e) => setPrompt?.(e.target.value)}
            />
          </div>

          {/* Usage Tips */}
          <div className="mt-2 text-xs text-gray-500">
            <p className="mb-1">
              💡 <strong>Gợi ý:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Mô tả vai trò AI (VD: "Bạn là chuyên gia về...")</li>
              <li>Định dạng câu trả lời mong muốn</li>
              <li>Ngữ cảnh cụ thể của cuộc trò chuyện</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Setting Slider Component - Enhanced with better validation
const SettingSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  note,
}) => {
  const formatValue = (v) => {
    if (typeof v !== "number") return "0";
    return v < 1 ? v.toFixed(2) : v.toFixed(0);
  };

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue) && onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
};

export default ChatSidebar;
