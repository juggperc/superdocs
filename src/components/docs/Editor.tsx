"use client"

import {
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo, Redo,
  Heading1, Heading2, Heading3,
  Quote, Code, Strikethrough,
  Image as ImageIcon, CheckSquare, Link as LinkIcon,
  Highlighter, Palette, Video,
  CloudUpload, CheckCircle2, Download, MousePointer2,
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
import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { DraggableCodeBlock } from "./extensions/DraggableCodeBlock"
import { WrappableImage } from "./extensions/WrappableImage"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import { saveAs } from "file-saver"

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
  const [wordCount, setWordCount] = useState(0)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const cursorAnimRef = useRef<number | null>(null)

  const triggerSave = useCallback(() => {
    setIsSaving(true)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => setIsSaving(false), 1000)
  }, [])

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
      const text = editor.state.doc.textContent
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
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

  useEffect(() => {
    if (editor) {
      const text = editor.state.doc.textContent
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0)
    }
  }, [editor])

  useEffect(() => {
    if (isAgentActive && canvasRef.current) {
      setShowCursor(true)
      const rect = canvasRef.current.getBoundingClientRect()
      const startX = rect.width * 0.3
      const startY = rect.height * 0.3
      setCursorPos({ x: startX, y: startY })

      let frame = 0
      const animate = () => {
        frame++
        const t = frame * 0.02
        const newX = rect.width * 0.3 + Math.sin(t * 0.7) * 60 + t * 2
        const newY = rect.height * 0.3 + Math.cos(t * 0.5) * 30 + t * 3
        setCursorPos({ x: Math.min(newX, rect.width * 0.8), y: Math.min(newY, rect.height * 0.7) })
        cursorAnimRef.current = requestAnimationFrame(animate)
      }
      cursorAnimRef.current = requestAnimationFrame(animate)

      return () => {
        if (cursorAnimRef.current) cancelAnimationFrame(cursorAnimRef.current)
      }
    } else {
      setShowCursor(false)
      if (cursorAnimRef.current) cancelAnimationFrame(cursorAnimRef.current)
    }
  }, [isAgentActive])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    onTitleChange?.(e.target.value)
    triggerSave()
  }

  const exportDocx = useCallback(async () => {
    if (!editor) return
    const json = editor.getJSON()
    const children: Paragraph[] = []

    const processNode = (node: any) => {
      if (node.type === "heading") {
        const level = node.attrs?.level || 1
        const headingLevel = level === 1 ? HeadingLevel.HEADING_1 : level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3
        const runs = (node.content || []).map((child: any) => {
          const marks = child.marks || []
          return new TextRun({
            text: child.text || "",
            bold: marks.some((m: any) => m.type === "bold"),
            italics: marks.some((m: any) => m.type === "italic"),
            underline: marks.some((m: any) => m.type === "underline") ? {} : undefined,
            strike: marks.some((m: any) => m.type === "strike"),
            size: level === 1 ? 32 : level === 2 ? 28 : 24,
          })
        })
        children.push(new Paragraph({ heading: headingLevel, children: runs.length > 0 ? runs : [new TextRun("")] }))
      } else if (node.type === "paragraph") {
        const align = node.attrs?.textAlign
        const alignment = align === "center" ? AlignmentType.CENTER : align === "right" ? AlignmentType.RIGHT : align === "justify" ? AlignmentType.JUSTIFIED : AlignmentType.LEFT
        const runs = (node.content || []).map((child: any) => {
          const marks = child.marks || []
          return new TextRun({
            text: child.text || "",
            bold: marks.some((m: any) => m.type === "bold"),
            italics: marks.some((m: any) => m.type === "italic"),
            underline: marks.some((m: any) => m.type === "underline") ? {} : undefined,
            strike: marks.some((m: any) => m.type === "strike"),
            color: marks.find((m: any) => m.type === "textStyle")?.attrs?.color?.replace("#", "") || undefined,
          })
        })
        children.push(new Paragraph({ alignment, children: runs.length > 0 ? runs : [new TextRun("")] }))
      } else if (node.type === "bulletList" || node.type === "orderedList") {
        (node.content || []).forEach((li: any, idx: number) => {
          const paraContent = li.content?.[0]
          if (paraContent) {
            const prefix = node.type === "orderedList" ? `${idx + 1}. ` : "• "
            const runs = (paraContent.content || []).map((child: any, i: number) => {
              const marks = child.marks || []
              return new TextRun({
                text: (i === 0 ? prefix : "") + (child.text || ""),
                bold: marks.some((m: any) => m.type === "bold"),
                italics: marks.some((m: any) => m.type === "italic"),
              })
            })
            children.push(new Paragraph({ children: runs.length > 0 ? runs : [new TextRun(prefix)] }))
          }
        })
      } else if (node.type === "blockquote") {
        (node.content || []).forEach((child: any) => {
          const runs = (child.content || []).map((c: any) => new TextRun({ text: c.text || "", italics: true, color: "666666" }))
          children.push(new Paragraph({ children: [new TextRun({ text: "│ ", color: "999999" }), ...runs] }))
        })
      } else if (node.type === "codeBlock") {
        const code = node.content?.map((c: any) => c.text || "").join("") || ""
        code.split("\n").forEach((line: string) => {
          children.push(new Paragraph({ children: [new TextRun({ text: line, font: "Courier New", size: 20 })] }))
        })
      }
    }

    if (json.content) json.content.forEach(processNode)

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title, bold: true, size: 40 })] }),
          new Paragraph({ children: [new TextRun("")] }),
          ...children,
        ],
      }],
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, `${title.replace(/[^a-zA-Z0-9\s]/g, "").trim() || "document"}.docx`)
  }, [editor, title])

  if (!editor) return null

  const TB = ({ onClick, isActive, children, title: t }: { onClick: () => void; isActive?: boolean; children: React.ReactNode; title: string }) => (
    <button type="button" title={t} onClick={onClick}
      className={`p-1.5 rounded-md transition-colors ${isActive ? "bg-white/[0.10] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"}`}>
      {children}
    </button>
  )

  const Sep = () => <div className="w-px h-4 bg-white/[0.06] mx-1 shrink-0" />

  const addImage = () => {
    const input = document.createElement("input")
    input.type = "file"; input.accept = "image/*"
    input.onchange = () => {
      if (input.files?.length) {
        const reader = new FileReader()
        reader.onload = (e) => { const r = e.target?.result; if (typeof r === "string") editor.chain().focus().setImage({ src: r }).run() }
        reader.readAsDataURL(input.files[0])
      }
    }
    input.click()
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href
    const url = window.prompt("URL", prev)
    if (url === null) return
    if (url === "") { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  const addYoutube = () => {
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
        <TB title="Embed YouTube" onClick={addYoutube}><Video className="w-3.5 h-3.5" /></TB>
        <Sep />
        <button type="button" title="Export .docx" onClick={exportDocx}
          className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors flex items-center gap-1 text-xs font-medium">
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">.docx</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div ref={canvasRef}
          className={`w-full max-w-[820px] bg-[oklch(0.14_0.005_260)] border border-white/[0.06] rounded-lg flex flex-col pt-12 pb-24 px-10 sm:px-20 transition-all duration-700 min-h-max relative ${
            isAgentActive ? "ring-1 ring-primary/50 shadow-[0_0_60px_oklch(0.65_0.18_260/15%),0_0_120px_oklch(0.65_0.18_260/8%)]" : ""
          }`}>
          {showCursor && (
            <div className="absolute pointer-events-none z-50 transition-all duration-[600ms] ease-out"
              style={{ top: cursorPos.y, left: cursorPos.x }}>
              <MousePointer2 className="w-5 h-5 text-primary drop-shadow-[0_0_8px_oklch(0.65_0.18_260/50%)] -rotate-6 transform origin-top-left" fill="currentColor" />
              <div className="bg-primary text-primary-foreground text-[9px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ml-3 whitespace-nowrap shadow-lg glow-sm">
                Warp
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium mb-3">
              <span className="flex items-center gap-1.5">
                {isSaving ? (
                  <><CloudUpload className="w-3.5 h-3.5 animate-pulse" />Saving...</>
                ) : (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70" />Saved</>
                )}
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-muted-foreground/50 font-mono text-[10px]">{wordCount} words</span>
            </div>
            <input type="text" value={title} onChange={handleTitleChange}
              className="w-full text-3xl sm:text-4xl font-bold text-foreground placeholder:text-muted-foreground/30 focus:outline-none bg-transparent tracking-tight"
              placeholder="Document Title" />
          </div>

          <EditorContent editor={editor} />
        </div>
      </div>
    </main>
  )
}
