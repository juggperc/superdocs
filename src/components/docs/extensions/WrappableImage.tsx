import Image from '@tiptap/extension-image'
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react'
import { AlignLeft, AlignCenter, AlignRight, GripVertical } from 'lucide-react'

const ImageComponent = (props: any) => {
  const { src, alt, title, alignment } = props.node.attrs

  const updateAlignment = (align: string) => {
    props.updateAttributes({ alignment: align })
  }

  // Alignment dictates how the image floats or centers.
  // We use margin logic to align and tailwind classes for wrapping.
  let alignmentClass = 'my-8 flex justify-center w-full' // default center
  if (alignment === 'left') {
    alignmentClass = 'my-4 float-left mr-6 max-w-[50%]'
  } else if (alignment === 'right') {
    alignmentClass = 'my-4 float-right ml-6 max-w-[50%]'
  }

  return (
    <NodeViewWrapper 
      className={`image-wrapper relative group ${alignmentClass} transition-all duration-300`}
      data-alignment={alignment}
    >
      <div 
        className={`relative inline-block ${alignment === 'center' ? '' : 'w-full'}`}
        draggable
        data-drag-handle
      >
        {/* The Image */}
        <img 
          src={src} 
          alt={alt} 
          title={title} 
          className={`rounded-xl shadow-md border border-zinc-200 object-cover ${props.selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} 
          style={{ maxHeight: '600px' }}
        />
        
        {/* Floating Alignment Controls (Top Right) */}
        <div 
          className="absolute top-3 right-3 flex gap-1 bg-white/95 backdrop-blur shadow-sm border border-zinc-200/60 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" 
          contentEditable={false}
        >
          <button 
            type="button"
            onClick={() => updateAlignment('left')} 
            className={`p-1.5 rounded-sm transition-colors ${alignment === 'left' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}
            title="Align Left (Wrap Text)"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => updateAlignment('center')} 
            className={`p-1.5 rounded-sm transition-colors ${alignment === 'center' || !alignment ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}
            title="Center Image"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => updateAlignment('right')} 
            className={`p-1.5 rounded-sm transition-colors ${alignment === 'right' ? 'bg-zinc-100 text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'}`}
            title="Align Right (Wrap Text)"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Drag Handle (Top Left) */}
        <div
          className="absolute top-3 left-3 bg-white/95 backdrop-blur shadow-sm border border-zinc-200/60 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600"
          contentEditable={false}
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      </div>
      
      {/* Clearfix for floats to prevent layout breakage on very small blocks */}
      {alignment !== 'center' && <div className="clear-both"></div>}
    </NodeViewWrapper>
  )
}

export const WrappableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alignment: {
        default: 'center',
        renderHTML: attributes => {
          return {
            'data-alignment': attributes.alignment,
          }
        },
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageComponent)
  },
})