import Collection from "../models/collection.model.js";

// Tạo Collection mới
export const createCollectionHandle = async (userId, payload, metadata) => {
  try {
    const { name } = payload;
    const collectionExisting = await Collection.findOne({ name });
    if (collectionExisting) {
      throw new Error({ message: "Collection đã tồn tại!" });
    }
    const collection = new Collection({ ...payload, owner: userId, metadata });
    await collection.save();
    return collection;
  } catch (error) {
    console.error("Lỗi khi tạo Collection:", error.message);
    throw error;
  }
};

// Lấy tất cả Collection (có thể filter theo owner hoặc parent)
export const getAllCollectionsHandle = async (filter = {}) => {
  try {
    const collections = await Collection.find(filter).select("-__v  ");
    return collections;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách Collection:", error.message);
    throw error;
  }
};

// Lấy chi tiết một Collection theo id
export const getCollectionByIdHandle = async (CollectionId) => {
  try {
    const collection = await Collection.findById(CollectionId)
      .populate("owner", "_id avatar fullName roles ID  ")
      .populate("embeddingTemplate")
      .select("-__v ");
    return collection;
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết Collection:", error.message);
    throw error;
  }
};

// Cập nhật Collection
export const updateCollectionHandle = async (CollectionId, payload) => {
  try {
    const { name, description, owner } = payload;
    const updatedCollection = await Collection.findByIdAndUpdate(
      CollectionId,
      {
        $set: { name, description, owner },
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    if (!updatedCollection) {
      throw new Error("Không tìm thấy Collection để cập nhật");
    }
    return updatedCollection;
  } catch (error) {
    console.error("Lỗi khi cập nhật Collection:", error.message);
    throw error;
  }
};

export const updateConfigCollectionHandle = async (collectionId, payload) => {
  try {
    const { prompt, temperature, maxToken, chunkLimit, similarityThreshold } =
      payload;
    const updatedCollection = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $set: {
          prompt,
          temperature,
          maxToken,
          chunkLimit,
          similarityThreshold,
        },
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");
    if (!updatedCollection) {
      throw new Error("Không tìm thấy Collection để cập nhật");
    }
    return updatedCollection;
  } catch (error) {
    console.error("Lỗi khi cập nhật Collection:", error.message);
    throw error;
  }
};

// Xóa Collection
export const deleteCollectionHandle = async (CollectionId) => {
  try {
    const deleted = await Collection.findByIdAndDelete(CollectionId);
    if (!deleted) {
      throw new Error("Không tìm thấy Collection để xóa");
    }
    return { message: "Xóa Collection thành công", collection: deleted };
  } catch (error) {
    console.error("Lỗi khi xóa Collection:", error.message);
    throw error;
  }
};

export const toggleActiveCollectionHandle = async (collectionId) => {
  try {
    const currentCollectionActive = await Collection.findOne({
      isActive: true,
    });
    if (currentCollectionActive) {
      currentCollectionActive.isActive = false;
      await currentCollectionActive.save();
    }
    const collection = await Collection.findByIdAndUpdate(
      collectionId,
      {
        $set: { isActive: true },
      },
      { new: true }
    );
    if (!collection) {
      throw new Error("Collection không tồn tại");
    }
    return collection;
  } catch (error) {
    console.error("Lỗi khi xóa Collection:", error.message);
    throw error;
  }
};

export const getActiveCollectionHandle = async () => {
  try {
    const collection = await Collection.findOne({ isActive: true });
    if (!collection) {
      throw new Error("Collection không tồn tại");
    }
    return collection;
  } catch (error) {
    console.error("Lỗi khi xóa Collection:", error.message);
    throw error;
  }
};
