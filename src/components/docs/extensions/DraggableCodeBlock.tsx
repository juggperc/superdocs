import { CodeBlock } from "@tiptap/extension-code-block"
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react"
import { GripVertical, Copy, Check } from "lucide-react"
import { useState } from "react"

const CodeBlockComponent = (props: any) => {
  const [copied, setCopied] = useState(false)
  const language = props.node.attrs.language || "text"

  const copyToClipboard = () => {
    if (props.node.textContent) {
      navigator.clipboard.writeText(props.node.textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <NodeViewWrapper className="code-block-wrapper relative group my-6">
      <div
        className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-white/[0.06] p-1.5 rounded text-muted-foreground hover:text-foreground"
        contentEditable={false}
        draggable
        data-drag-handle
        title="Drag to move"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="bg-[oklch(0.10_0.005_260)] rounded-lg overflow-hidden border border-white/[0.06] relative group/code">
        <div
          className="flex items-center justify-between px-4 py-2 bg-[oklch(0.12_0.005_260)] border-b border-white/[0.06]"
          contentEditable={false}
        >
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest font-mono">{language}</span>
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-1.5 rounded-md hover:bg-white/[0.06] text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover/code:opacity-100"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <pre className="p-4 overflow-x-auto text-sm text-foreground/90 m-0">
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
