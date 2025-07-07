import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  X,
  Upload,
  Eye,
  Save,
  Image,
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { fetchAllTopics } from "../../../services/topic.service";
import { useDispatch, useSelector } from "react-redux";
import Cropper from "react-easy-crop";
import { createImage } from "../../../utils/createImage";
import { createArticleHandle } from "../../../services/article.service";
// Rich Text Editor Component
const RichTextEditor = ({ value, onChange, placeholder, disabled }) => {
  const editorRef = React.useRef(null);

  const insertText = (beforeText, afterText = "") => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);

    const newText =
      value.substring(0, start) +
      beforeText +
      selectedText +
      afterText +
      value.substring(end);
    onChange({ target: { value: newText } });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + beforeText.length,
        end + beforeText.length
      );
    }, 0);
  };

  const insertList = (type) => {
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const lines = value.split("\n");
    const currentPos = start;
    let currentLine = 0;
    let charCount = 0;

    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= currentPos) {
        currentLine = i;
        break;
      }
      charCount += lines[i].length + 1;
    }

    const newLines = [...lines];
    if (type === "ordered") {
      newLines[currentLine] = `1. ${newLines[currentLine]}`;
    } else if (type === "unordered") {
      newLines[currentLine] = `• ${newLines[currentLine]}`;
    } else if (type === "roman") {
      newLines[currentLine] = `i. ${newLines[currentLine]}`;
    }

    const newText = newLines.join("\n");
    onChange({ target: { value: newText } });
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertText("**", "**"), title: "Bold" },
    { icon: Italic, action: () => insertText("*", "*"), title: "Italic" },
    { icon: List, action: () => insertList("unordered"), title: "Bullet List" },
    {
      icon: ListOrdered,
      action: () => insertList("ordered"),
      title: "Numbered List",
    },
    { icon: AlignLeft, action: () => insertText("### "), title: "Heading" },
  ];

  const customButtons = [
    { label: "i.", action: () => insertList("roman"), title: "Roman List" },
    { label: "Quote", action: () => insertText("> "), title: "Quote" },
    { label: "Code", action: () => insertText("`", "`"), title: "Inline Code" },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2 flex-wrap">
        {toolbarButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            disabled={disabled}
            className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-50"
            title={button.title}
          >
            <button.icon size={16} />
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {customButtons.map((button, index) => (
          <button
            key={index}
            type="button"
            onClick={button.action}
            disabled={disabled}
            className="px-2 py-1 text-xs rounded hover:bg-gray-200 disabled:opacity-50 font-medium"
            title={button.title}
          >
            {button.label}
          </button>
        ))}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => insertText("\n---\n")}
          disabled={disabled}
          className="px-2 py-1 text-xs rounded hover:bg-gray-200 disabled:opacity-50"
          title="Horizontal Line"
        >
          Line
        </button>
      </div>

      <textarea
        ref={editorRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={8}
        className="w-full px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
      />

      <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 text-xs text-gray-600">
        <strong>Hướng dẫn:</strong> **Bold** | *Italic* | ### Heading | 1.
        Numbered | • Bullet | i. Roman | `code` | > Quote
      </div>
    </div>
  );
};

