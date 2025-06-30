import { Topic } from "../models/index.js";
import mongoose from "mongoose";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
    this.statusCode = 500;
  }
}

class DuplicateError extends Error {
  constructor(message) {
    super(message);
    this.name = "DuplicateError";
    this.statusCode = 409;
  }
}

export class TopicService {
  // Validate MongoDB ObjectId
  validateObjectId(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid ID format");
    }
  }

  // Validate input data
  validateTopicData(payload) {
    const errors = [];

    if (
      !payload.name ||
      typeof payload.name !== "string" ||
      payload.name.trim().length === 0
    ) {
      errors.push("Name is required and must be a non-empty string");
    }

    if (payload.name && payload.name.trim().length < 3) {
      errors.push("Name must be at least 3 characters long");
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(", "));
    }
  }

  // Simple URL validation
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Get all topics with pagination and filtering
  async getAllParentTopics(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        search = "",
        status = null,
      } = options;

      // Build query
      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      if (status !== null) {
        query.status = status;
      }

      // Calculate skip value
      const skip = (page - 1) * limit;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query with pagination
      const [topics, total] = await Promise.all([
        Topic.find({ ...query, parent: null })
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Topic.countDocuments(query),
      ]);

      return {
        success: true,
        data: topics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error in getAllTopics:", error);
      throw new DatabaseError("Failed to retrieve topics");
    }
  }

  // Get topic by ID
  async getTopicById(id) {
    try {
      this.validateObjectId(id);

      const findTopic = await Topic.findById(id)
        .lean()
        .populate("createdBy", "id fullName role")
        .populate("updatedBy", "id fullName role");

      const topicChildren = await Topic.find({ parent: id });

      if (!findTopic) {
        throw new NotFoundError(`Topic with ID ${id} not found`);
      }

      const topic = { ...findTopic, children: topicChildren };

      return {
        success: true,
        data: topic,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in getTopicById:", error);
      throw new DatabaseError("Failed to retrieve topic");
    }
  }

  // Create new topic
  async createTopic(userId, payload, image) {
    try {
      // Validate input
      this.validateTopicData(payload);
      console.log({ image });
      // Check if topic name already exists
      const existingTopic = await Topic.findOne({
        name: { $regex: `^${payload.name.trim()}$`, $options: "i" },
      });

      if (existingTopic) {
        throw new DuplicateError("Topic name already exists!");
      }

      const newTopic = new Topic({
        name: payload.name.trim(),
        image: image,
        description: payload.description?.trim() || "",
        status: payload.status || "active",
        parent: payload.parent || null,
        createdBy: userId,
      });

      const savedTopic = await newTopic.save();

      return {
        success: true,
        data: savedTopic,
        message: "Topic created successfully",
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DuplicateError) {
        throw error;
      }

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        throw new DuplicateError("Topic with this information already exists");
      }

      // Handle MongoDB validation errors
      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        throw new ValidationError(messages.join(", "));
      }

      console.error("Error in createTopic:", error);
      throw new DatabaseError("Failed to create topic");
    }
  }

  // Update topic
  async updateTopic(id, payload, image) {
    try {
      this.validateObjectId(id);
      this.validateTopicData(payload);

      // Kiểm tra topic tồn tại
      const existingTopic = await Topic.findById(id);
      if (!existingTopic) {
        throw new NotFoundError(`Topic with ID ${id} not found`);
      }
      const topicChildren = await Topic.find({ parent: id });
      // Kiểm tra trùng tên (nếu có thay đổi tên)
      if (
        payload.name &&
        payload.name.trim().toLowerCase() !== existingTopic.name.toLowerCase()
      ) {
        const duplicateTopic = await Topic.findOne({
          _id: { $ne: id },
          name: { $regex: `^${payload.name.trim()}$`, $options: "i" },
        });

        if (duplicateTopic) {
          throw new DuplicateError("Topic name already exists");
        }
      }

      // Xử lý image
      let updatedImage = existingTopic.image; // mặc định giữ nguyên
      if (image) {
        // Xóa ảnh cũ nếu có public_id
        if (existingTopic.image?.public_id) {
          await deleteFromCloudinary(existingTopic.image.public_id);
        }
        // Gán ảnh mới
        updatedImage = {
          url: image.url || "",
          public_id: image.public_id || "",
        };
      }

      // Thực hiện update
      const updatedTopic = await Topic.findByIdAndUpdate(
        id,
        {
          name: payload.name ? payload.name.trim() : existingTopic.name,
          image: updatedImage,
          description: payload.description?.trim() || existingTopic.description,
          status: payload.status || existingTopic.status,
          updatedBy: payload.updatedBy, // nếu có field này
          updatedAt: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      );
      const topicPlain = updatedTopic.toObject();
      const topic = { ...topicPlain, children: topicChildren };
      return {
        success: true,
        data: topic,
        message: "Topic updated successfully",
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof DuplicateError
      ) {
        throw error;
      }

      if (error.code === 11000) {
        throw new DuplicateError("Topic with this information already exists");
      }

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        throw new ValidationError(messages.join(", "));
      }

      console.error("Error in updateTopic:", error);
      throw new DatabaseError("Failed to update topic");
    }
  }

  // Delete topic (soft delete)
  async deleteTopic(id, hardDelete = false) {
    try {
      this.validateObjectId(id);

      const topic = await Topic.findById(id);
      if (!topic) {
        throw new NotFoundError(`Topic with ID ${id} not found`);
      }

      if (hardDelete) {
        // Hard delete - permanently remove from database
        await Topic.findByIdAndDelete(id);
        await deleteFromCloudinary(topic.public_id);
        return {
          success: true,
          message: "Topic permanently deleted",
        };
      } else {
        // Soft delete - mark as deleted
        const deletedTopic = await Topic.findByIdAndUpdate(
          id,
          {
            status: "deleted",
            deletedAt: new Date(),
          },
          { new: true }
        );

        return {
          success: true,
          data: deletedTopic,
          message: "Topic deleted successfully",
        };
      }
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in deleteTopic:", error);
      throw new DatabaseError("Failed to delete topic");
    }
  }

  // Restore deleted topic
  async restoreTopic(id) {
    try {
      this.validateObjectId(id);

      const topic = await Topic.findById(id);
      if (!topic) {
        throw new NotFoundError(`Topic with ID ${id} not found`);
      }

      if (topic.status !== "deleted") {
        throw new ValidationError("Topic is not deleted");
      }

      const restoredTopic = await Topic.findByIdAndUpdate(
        id,
        {
          status: "active",
          $unset: { deletedAt: 1 },
        },
        { new: true }
      );

      return {
        success: true,
        data: restoredTopic,
        message: "Topic restored successfully",
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      console.error("Error in restoreTopic:", error);
      throw new DatabaseError("Failed to restore topic");
    }
  }

  // Search topics with advanced options
  async searchTopics(query, options = {}) {
    try {
      if (!query || typeof query !== "string") {
        throw new ValidationError("Search query is required");
      }

      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = options;

      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
        status: { $ne: "deleted" }, // Exclude deleted topics
      };

      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const [topics, total] = await Promise.all([
        Topic.find(searchQuery)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Topic.countDocuments(searchQuery),
      ]);

      return {
        success: true,
        data: topics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
        query: query,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error("Error in searchTopics:", error);
      throw new DatabaseError("Failed to search topics");
    }
  }

  // Get topics statistics
  async getTopicsStats() {
    try {
      const stats = await Topic.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      const total = await Topic.countDocuments();

      return {
        success: true,
        data: {
          total,
          byStatus: stats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
        },
      };
    } catch (error) {
      console.error("Error in getTopicsStats:", error);
      throw new DatabaseError("Failed to get topics statistics");
    }
  }
}
