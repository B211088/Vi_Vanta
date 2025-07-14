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
      className="prose prose-sm max-w-none text-justify"
      dangerouslySetInnerHTML={{ __html: parseContent(content) }}
    />
  );
};

export default ContentParser;
