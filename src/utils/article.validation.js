import { isValidSlug } from "../utils/slugUtils.js";

/**
 * Validation cho dữ liệu bài viết
 */

const validateSection = (section) => {
  const errors = [];

  if (!section.heading || typeof section.heading !== "string") {
    errors.push("Tiêu đề section không được để trống");
  } else if (section.heading.trim().length < 3) {
    errors.push("Tiêu đề section phải có ít nhất 3 ký tự");
  } else if (section.heading.length > 200) {
    errors.push("Tiêu đề section không được quá 200 ký tự");
  }

  if (!section.content || typeof section.content !== "string") {
    errors.push("Nội dung section không được để trống");
  } else if (section.content.trim().length < 10) {
    errors.push("Nội dung section phải có ít nhất 10 ký tự");
  }

  // Validate image nếu có
  if (section.image) {
    if (section.image.url && typeof section.image.url !== "string") {
      errors.push("URL hình ảnh không hợp lệ");
    }
    if (
      section.image.public_id &&
      typeof section.image.public_id !== "string"
    ) {
      errors.push("Public ID hình ảnh không hợp lệ");
    }
    if (
      section.image.description &&
      typeof section.image.description !== "string"
    ) {
      errors.push("Mô tả hình ảnh không hợp lệ");
    }
  }

  return errors;
};

const validateTopics = (topics) => {
  const errors = [];

  if (!Array.isArray(topics)) {
    errors.push("Topics phải là một mảng");
    return errors;
  }

  if (topics.length === 0) {
    errors.push("Bài viết phải có ít nhất 1 topic");
    return errors;
  }

  if (topics.length > 5) {
    errors.push("Bài viết không được có quá 5 topics");
  }

  topics.forEach((topic, index) => {
    if (!topic || typeof topic !== "string") {
      errors.push(`Topic thứ ${index + 1} không hợp lệ`);
    } else if (topic.length !== 24) {
      // ObjectId length
      errors.push(`Topic thứ ${index + 1} không phải ObjectId hợp lệ`);
    }
  });

  return errors;
};

const validateReferences = (references) => {
  const errors = [];

  if (!Array.isArray(references)) {
    errors.push("References phải là một mảng");
    return errors;
  }

  if (references.length > 10) {
    errors.push("Không được có quá 10 references");
  }

  references.forEach((ref, index) => {
    if (!ref || typeof ref !== "string") {
      errors.push(`Reference thứ ${index + 1} không hợp lệ`);
    } else if (ref.length > 500) {
      errors.push(`Reference thứ ${index + 1} không được quá 500 ký tự`);
    }
  });

  return errors;
};

export const validateArticleData = (data, isPartialUpdate = false) => {
  const errors = [];

  // Validate title
  if (!isPartialUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== "string") {
      errors.push("Tiêu đề không được để trống");
    } else if (data.title.trim().length < 10) {
      errors.push("Tiêu đề phải có ít nhất 10 ký tự");
    } else if (data.title.length > 200) {
      errors.push("Tiêu đề không được quá 200 ký tự");
    }
  }

  // Validate slug nếu có
  if (data.slug !== undefined) {
    if (data.slug && !isValidSlug(data.slug)) {
      errors.push(
        "Slug không hợp lệ (chỉ chứa chữ cái thường, số và dấu gạch ngang)"
      );
    }
  }

  // Validate summary
  if (!isPartialUpdate || data.summary !== undefined) {
    if (data.summary && typeof data.summary !== "string") {
      errors.push("Tóm tắt phải là chuỗi ký tự");
    } else if (data.summary && data.summary.length > 500) {
      errors.push("Tóm tắt không được quá 500 ký tự");
    }
  }

  // Validate topics
  if (!isPartialUpdate || data.topics !== undefined) {
    if (!isPartialUpdate && (!data.topics || data.topics.length === 0)) {
      errors.push("Bài viết phải có ít nhất 1 topic");
    } else if (data.topics) {
      const topicErrors = validateTopics(data.topics);
      errors.push(...topicErrors);
    }
  }

  // Validate sections
  if (!isPartialUpdate || data.sections !== undefined) {
    if (!isPartialUpdate && (!data.sections || data.sections.length === 0)) {
      errors.push("Bài viết phải có ít nhất 1 section");
    } else if (data.sections) {
      if (!Array.isArray(data.sections)) {
        errors.push("Sections phải là một mảng");
      } else {
        data.sections.forEach((section, index) => {
          const sectionErrors = validateSection(section);
          sectionErrors.forEach((error) => {
            errors.push(`Section ${index + 1}: ${error}`);
          });
        });
      }
    }
  }

  // Validate status
  if (data.status !== undefined) {
    const validStatuses = ["draft", "pending", "published", "archived"];
    if (!validStatuses.includes(data.status)) {
      errors.push("Trạng thái không hợp lệ");
    }
  }

  // Validate isFeatured
  if (data.isFeatured !== undefined && typeof data.isFeatured !== "boolean") {
    errors.push("isFeatured phải là boolean");
  }

  // Validate references
  if (data.references !== undefined) {
    const refErrors = validateReferences(data.references);
    errors.push(...refErrors);
  }

  // Validate views
  if (data.views !== undefined) {
    if (typeof data.views !== "number" || data.views < 0) {
      errors.push("Views phải là số nguyên dương");
    }
  }

  // Validate publishedAt
  if (data.publishedAt !== undefined) {
    if (
      data.publishedAt &&
      !(data.publishedAt instanceof Date) &&
      !Date.parse(data.publishedAt)
    ) {
      errors.push("publishedAt phải là ngày hợp lệ");
    }
  }

  return {
    success: errors.length === 0,
    errors: errors,
  };
};