// Content Parser Component
const ContentParser = ({ content }) => {
  const parseContent = (text) => {
    if (!text) return "";

    let html = text;

    // Headers
    html = html.replace(
      /^### (.*$)/gm,
      '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>'
    );
    html = html.replace(
      /^## (.*$)/gm,
      '<h2 class="text-xl font-semibold mb-3 mt-5">$1</h2>'
    );
    html = html.replace(
      /^# (.*$)/gm,
      '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>'
    );

    // Bold and Italic
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Code
    html = html.replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Quotes
    html = html.replace(
      /^> (.*$)/gm,
      '<blockquote class="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-2">$1</blockquote>'
    );

    // Horizontal lines
    html = html.replace(/^---$/gm, '<hr class="border-gray-300 my-4">');

    // Lists
    const lines = html.split("\n");
    let result = [];
    let inOrderedList = false;
    let inUnorderedList = false;
    let inRomanList = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/^\d+\.\s/.test(line)) {
        if (!inOrderedList) {
          result.push('<ol class="list-decimal list-inside ml-4 mb-2">');
          inOrderedList = true;
        }
        result.push(`<li class="mb-1">${line.replace(/^\d+\.\s/, "")}</li>`);
      } else if (/^[ivxlcdm]+\.\s/i.test(line)) {
        if (!inRomanList) {
          result.push(
            '<ol class="list-inside ml-4 mb-2" style="list-style-type: lower-roman;">'
          );
          inRomanList = true;
        }
        result.push(
          `<li class="mb-1">${line.replace(/^[ivxlcdm]+\.\s/i, "")}</li>`
        );
      } else if (/^[•·\-\*]\s/.test(line)) {
        if (!inUnorderedList) {
          result.push('<ul class="list-disc list-inside ml-4 mb-2">');
          inUnorderedList = true;
        }
        result.push(`<li class="mb-1">${line.replace(/^[•·\-\*]\s/, "")}</li>`);
      } else {
        if (inOrderedList) {
          result.push("</ol>");
          inOrderedList = false;
        }
        if (inUnorderedList) {
          result.push("</ul>");
          inUnorderedList = false;
        }
        if (inRomanList) {
          result.push("</ol>");
          inRomanList = false;
        }

        if (line.trim()) {
          result.push(`<p class="mb-2">${line}</p>`);
        } else {
          result.push("<br>");
        }
      }
    }

    if (inOrderedList) result.push("</ol>");
    if (inUnorderedList) result.push("</ul>");
    if (inRomanList) result.push("</ol>");

    return result.join("\n");
  };

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: parseContent(content) }}
    />
  );
};

