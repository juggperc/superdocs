import { CodeBlock } from '@tiptap/extension-code-block'
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { GripVertical, Copy, Check } from 'lucide-react'
import { useState } from 'react'

const CodeBlockComponent = (props: any) => {
  const [copied, setCopied] = useState(false)
  const language = props.node.attrs.language || 'text'

  const copyToClipboard = () => {
    if (props.node.textContent) {
      navigator.clipboard.writeText(props.node.textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <NodeViewWrapper className="code-block-wrapper relative group my-6">
      {/* Drag handle */}
      <div
        className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-zinc-100 p-1.5 rounded text-zinc-400 hover:text-zinc-600"
        contentEditable={false}
        draggable
        data-drag-handle
        title="Drag to move"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Code block container */}
      <div className="bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 shadow-sm relative group/code">
        {/* Top bar */}
        <div 
          className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800"
          contentEditable={false}
        >
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{language}</span>
          
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors opacity-0 group-hover/code:opacity-100"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* The actual editable code content */}
        <pre className="p-4 overflow-x-auto text-sm text-zinc-100 m-0">
          <NodeViewContent className="font-mono leading-relaxed" />
        </pre>
      </div>
    </NodeViewWrapper>
  )
}

export const DraggableCodeBlock = CodeBlock.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockComponent)
  },
})