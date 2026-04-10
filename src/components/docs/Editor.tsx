"use client"

import { CalendarDays, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Undo, Redo, Heading1, Heading2, Heading3, Quote, Code, Strikethrough, Image as ImageIcon, CheckSquare, Link as LinkIcon, Highlighter, Palette, Video, CloudUpload, CheckCircle2 } from "lucide-react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import YoutubeExt from '@tiptap/extension-youtube'
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
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      DraggableCodeBlock,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      WrappableImage.configure({
        inline: true,
        allowBase64: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      YoutubeExt.configure({
        controls: false,
        nocookie: true,
      }),
    ],
    content: initialContent || "",
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML())
      triggerSave()
    },
    editorProps: {
      attributes: {
        class: 'prose prose-zinc prose-lg max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-6 prose-p:text-zinc-600 prose-p:leading-relaxed focus:outline-none min-h-[400px] prose-img:rounded-xl prose-img:shadow-sm prose-img:max-w-full prose-li:my-0 prose-ul:my-2 prose-ol:my-2 prose-p:my-4 prose-a:text-blue-600 prose-a:underline',
      },
    },
  })

  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor
    }
  }, [editor, editorRef])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    onTitleChange?.(e.target.value)
    triggerSave()
  }

  if (!editor) {
    return null
  }

  const ToolbarButton = ({ onClick, isActive, children, title }: { onClick: () => void, isActive?: boolean, children: React.ReactNode, title: string }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded text-zinc-700 transition-colors ${isActive ? 'bg-zinc-200 font-semibold' : 'hover:bg-zinc-100'}`}
    >
      {children}
    </button>
  )

  const addImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0]
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result
          if (typeof result === 'string') {
            editor.chain().focus().setImage({ src: result }).run()
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)
    
    // cancelled
    if (url === null) return
    
    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    
    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const addYoutubeVideo = () => {
    const url = prompt('Enter YouTube URL')
    if (url) {
      editor.commands.setYoutubeVideo({
        src: url,
        width: Math.max(320, parseInt(editor.view.dom.clientWidth.toString(), 10)) - 80,
      })
    }
  }

  return (
    <main className="flex-1 flex flex-col bg-[#eaeaea] overflow-hidden relative">
      
      {/* Top Formatting Ribbon (Word-style) */}
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-1 shrink-0 overflow-x-auto">
        <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()} isActive={false}>
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()} isActive={false}>
          <Redo className="w-4 h-4" />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />
        
        <ToolbarButton title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')}>
          <span className="font-serif text-sm px-1 font-bold">P</span>
        </ToolbarButton>

        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />

        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
          <span className="font-serif font-bold text-sm px-1">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
          <span className="font-serif italic text-sm px-1.5">I</span>
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')}>
          <span className="font-serif underline text-sm px-1">U</span>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Highlight" onClick={() => editor.chain().focus().toggleHighlight({ color: '#fef08a' }).run()} isActive={editor.isActive('highlight')}>
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Text Color (Blue)" onClick={() => editor.chain().focus().setColor('#2563eb').run()} isActive={editor.isActive('textStyle', { color: '#2563eb' })}>
          <Palette className="w-4 h-4 text-blue-600" />
        </ToolbarButton>
        
        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />

        <ToolbarButton title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}>
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />

        <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Task List" onClick={() => editor.chain().focus().toggleTaskList().run()} isActive={editor.isActive('taskList')}>
          <CheckSquare className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')}>
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-5 bg-zinc-300 mx-2 shrink-0" />

        <ToolbarButton title="Insert Link" onClick={setLink} isActive={editor.isActive('link')}>
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert Image" onClick={addImage} isActive={editor.isActive('image')}>
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton title="Embed YouTube Video" onClick={addYoutubeVideo} isActive={false}>
          <Video className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        {/* Container simulating a Word Document / Notion Page */}
        <div 
          className={`w-full max-w-[850px] bg-white shadow-sm border border-zinc-200/60 rounded-sm sm:rounded-md flex flex-col pt-16 pb-32 px-12 sm:px-24 transition-all duration-500 min-h-max
            ${isAgentActive ? 'ring-2 ring-zinc-500/50 ring-offset-4 ring-offset-[#eaeaea] shadow-zinc-500/10 shadow-xl' : ''}
          `}
        >
          
          {/* Document Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium mb-4">
              <CalendarDays className="w-4 h-4" />
              <span>Last edited {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="mx-2 text-zinc-300">•</span>
              <span className="flex items-center gap-1.5 transition-colors">
                {isSaving ? (
                  <>
                    <CloudUpload className="w-4 h-4 animate-pulse text-zinc-500" />
                    <span className="text-zinc-500">Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-500/70" />
                    <span className="text-zinc-500">Saved to library</span>
                  </>
                )}
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              className="w-full text-5xl font-bold text-zinc-900 placeholder:text-zinc-300 focus:outline-none bg-transparent"
              placeholder="Document Title"
            />
          </div>

          {/* Tiptap Document Body */}
          <EditorContent editor={editor} />

        </div>
      </div>
    </main>
  )
}