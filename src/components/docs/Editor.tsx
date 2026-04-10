"use client"

import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo,
  Heading1, Heading2, Heading3,
  Quote, Code, Strikethrough,
  Image as ImageIcon, CheckSquare, Link as LinkIcon,
  Highlighter, Palette, Video,
  CloudUpload, CheckCircle2,
} from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import Link from "@tiptap/extension-link"
import Highlight from "@tiptap/extension-highlight"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import YoutubeExt from "@tiptap/extension-youtube"
import { useEffect, useState, useRef } from "react"
import { DraggableCodeBlock } from "./extensions/DraggableCodeBlock"
import { WrappableImage } from "./extensions/WrappableImage"

interface EditorProps {
  isAgentActive?: boolean
  initialContent?: string
  initialTitle?: string
  onContentChange?: (content: string) => void
  onTitleChange?: (title: string) => void
  editorRef?: any
}

export default function Editor({ isAgentActive = false, initialContent, initialTitle, onContentChange, onTitleChange, editorRef }: EditorProps) {
  const [title, setTitle] = useState(initialTitle || "Untitled Document")
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const triggerSave = () => {
    setIsSaving(true)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 1000)
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      DraggableCodeBlock,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      WrappableImage.configure({ inline: true, allowBase64: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      YoutubeExt.configure({ controls: false, nocookie: true }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
      triggerSave()
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[400px]",
      },
    },
  })

  useEffect(() => {
    if (editorRef) editorRef.current = editor
  }, [editor, editorRef])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    onTitleChange?.(e.target.value)
    triggerSave()
  }

  if (!editor) return null

  const TB = ({ onClick, isActive, children, title: t }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) => (
    <button
      type="button"
      title={t}
      onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${isActive ? "bg-white/[0.10] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"}`}
    >
      {children}
    </button>
  )

  const Sep = () => <div className="w-px h-4 bg-white/[0.06] mx-1 shrink-0" />

  const addImage = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = () => {
      if (input.files?.length) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === "string") editor.chain().focus().setImage({ src: result }).run()
        }
        reader.readAsDataURL(input.files[0])
      }
    }
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    if (url === null) return
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const addYoutubeVideo = () => {
    const url = prompt("Enter YouTube URL")
    if (url) editor.commands.setYoutubeVideo({ src: url, width: Math.max(320, parseInt(editor.view.dom.clientWidth.toString(), 10)) - 80 })
  }

  return (
    <main className="flex-1 flex flex-col overflow-hidden relative">
      <div className="h-10 glass-subtle flex items-center px-3 gap-0.5 shrink-0 overflow-x-auto border-b border-white/[0.04]">
        <TB title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo className="w-3.5 h-3.5" /></TB>
        <TB title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo className="w-3.5 h-3.5" /></TB>
        <Sep />
        <TB title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })}><Heading1 className="w-3.5 h-3.5" /></TB>
        <TB title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })}><Heading2 className="w-3.5 h-3.5" /></TB>
        <TB title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })}><Heading3 className="w-3.5 h-3.5" /></TB>
        <Sep />
        <TB title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")}><span className="text-xs font-bold px-0.5">B</span></TB>
        <TB title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")}><span className="text-xs italic px-0.5">I</span></TB>
        <TB title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")}><span className="text-xs underline px-0.5">U</span></TB>
        <TB title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")}><Strikethrough className="w-3.5 h-3.5" /></TB>
        <TB title="Highlight" onClick={() => editor.chain().focus().toggleHighlight({ color: "#854d0e" }).run()} isActive={editor.isActive("highlight")}><Highlighter className="w-3.5 h-3.5" /></TB>
        <TB title="Text Color" onClick={() => editor.chain().focus().setColor("#818cf8").run()} isActive={editor.isActive("textStyle", { color: "#818cf8" })}><Palette className="w-3.5 h-3.5 text-indigo-400" /></TB>
        <Sep />
        <TB title="Align Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })}><AlignLeft className="w-3.5 h-3.5" /></TB>
        <TB title="Align Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })}><AlignCenter className="w-3.5 h-3.5" /></TB>
        <TB title="Align Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })}><AlignRight className="w-3.5 h-3.5" /></TB>
        <TB title="Justify" onClick={() => editor.chain().focus().setTextAlign("justify").run()} isActive={editor.isActive({ textAlign: "justify" })}><AlignJustify className="w-3.5 h-3.5" /></TB>
        <Sep />
        <TB title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")}><List className="w-3.5 h-3.5" /></TB>
        <TB title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")}><ListOrdered className="w-3.5 h-3.5" /></TB>
        <TB title="Task List" onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive("taskList")}><CheckSquare className="w-3.5 h-3.5" /></TB>
        <TB title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")}><Quote className="w-3.5 h-3.5" /></TB>
        <TB title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive("codeBlock")}><Code className="w-3.5 h-3.5" /></TB>
        <Sep />
        <TB title="Insert Link" onClick={setLink} isActive={editor.isActive("link")}><LinkIcon className="w-3.5 h-3.5" /></TB>
        <TB title="Insert Image" onClick={addImage}><ImageIcon className="w-3.5 h-3.5" /></TB>
        <TB title="Embed YouTube" onClick={addYoutubeVideo}><Video className="w-3.5 h-3.5" /></TB>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div
          className={`w-full max-w-[820px] bg-[oklch(0.14_0.005_260)] border border-white/[0.06] rounded-lg flex flex-col pt-12 pb-24 px-10 sm:px-20 transition-all duration-500 min-h-max ${
            isAgentActive ? "ring-1 ring-primary/40 glow-md" : ""
          }`}
        >
          <div className="mb-8">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-3">
              <span className="flex items-center gap-1.5 transition-colors">
                {isSaving ? (
                  <>
                    <CloudUpload className="w-3.5 h-3.5 animate-pulse" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />
                    <span>Saved</span>
                  </>
                )}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent tracking-tight"
              placeholder="Document Title"
            />
          </div>

          <EditorContent editor={editor} />
        </div>
      </div>
    </main>
  )
}
