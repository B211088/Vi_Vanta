import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Table,
  Minus,
} from "lucide-react";

const TiptapEditor = ({
  content = `
    <h1>Chào mừng đến với trình soạn thảo văn bản!</h1>
    <p>Đây là một trình soạn thảo văn bản mạnh mẽ được xây dựng với <strong>Tiptap</strong> và <em>React</em>.</p>
    <p>Bạn có thể:</p>
    <ul>
      <li>Định dạng văn bản với <strong>in đậm</strong>, <em>in nghiêng</em>, <u>gạch chân</u></li>
      <li>Tạo tiêu đề các cấp độ khác nhau</li>
      <li>Thêm danh sách có thứ tự và không có thứ tự</li>
      <li>Chèn trích dẫn và code</li>
    </ul>
    <blockquote>
      <p>Hãy thử các tính năng bằng cách sử dụng thanh công cụ phía trên!</p>
    </blockquote>
  `,
  onUpdate,
  onChange,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const json = editor.getJSON();

      // Gọi callback với các format khác nhau
      onUpdate && onUpdate({ html, text, json });
      onChange && onChange({ html, text, json });
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4",
      },
    },
  });

  // Cập nhật content khi prop thay đổi
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded-md transition-all duration-200 hover:bg-gray-100 ${
        isActive ? "bg-blue-100 text-blue-600" : "text-gray-600"
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="w-full mx-auto p-6 bg-white">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Trình soạn thảo văn bản
      </h1>

      {/* Toolbar */}
      <div className="border border-gray-200 rounded-t-lg bg-gray-50 p-3">
        <div className="flex flex-wrap gap-1">
          {/* Text formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-3 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="In đậm (Ctrl+B)"
            >
              <Bold size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="In nghiêng (Ctrl+I)"
            >
              <Italic size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Gạch ngang"
            >
              <Strikethrough size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Code inline"
            >
              <Code size={16} />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex gap-1 border-r border-gray-300 pr-3 mr-3">
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              title="Tiêu đề 1"
            >
              <Heading1 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              title="Tiêu đề 2"
            >
              <Heading2 size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive("heading", { level: 3 })}
              title="Tiêu đề 3"
            >
              <Heading3 size={16} />
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-gray-300 pr-3 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Danh sách không thứ tự"
            >
              <List size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Danh sách có thứ tự"
            >
              <ListOrdered size={16} />
            </ToolbarButton>
          </div>

          {/* Other formatting */}
          <div className="flex gap-1 border-r border-gray-300 pr-3 mr-3">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive("blockquote")}
              title="Trích dẫn"
            >
              <Quote size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive("codeBlock")}
              title="Khối code"
            >
              <Code size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Đường kẻ ngang"
            >
              <Minus size={16} />
            </ToolbarButton>
          </div>

          {/* Undo/Redo */}
          <div className="flex gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              title="Hoàn tác (Ctrl+Z)"
            >
              <Undo size={16} />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              title="Làm lại (Ctrl+Y)"
            >
              <Redo size={16} />
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="border border-t-0 border-gray-200 rounded-b-lg bg-white min-h-[500px]">
        <EditorContent
          editor={editor}
          className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none p-4 focus:outline-none"
        />
      </div>

      {/* Demo usage - Hiển thị content realtime */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">
          Demo - Nội dung realtime:
        </h3>
        <div className="space-y-2">
          <div>
            <strong>HTML:</strong>
            <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
              {editor.getHTML()}
            </pre>
          </div>
          <div>
            <strong>Text:</strong>
            <p className="bg-white p-2 rounded text-sm">{editor.getText()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component showing usage
const EditorDemo = () => {
  const [editorContent, setEditorContent] = React.useState("");
  const [savedContent, setSavedContent] = React.useState("");

  const handleEditorUpdate = ({ html, text, json }) => {
    setEditorContent(html);
  };

  return (
    <div className="space-y-6">
      <TiptapEditor
        content={savedContent || undefined}
        onUpdate={handleEditorUpdate}
      />

      <div className="max-w-4xl mx-auto p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Cách sử dụng component:</h3>
        <pre className="bg-white p-3 rounded text-sm overflow-auto">
          {`// Import component
import TiptapEditor from './TiptapEditor';

// Sử dụng với state
const [content, setContent] = useState('');

const handleUpdate = ({ html, text, json }) => {
  setContent(html);
  // Lưu vào database, localStorage, etc.
};

<TiptapEditor 
  content={content}
  onUpdate={handleUpdate}
/>`}
        </pre>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setSavedContent(editorContent)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Lưu nội dung
          </button>
          <button
            onClick={() => setSavedContent("")}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorDemo;
