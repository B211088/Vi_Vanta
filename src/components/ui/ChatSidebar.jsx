import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllInfoCollections } from "../../services/collection.service";

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
  const { collections } = useSelector((state) => state.collection);
  const hasInitialized = useRef(false);
  const [selectedCollectionName, setSelectedCollectionName] = useState(null);
  const formatNumber = (num) => (num < 1 ? num.toFixed(2) : num.toFixed(0));


  useEffect(() => {
    if (!collections || collections.length === 0) {
      dispatch(getAllInfoCollections());
    }
  }, [dispatch, collections]);

  useEffect(() => {
    if (
      collections?.length > 0 &&
      !collectionId &&
      setCollectionId &&
      !hasInitialized.current
    ) {
      const firstCollection = collections[0];
      setCollectionId(firstCollection._id);
      hasInitialized.current = true;
    }
  }, [collections, collectionId, setCollectionId]);

  // Find current collection based on collectionId
  const currentCollection = collections?.find((c) => c._id === collectionId);

  // Display logic for collection name and ID
  const displayCollectionName =
    currentCollection?.name || collectionName || "Chưa chọn";
  const displayCollectionId = collectionId || "Chưa chọn";

  const handleChangeCollection = (e) => {
    const selectedId = e.target.value;
    if (selectedId && setCollectionId) {
      const collection = collections.find((c) => c._id === selectedId);
      setSelectedCollectionName(collection?.name);
      setCollectionId(selectedId);
    }
  };

  return (
    <div className="w-3/12 h-full items-center p-[10px]">
      <div className="w-full h-full flex flex-col gap-[20px] border-[1px] border-dark-800 rounded-md p-4 overflow-y-auto">
        {/* Information Section */}
        <div className="text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Thông tin phiên chat</h3>

          <div className="space-y-1">
            {/* Collection Selection */}
            <div className="space-y-2">
              {!collectionId ? (
                <div className="flex items-center gap-[5px]">
                  <p className="font-medium">Collection:</p>
                  {collections?.length === 0 ? (
                    <p className="text-gray-500">Đang tải...</p>
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
            </div>{" "}
            <div className="flex items-center gap-[5px]">
              {" "}
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
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="font-semibold mb-1 text-blue-700">
                Tài liệu liên quan:
              </h4>
              <p className="text-xs text-blue-600">
                {section.context.relevantChunks.length} đoạn văn bản được tham
                khảo
              </p>
            </div>
          )}
        </div>

        {/* AI Parameter Settings */}
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3 text-sm text-gray-700">
            Cài đặt tham số AI
          </h3>

          {/* Max Token */}
          <SettingSlider
            label="Max Token"
            value={maxToken}
            onChange={setMaxToken}
            min={100}
            max={10000}
            step={100}
            disabled={isSubmitting}
          />

          {/* Temperature */}
          <SettingSlider
            label="Temperature"
            value={temperature}
            onChange={setTemperature}
            min={0}
            max={2}
            step={0.1}
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            note="Thấp: Linh hoạt hơn | Cao: Chính xác hơn"
          />

          {/* Reset button */}
          <div className="mt-4 pt-3 border-t">
            <button
              onClick={() => {
                setMaxToken?.(1000);
                setTemperature?.(0.7);
                setChunkLimit?.(5);
                setSimilarityThreshold?.(0.2);
              }}
              disabled={isSubmitting}
              className="w-full text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Đặt lại mặc định
            </button>
          </div>
        </div>

        {/* System Context Prompt */}
        <div className="w-full h-full flex flex-col flex-1 min-h-0">
          <h3 className="font-bold text-sm pb-[5px] text-gray-700">
            Ngữ cảnh hệ thống
          </h3>
          <div className="w-full h-full  min-h-[300px] flex flex-col flex-1 border-[1px] border-dark-800 rounded-md p-[10px] text-sm min-h-0">
            <textarea
              className="w-full h-full min-h-full flex-1 text-sm outline-none resize-none"
              placeholder="Thêm prompt để AI trả lời chính xác hơn..."
              disabled={isSubmitting}
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

// Setting Slider Component
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
  const formatValue = (v) => (v < 1 ? v.toFixed(2) : v.toFixed(0));

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
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
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
