import React from "react";

// Hàm chuyển đổi markdown content thành JSX
export const convertMarkdownToJSX = (content) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements = [];
  let currentListItems = [];
  let currentListType = null;

  const flushList = () => {
    if (currentListItems.length > 0) {
      const ListComponent = currentListType === "ordered" ? "ol" : "ul";
      elements.push(
        React.createElement(
          ListComponent,
          {
            key: `list-${elements.length}`,
            className: "list-disc list-inside space-y-2 mb-4 text-gray-700",
          },
          currentListItems.map((item, index) =>
            React.createElement("li", { key: index, className: "mb-1" }, item)
          )
        )
      );
      currentListItems = [];
      currentListType = null;
    }
  };

  const parseInlineMarkdown = (text) => {
    // Xử lý **bold text**
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushList();
      return;
    }

    // Headers (###)
    if (trimmedLine.startsWith("###")) {
      flushList();
      const headerText = trimmedLine.replace(/^#+\s*/, "");
      elements.push(
        React.createElement(
          "h3",
          {
            key: `header-${index}`,
            className: "text-xl font-semibold text-gray-800 mb-4 mt-6",
          },
          headerText
        )
      );
    }
    // Bold text as subheader
    else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      flushList();
      const headerText = trimmedLine.replace(/\*\*/g, "");
      elements.push(
        React.createElement(
          "h4",
          {
            key: `subheader-${index}`,
            className: "text-lg font-medium text-gray-700 mb-3 mt-4",
          },
          headerText
        )
      );
    }
    // Unordered list items
    else if (trimmedLine.startsWith("- ")) {
      if (currentListType !== "unordered") {
        flushList();
        currentListType = "unordered";
      }
      const itemText = trimmedLine.substring(2);
      const parsedText = parseInlineMarkdown(itemText);
      currentListItems.push(
        React.createElement("span", {
          key: `item-${index}`,
          dangerouslySetInnerHTML: { __html: parsedText },
        })
      );
    }
    // Ordered list items
    else if (/^\d+\.\s/.test(trimmedLine)) {
      if (currentListType !== "ordered") {
        flushList();
        currentListType = "ordered";
      }
      const itemText = trimmedLine.replace(/^\d+\.\s/, "");
      const parsedText = parseInlineMarkdown(itemText);
      currentListItems.push(
        React.createElement("span", {
          key: `item-${index}`,
          dangerouslySetInnerHTML: { __html: parsedText },
        })
      );
    }
    // Regular paragraphs
    else {
      flushList();
      const parsedText = parseInlineMarkdown(trimmedLine);
      elements.push(
        React.createElement("p", {
          key: `paragraph-${index}`,
          className: "text-gray-700 leading-relaxed mb-4",
          dangerouslySetInnerHTML: { __html: parsedText },
        })
      );
    }
  });

  // Flush any remaining list items
  flushList();

  return React.createElement(
    "div",
    { className: "prose max-w-none" },
    elements
  );
};

// Hàm đơn giản hơn - trả về HTML string
export const convertMarkdownToHTML = (content) => {
  if (!content) return "";

  const lines = content.split("\n");
  let html = "";
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      html += `<ul class="list-disc list-inside space-y-2 mb-4 text-gray-700">\n`;
      listItems.forEach((item) => {
        html += `  <li class="mb-1">${item}</li>\n`;
      });
      html += "</ul>\n";
      listItems = [];
      inList = false;
    }
  };

  const parseInlineMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushList();
      return;
    }

    // Headers
    if (trimmedLine.startsWith("###")) {
      flushList();
      const headerText = trimmedLine.replace(/^#+\s*/, "");
      html += `<h3 class="text-xl font-semibold text-gray-800 mb-4 mt-6">${headerText}</h3>\n`;
    }
    // Bold subheaders
    else if (trimmedLine.startsWith("**") && trimmedLine.endsWith("**")) {
      flushList();
      const headerText = trimmedLine.replace(/\*\*/g, "");
      html += `<h4 class="text-lg font-medium text-gray-700 mb-3 mt-4">${headerText}</h4>\n`;
    }
    // List items
    else if (trimmedLine.startsWith("- ")) {
      const itemText = trimmedLine.substring(2);
      const parsedText = parseInlineMarkdown(itemText);
      listItems.push(parsedText);
      inList = true;
    }
    // Numbered list
    else if (/^\d+\.\s/.test(trimmedLine)) {
      const itemText = trimmedLine.replace(/^\d+\.\s/, "");
      const parsedText = parseInlineMarkdown(itemText);
      listItems.push(parsedText);
      inList = true;
    }
    // Regular paragraphs
    else {
      flushList();
      const parsedText = parseInlineMarkdown(trimmedLine);
      html += `<p class="text-gray-700 leading-relaxed mb-4">${parsedText}</p>\n`;
    }
  });

  flushList();
  return html;
};

// Component để render markdown content
export const MarkdownRenderer = ({ content }) => {
  const htmlContent = convertMarkdownToHTML(content);

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};
