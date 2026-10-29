"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";

export default function EditorTexto({ onSalvar }) {
  const [mounted, setMounted] = useState(false);

  // Garante que o editor só renderize no navegador
  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Insira observações clínicas privadas aqui...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4",
      },
    },
    onUpdate: ({ editor }) => {
      if (onSalvar) {
        onSalvar(editor.getHTML());
      }
    },
  });

  // Se não estiver montado ou o editor não estiver pronto, não mostra nada (evita o erro)
  if (!mounted || !editor) {
    return (
      <div className="border border-gray-200 rounded-xl bg-white p-4 h-[300px] flex items-center justify-center text-gray-400">
        Carregando editor...
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-300 font-bold" : ""}`}
        >
          B
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 italic ${editor.isActive("italic") ? "bg-gray-300" : ""}`}
        >
          I
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive("bulletList") ? "bg-gray-300" : ""}`}
        >
          • Lista
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