const CreateArticle = () => {
  const dispatch = useDispatch();
  const { topics } = useSelector((state) => state.topic);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [thumbnailAfterCrop, setThumbnailAfterCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    sections: [
      {
        heading: "",
        content: "",
        imageDescription: "",
        imagePreview: null,
      },
    ],
    thumbnail: null,
    images: [],
    topics: [],
    references: [],
  });

  const [errors, setErrors] = useState({});
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    dispatch(fetchAllTopics());
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };
  console.log({ formData });
  console.log({ thumbnailPreview });

  const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg");
    });
  };

  const onCropThumnailComplete = useCallback(
    async (_, croppedAreaPixels) => {
      const croppedImageBlob = await getCroppedImg(
        imagePreview,
        croppedAreaPixels
      );
      setThumbnailAfterCrop(croppedImageBlob);
    },
    [imagePreview]
  );
  const onCropImageComplete = useCallback(
    async (_, croppedAreaPixels) => {
      const croppedImageBlob = await getCroppedImg(
        imagePreview,
        croppedAreaPixels
      );
      setThumbnailAfterCrop(croppedImageBlob);
    },
    [imagePreview]
  );

  const handleSectionChange = (index, field, value) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      sections: newSections,
    }));
  };

  const handleSectionImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [`section_${index}`]: "Kích thước ảnh không được vượt quá 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          [`section_${index}`]: "Vui lòng chọn file ảnh",
        }));
        return;
      }

      const newSections = [...formData.sections];
      newSections[index].imagePreview = URL.createObjectURL(file);

      const newImages = [...formData.images];
      newImages[index] = file;

      setFormData((prev) => ({
        ...prev,
        sections: newSections,
        images: newImages,
      }));

      setErrors((prev) => ({ ...prev, [`section_${index}`]: null }));
    }
  };

  const removeSectionImage = (index) => {
    const newSections = [...formData.sections];
    newSections[index].imagePreview = null;

    const newImages = [...formData.images];
    newImages[index] = null;

    setFormData((prev) => ({
      ...prev,
      sections: newSections,
      images: newImages,
    }));
  };

  const addSection = () => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { heading: "", content: "", imageDescription: "", imagePreview: null },
      ],
      images: [...prev.images, null],
    }));
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleTopicChange = (topicId) => {
    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.includes(topicId)
        ? prev.topics.filter((id) => id !== topicId)
        : [...prev.topics, topicId],
    }));
  };

  const addReference = () => {
    setFormData((prev) => ({
      ...prev,
      references: [...prev.references, ""],
    }));
  };

  const updateReference = (index, value) => {
    const newReferences = [...formData.references];
    newReferences[index] = value;
    setFormData((prev) => ({
      ...prev,
      references: newReferences,
    }));
  };

  const removeReference = (index) => {
    setFormData((prev) => ({
      ...prev,
      references: prev.references.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    }

    if (!formData.summary.trim()) {
      newErrors.summary = "Tóm tắt không được để trống";
    }

    if (!thumbnailAfterCrop) {
      newErrors.thumbnail = "Vui lòng chọn và crop ảnh thumbnail";
    }

    formData.sections.forEach((section, index) => {
      if (!section.heading.trim()) {
        newErrors[`section_${index}_heading`] =
          "Tiêu đề phần không được để trống";
      }
      if (!section.content.trim()) {
        newErrors[`section_${index}_content`] =
          "Nội dung phần không được để trống";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      // Tạo FormData
      const formDataToSend = new FormData();

      formDataToSend.append("title", formData.title);
      formDataToSend.append("summary", formData.summary);

      // Append sections dưới dạng JSON string
      formDataToSend.append(
        "sections",
        JSON.stringify(
          formData.sections.map((section) => ({
            heading: section.heading,
            content: section.content,
            imageDescription: section.imageDescription,
          }))
        )
      );

      // Append topics dưới dạng JSON string
      formDataToSend.append("topics", JSON.stringify(formData.topics));

      // Append references dưới dạng JSON string
      formDataToSend.append(
        "references",
        JSON.stringify(formData.references.filter((ref) => ref.trim() !== ""))
      );

      const thumnail = new File([thumbnailAfterCrop], "thumbnail", {
        type: thumbnailAfterCrop.type || "image/jpeg",
      });
      if (thumnail) {
        formDataToSend.append("thumbnail", thumnail);
      }

      // Append images
      formData.images
        .filter((img) => img !== null)
        .forEach((imgFile, index) => {
          formDataToSend.append("images", imgFile);
        });

      console.log("Data to send to backend (FormData):", formDataToSend);

      // Debug: Xem FormData
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ":", pair[1]);
      }

      const response = await dispatch(createArticleHandle(formDataToSend));
      if (response.success) {
        const [formData, setFormData] = useState({
          title: "",
          summary: "",
          sections: [
            {
              heading: "",
              content: "",
              imageDescription: "",
              imagePreview: null,
            },
          ],
          thumbnail: null,
          images: [],
          topics: [],
          references: [],
        });
      }
      // Simulate API call
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Preview Modal
  const PreviewModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Xem trước bài viết</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-4">{formData.title}</h1>{" "}
              <p className="text-gray-600 mb-4">
                {topics
                  ?.filter((topic) => formData.topics.includes(topic._id))
                  .map((topic) => topic.name)}
              </p>
              <p className="text-gray-600 mb-4">{formData.summary}</p>
              <div className="w-full flex flex-col  bg-light-50 px-4 pt-4 border-1 border-dark-600  rounded-lg overflow-hidden">
                <img
                  className="w-full object-cover "
                  src={thumbnailPreview}
                  alt=""
                />
              </div>
            </div>

            {formData.sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 pb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {section.heading}
                </h2>

                {section.imagePreview && (
                  <div className="mb-4">
                    <img
                      src={section.imagePreview}
                      alt={section.imageDescription}
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    {section.imageDescription && (
                      <p className="text-sm text-gray-600 text-center mt-2">
                        {section.imageDescription}
                      </p>
                    )}
                  </div>
                )}

                <ContentParser content={section.content} />
              </div>
            ))}

            {formData.references.filter((ref) => ref.trim()).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Tài liệu tham khảo
                </h3>
                <ul className="list-disc list-inside space-y-1">
                  {formData.references
                    .filter((ref) => ref.trim())
                    .map((ref, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        {ref}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Tạo bài viết mới
        </h1>
        <p className="text-gray-600">
          Điền đầy đủ thông tin để tạo một bài viết chất lượng
        </p>
      </div>

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Ảnh đại diện */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Image size={20} />
            Ảnh đại diện bài viết (16:9) *
          </h2>

          <div className="w-full flex flex-col  bg-light-50 px-4 pt-4 rounded-lg">
            <label
              htmlFor="file-upload"
              className="w-full flex items-center justify-center py-[10px] rounded-lg border-[1px] border-dashed border-dark-700 cursor-pointer hover:border-green-500 hover:text-green-500"
            >
              <span>
                {!thumbnailPreview
                  ? "Chọn ảnh khác cho chuyên mục"
                  : "Chọn ảnh khác"}
              </span>
              <input
                disabled={loading}
                id="file-upload"
                type="file"
                accept="images/*"
                className="hidden"
                onChange={handleThumbnailChange}
              />
            </label>
            {thumbnailPreview && (
              <div className="w-full relative mt-[10px] flex items-center justify-center  rounded-lg border-[1px] border-dashed border-dark-700 cursor-pointer">
                <div className="relative w-full h-[210px] rounded-[5px] overflow-hidden p-[10px] ">
                  <Cropper
                    image={thumbnailPreview}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={onCropThumnailComplete}
                    onZoomChange={setZoom}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thông tin cơ bản */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề bài viết *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tiêu đề bài viết..."
                disabled={loading}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt bài viết *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.summary ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tóm tắt ngắn gọn về bài viết..."
                disabled={loading}
              />
              {errors.summary && (
                <p className="text-red-500 text-sm mt-1">{errors.summary}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chủ đề
              </label>
              <div className="flex flex-wrap gap-2">
                {topics?.map((topic) => (
                  <label
                    key={topic._id}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.topics.includes(topic?._id)}
                      onChange={() => handleTopicChange(topic?._id)}
                      className="text-blue-500 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <span className="text-sm">{topic?.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung bài viết */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Nội dung bài viết</h2>
            <button
              type="button"
              onClick={addSection}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              Thêm phần
            </button>
          </div>

          <div className="space-y-6">
            {formData.sections.map((section, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Phần {index + 1}</h3>
                  {formData.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      disabled={loading}
                      className="text-red-700"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiêu đề phần *
                    </label>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) =>
                        handleSectionChange(index, "heading", e.target.value)
                      }
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors[`section_${index}_heading`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder={`Tiêu đề cho phần ${index + 1}`}
                      disabled={loading}
                    />
                    {errors[`section_${index}_heading`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`section_${index}_heading`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung phần *
                    </label>
                    <RichTextEditor
                      value={section.content}
                      onChange={(e) =>
                        handleSectionChange(index, "content", e.target.value)
                      }
                      placeholder="Nhập nội dung chi tiết cho phần này..."
                      disabled={loading}
                    />
                    {errors[`section_${index}_content`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`section_${index}_content`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ảnh minh họa
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSectionImageChange(index, e)}
                        disabled={loading}
                      />
                      {section.imagePreview && (
                        <div className="relative w-32 h-20 rounded overflow-hidden">
                          <img
                            src={section.imagePreview}
                            alt="Ảnh minh họa"
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => removeSectionImage(index)}
                            className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-bl"
                            disabled={loading}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    {errors[`section_${index}`] && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors[`section_${index}`]}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả ảnh (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={section.imageDescription}
                      onChange={(e) =>
                        handleSectionChange(
                          index,
                          "imageDescription",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                      placeholder="Nhập mô tả cho ảnh (nếu có)"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tài liệu tham khảo */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Tài liệu tham khảo</h2>
          <div className="space-y-2">
            {formData.references.map((ref, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => updateReference(index, e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent border-gray-300"
                  placeholder={`Tài liệu tham khảo ${index + 1}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeReference(index)}
                  className="text-red-500 hover:text-red-700"
                  disabled={loading}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addReference}
            disabled={loading}
            className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
            Thêm tài liệu
          </button>
        </div>

        {/* Hành động */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            <Eye size={16} />
            Xem trước
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            Lưu bài viết
          </button>
        </div>
      </form>

      {showPreview && <PreviewModal />}
    </div>
  );
};

export default CreateArticle;
