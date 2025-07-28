// Hàm làm sạch text và loại bỏ markdown
const cleanTextForSpeech = (text) => {
  return (
    text
      // Loại bỏ markdown formatting
      .replace(/\*\*(.*?)\*\*/g, "$1") // **bold** -> bold
      .replace(/\*(.*?)\*/g, "$1") // *italic* -> italic
      .replace(/__(.*?)__/g, "$1") // __underline__ -> underline
      .replace(/_(.*?)_/g, "$1") // _underline_ -> underline
      .replace(/`{3}[\s\S]*?`{3}/g, "") // ```code block``` -> remove
      .replace(/`(.*?)`/g, "$1") // `inline code` -> inline code
      .replace(/~~(.*?)~~/g, "$1") // ~~strikethrough~~ -> strikethrough

      // Loại bỏ headers
      .replace(/^#{1,6}\s+/gm, "") // # Header -> Header

      // Loại bỏ lists
      .replace(/^\s*[-*+]\s+/gm, "") // - item -> item
      .replace(/^\s*\d+\.\s+/gm, "") // 1. item -> item

      // Loại bỏ links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // ![alt](image) -> alt

      // Loại bỏ các ký tự đặc biệt
      .replace(/[#\-\*\+>|]/g, "") // Loại bỏ #, -, *, +, >, |
      .replace(/\s{2,}/g, " ") // Nhiều space -> 1 space

      // Thay thế các từ viết tắt tiếng Anh
      .replace(/\bDr\./g, "Bác sĩ")
      .replace(/\bMr\./g, "Ông")
      .replace(/\bMrs\./g, "Bà")
      .replace(/\bMs\./g, "Cô")
      .replace(/\betc\./g, "và các thứ khác")
      .replace(/\bi\.e\./g, "tức là")
      .replace(/\be\.g\./g, "ví dụ")

      // Cải thiện dấu câu cho phát âm tự nhiên
      .replace(/([.!?])\s*([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯĂÂÊÔƠƯ])/g, "$1 $2")
      .replace(/([,:;])\s*/g, "$1 ") // Thêm space sau dấu câu
      .replace(/\s*([.!?])/g, "$1") // Loại bỏ space trước dấu câu kết thúc

      // Làm sạch cuối cùng
      .trim()
      .replace(/\n+/g, " ") // Newlines -> space
      .replace(/\s+/g, " ")
  ); // Multiple spaces -> single space
};

// Hàm chia text thành các chunk nhỏ để phát âm mượt hơn
const splitTextIntoChunks = (text, maxLength = 200) => {
  if (text.length <= maxLength) return [text];

  const chunks = [];

  // Chia theo câu trước
  const sentences = text.split(/([.!?]+\s*)/);
  let currentChunk = "";

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      // Nếu câu hiện tại vẫn quá dài, chia theo từ
      if (sentence.length > maxLength) {
        const words = sentence.split(" ");
        let wordChunk = "";

        for (const word of words) {
          if ((wordChunk + " " + word).length <= maxLength) {
            wordChunk += (wordChunk ? " " : "") + word;
          } else {
            if (wordChunk.trim()) {
              chunks.push(wordChunk.trim());
            }
            wordChunk = word;
          }
        }

        currentChunk = wordChunk;
      } else {
        currentChunk = sentence;
      }
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter((chunk) => chunk.length > 0);
};

// Export functions
export { cleanTextForSpeech, splitTextIntoChunks };
