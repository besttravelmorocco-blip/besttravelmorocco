import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Link as LinkIcon, Image as ImageIcon,
  AlignLeft, AlignCenter, AlignRight,
  Undo, Redo, Code, Minus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: content || "<p>Start writing...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  if (!editor) return null;

  const ToolbarButton = ({ onClick, icon: Icon, active, title }: any) => (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded p-1.5 transition-colors hover:bg-stone-100",
        active && "bg-stone-200 text-stone-900"
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const addLink = () => {
    const url = prompt("Enter link URL:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="rounded-lg border border-stone-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 px-3 py-2">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} icon={Bold} active={editor.isActive("bold")} title="Bold" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} icon={Italic} active={editor.isActive("italic")} title="Italic" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} icon={UnderlineIcon} active={editor.isActive("underline")} title="Underline" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} icon={Strikethrough} active={editor.isActive("strike")} title="Strikethrough" />
        <div className="w-px h-5 bg-stone-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} active={editor.isActive("heading", { level: 1 })} title="H1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} active={editor.isActive("heading", { level: 2 })} title="H2" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} icon={Heading3} active={editor.isActive("heading", { level: 3 })} title="H3" />
        <div className="w-px h-5 bg-stone-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} icon={List} active={editor.isActive("bulletList")} title="Bullet List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} active={editor.isActive("orderedList")} title="Numbered List" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} icon={Quote} active={editor.isActive("blockquote")} title="Quote" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} icon={Code} active={editor.isActive("codeBlock")} title="Code" />
        <div className="w-px h-5 bg-stone-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} icon={AlignLeft} active={editor.isActive({ textAlign: "left" })} title="Align Left" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} icon={AlignCenter} active={editor.isActive({ textAlign: "center" })} title="Align Center" />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} icon={AlignRight} active={editor.isActive({ textAlign: "right" })} title="Align Right" />
        <div className="w-px h-5 bg-stone-300 mx-1" />
        <ToolbarButton onClick={addLink} icon={LinkIcon} active={editor.isActive("link")} title="Link" />
        <ToolbarButton onClick={addImage} icon={ImageIcon} title="Image" />
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} title="Divider" />
        <div className="w-px h-5 bg-stone-300 mx-1" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} title="Undo" />
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} title="Redo" />
      </div>
      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
