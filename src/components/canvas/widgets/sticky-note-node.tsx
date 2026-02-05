'use client';

import { memo, useCallback, useState, useRef, useEffect } from 'react';
import { NodeProps, NodeResizer, Node } from '@xyflow/react';
import { StickyNoteData, StickyNoteColor } from '@/types/diagram';
import { useDiagramStore } from '@/hooks/use-diagram-store';

const colorClasses: Record<StickyNoteColor, { bg: string; border: string }> = {
  yellow: { bg: 'bg-yellow-100', border: 'border-yellow-300' },
  blue: { bg: 'bg-blue-100', border: 'border-blue-300' },
  green: { bg: 'bg-green-100', border: 'border-green-300' },
  pink: { bg: 'bg-pink-100', border: 'border-pink-300' },
  purple: { bg: 'bg-purple-100', border: 'border-purple-300' },
};

function StickyNoteNode({ id, data, selected }: NodeProps<Node<StickyNoteData>>) {
  const updateStickyNote = useDiagramStore((state) => state.updateStickyNote);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(data.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const colorStyle = colorClasses[data.color] || colorClasses.yellow;

  useEffect(() => {
    setText(data.text);
  }, [data.text]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (text !== data.text) {
      updateStickyNote(id, { text });
    }
  }, [id, text, data.text, updateStickyNote]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEditing(false);
        setText(data.text);
      }
    },
    [data.text]
  );

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  return (
    <div
      className={`${colorStyle.bg} ${colorStyle.border} border-2 rounded-lg shadow-md overflow-hidden relative`}
      style={{ width: data.width, height: data.height }}
    >
      <NodeResizer
        minWidth={150}
        minHeight={100}
        isVisible={selected}
        lineClassName="!border-gray-400"
        handleClassName="!w-3 !h-3 !bg-gray-400"
        onResize={(_, params) => {
          updateStickyNote(id, {
            width: params.width,
            height: params.height,
          });
        }}
      />
      
      <div className="w-full h-full p-3 overflow-auto">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full h-full bg-transparent border-none outline-none resize-none text-sm ${colorStyle.bg}`}
            placeholder="Type your note here..."
          />
        ) : (
          <div
            onDoubleClick={handleDoubleClick}
            className="w-full h-full cursor-text whitespace-pre-wrap break-words text-sm"
          >
            {data.text || 'Double-click to edit'}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(StickyNoteNode);
