import Image from "@tiptap/extension-image"
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react"
import { AlignLeft, AlignCenter, AlignRight, GripVertical } from "lucide-react"

const ImageComponent = (props: any) => {
  const { src, alt, title, alignment } = props.node.attrs

  const updateAlignment = (align: string) => {
    props.updateAttributes({ alignment: align })
  }

  let alignmentClass = "my-8 flex justify-center w-full"
  if (alignment === "left") alignmentClass = "my-4 float-left mr-6 max-w-[50%]"
  else if (alignment === "right") alignmentClass = "my-4 float-right ml-6 max-w-[50%]"

  return (
    <NodeViewWrapper
      className={`image-wrapper relative group ${alignmentClass} transition-all duration-300`}
      data-alignment={alignment}
    >
      <div className={`relative inline-block ${alignment === "center" ? "" : "w-full"}`} draggable data-drag-handle>
        <img
          src={src}
          alt={alt}
          title={title}
          className={`rounded-lg border border-white/[0.06] object-cover ${props.selected ? "ring-1 ring-primary/50" : ""}`}
          style={{ maxHeight: "600px" }}
        />

        <div
          className="absolute top-3 right-3 flex gap-1 glass-strong p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
          contentEditable={false}
        >
          {(["left", "center", "right"] as const).map((align) => {
            const Icon = align === "left" ? AlignLeft : align === "center" ? AlignCenter : AlignRight
            const isActive = alignment === align || (!alignment && align === "center")
            return (
              <button
                key={align}
                type="button"
                onClick={() => updateAlignment(align)}
                className={`p-1.5 rounded-sm transition-colors ${isActive ? "bg-white/[0.10] text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"}`}
                title={`Align ${align}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            )
          })}
        </div>

        <div
          className="absolute top-3 left-3 glass-strong p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-muted-foreground hover:text-foreground"
          contentEditable={false}
          title="Drag to move"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {alignment !== "center" && <div className="clear-both" />}
    </NodeViewWrapper>
  )
}

export const WrappableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: "center",
        renderHTML: (attributes: Record<string, any>) => ({ "data-alignment": attributes.alignment }),
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent)
  },
})