export const validateArticleQuery = (query) => {
  const errors = [];
  const validatedQuery = {};

  // Validate page
  if (query.page !== undefined) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push("Page phải là số nguyên dương");
    } else {
      validatedQuery.page = page;
    }
  }

  // Validate limit
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push("Limit phải là số từ 1 đến 100");
    } else {
      validatedQuery.limit = limit;
    }
  }

  // Validate status
  if (query.status !== undefined) {
    const validStatuses = ["draft", "pending", "published", "archived"];
    if (!validStatuses.includes(query.status)) {
      errors.push("Status không hợp lệ");
    } else {
      validatedQuery.status = query.status;
    }
  }

  // Validate sortBy
  if (query.sortBy !== undefined) {
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "publishedAt",
      "views",
      "title",
    ];
    if (!validSortFields.includes(query.sortBy)) {
      errors.push("SortBy không hợp lệ");
    } else {
      validatedQuery.sortBy = query.sortBy;
    }
  }

  // Validate sortOrder
  if (query.sortOrder !== undefined) {
    if (!["asc", "desc"].includes(query.sortOrder)) {
      errors.push('SortOrder phải là "asc" hoặc "desc"');
    } else {
      validatedQuery.sortOrder = query.sortOrder;
    }
  }

  // Validate isFeatured
  if (query.isFeatured !== undefined) {
    if (query.isFeatured === "true") {
      validatedQuery.isFeatured = true;
    } else if (query.isFeatured === "false") {
      validatedQuery.isFeatured = false;
    } else {
      errors.push('isFeatured phải là "true" hoặc "false"');
    }
  }

  // Validate search
  if (query.search !== undefined) {
    if (typeof query.search !== "string") {
      errors.push("Search phải là chuỗi ký tự");
    } else if (query.search.length > 100) {
      errors.push("Search không được quá 100 ký tự");
    } else {
      validatedQuery.search = query.search;
    }
  }

  // Validate author
  if (query.author !== undefined) {
    if (typeof query.author !== "string" || query.author.length !== 24) {
      errors.push("Author phải là ObjectId hợp lệ");
    } else {
      validatedQuery.author = query.author;
    }
  }

  // Validate topics
  if (query.topics !== undefined) {
    if (typeof query.topics === "string") {
      if (query.topics.length === 24) {
        validatedQuery.topics = [query.topics];
      } else {
        errors.push("Topic phải là ObjectId hợp lệ");
      }
    } else if (Array.isArray(query.topics)) {
      const validTopics = query.topics.filter(
        (topic) => typeof topic === "string" && topic.length === 24
      );
      if (validTopics.length !== query.topics.length) {
        errors.push("Một hoặc nhiều topic không hợp lệ");
      } else {
        validatedQuery.topics = validTopics;
      }
    } else {
      errors.push("Topics phải là string hoặc array");
    }
  }

  return {
    success: errors.length === 0,
    errors: errors,
    data: validatedQuery,
  };
};

export default {
  validateArticleData,
  validateArticleQuery,
};
