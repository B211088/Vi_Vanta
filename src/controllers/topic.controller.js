import { TopicService } from "../services/topic.service.js";
import { uploads } from "../utils/uploadImagesToCloud.js";

const topicService = new TopicService();

export class TopicController {
  // Error handler helper
  handleError(res, error) {
    console.error("Controller Error:", error);

    // Custom error responses
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: error.message,
      });
    }

    if (error.name === "NotFoundError") {
      return res.status(404).json({
        success: false,
        error: "Not Found",
        message: error.message,
      });
    }

    if (error.name === "DuplicateError") {
      return res.status(409).json({
        success: false,
        error: "Duplicate Error",
        message: error.message,
      });
    }

    if (error.name === "DatabaseError") {
      return res.status(500).json({
        success: false,
        error: "Database Error",
        message: "An error occurred while processing your request",
      });
    }

    // MongoDB specific errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid ID",
        message: "Invalid ID format provided",
      });
    }

    // Generic error
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Something went wrong",
    });
  }

  // Get all topics with pagination and filtering
  getAllParentTopics = async (req, res) => {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
        search: req.query.search || "",
        status: req.query.status || null,
      };

      const result = await topicService.getAllParentTopics(options);

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get topic by ID
  getTopicById = async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(200).json("Thiếu ID!");
      }
      const result = await topicService.getTopicById(id);
      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Create topic
  createTopic = async (req, res) => {
    try {
      const userId = req.user.userId;
      const file = req.file;
      console.log({ file });

      const payload = req.body;
      const uploadedImage = await uploads(file, userId, "topic");

      const result = await topicService.createTopic(
        userId,
        payload,
        uploadedImage
      );

      res.status(201).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Update topic
  updateTopic = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const file = req.file;

      let imageUploaded = null;
      if (file) {
        imageUploaded = await uploads(file, userId, "topic");
      }
      const result = await topicService.updateTopic(
        id,
        req.body,
        imageUploaded
      );

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Delete topic (soft delete by default)
  deleteTopic = async (req, res) => {
    try {
      const { id } = req.params;
      const hardDelete = req.query.hard === "true";

      const result = await topicService.deleteTopic(id, hardDelete);

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Restore deleted topic
  restoreTopic = async (req, res) => {
    try {
      const { id } = req.params;
      const result = await topicService.restoreTopic(id);

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Search topics
  searchTopics = async (req, res) => {
    try {
      const { q: query } = req.query;
      console.log(req.query);
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || "createdAt",
        sortOrder: req.query.sortOrder || "desc",
      };

      const result = await topicService.searchTopics(query, options);

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };

  // Get topics statistics
  getTopicsStats = async (req, res) => {
    try {
      const result = await topicService.getTopicsStats();

      res.status(200).json(result);
    } catch (error) {
      this.handleError(res, error);
    }
  };
}
