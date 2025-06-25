import {
  createCollectionHandle,
  getAllCollectionsHandle,
  getCollectionByIdHandle,
  updateCollectionHandle,
  deleteCollectionHandle,
  updateConfigCollectionHandle,
} from "../services/collection.service.js";
import chromaService from "../services/chromadb.service.js";
import chromadbService from "../services/chromadb.service.js";
import EmbedService from "../services/ragOpenAI.service.js";
const service = new EmbedService();

export const createCollectionController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const payload = req.body;
    if (
      !payload.name ||
      typeof payload.name !== "string" ||
      !payload.name.trim()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Tên Collection là bắt buộc" });
    }

    const collectionChromaDB = await chromaService.createCollection(
      payload.name,
      { owner: userId, description: payload.description }
    );
    if (collectionChromaDB.success) {
      console.log(collectionChromaDB.collection.metadata);
      const collection = await createCollectionHandle(userId, payload, {
        ...collectionChromaDB.collection.metadata,
      });
      res.status(201).json({ success: true, collection });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy tất cả Collection (có thể filter theo query)
export const getAllCollectionsController = async (req, res) => {
  try {
    const filter = req.query || {};
    const Collections = await getAllCollectionsHandle(filter);
    res.status(200).json({ success: true, data: Collections });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết một Collection theo id
export const getCollectionByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    const collection = await getCollectionByIdHandle(id);
    const documents = await service.listDocuments(collection.name);
    if (!collection) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy Collection" });
    }
    res.status(200).json({ success: true, data: { collection, documents } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cập nhật Collection
export const updateCollectionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.userId;

    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    if (
      req.body.name &&
      (typeof req.body.name !== "string" || !req.body.name.trim())
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Tên Collection không hợp lệ" });
    }

    const collection = await getCollectionByIdHandle(id);

    let updatedData = { ...req.body };
    console.log({ updatedData });

    if (collection.name !== name) {
      const chromaUpdated = await chromaService.updateCollection(
        collection.name,
        name,
        {
          description,
          owner: userId,
        }
      );
    }

    const updatedCollection = await updateCollectionHandle(id, updatedData);

    res.status(200).json({ success: true, data: updatedCollection });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateConfigCollectionController = async (req, res) => {
  try {
    const { id } = req.params;
    const { prompt, temperature, maxToken, chunkLimit, similarityThreshold } =
      req.body;

    console.log({
      prompt,
      temperature,
      maxToken,
      chunkLimit,
      similarityThreshold,
    });

    const updatedCollection = await updateConfigCollectionHandle(id, {
      prompt,
      temperature,
      maxToken,
      chunkLimit,
      similarityThreshold,
    });

    res.status(200).json({ success: true, data: updatedCollection });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa Collection
export const deleteCollectionController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    const collection = await getCollectionByIdHandle(id);
    const collectionChromaDeleted = await chromadbService.deleteCollection(
      collection.name
    );
    if (collectionChromaDeleted) {
      await deleteCollectionHandle(id);
    }
    res.status(200).json({
      success: true,
      message: "Xoá collection thành công!",
      collection,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
