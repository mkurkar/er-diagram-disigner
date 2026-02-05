'use client';

import { useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { StickyNoteData, StickyNoteColor } from '@/types/diagram';
import { useDiagramStore } from '@/hooks/use-diagram-store';

interface StickyNotePropertiesProps {
  nodeId: string;
}

const colorOptions: { value: StickyNoteColor; label: string; previewBg: string }[] = [
  { value: 'yellow', label: 'Yellow', previewBg: 'bg-yellow-100' },
  { value: 'blue', label: 'Blue', previewBg: 'bg-blue-100' },
  { value: 'green', label: 'Green', previewBg: 'bg-green-100' },
  { value: 'pink', label: 'Pink', previewBg: 'bg-pink-100' },
  { value: 'purple', label: 'Purple', previewBg: 'bg-purple-100' },
];

export function StickyNoteProperties({ nodeId }: StickyNotePropertiesProps) {
  const nodes = useDiagramStore((state) => state.nodes);
  const updateStickyNote = useDiagramStore((state) => state.updateStickyNote);
  
  const node = nodes.find((n) => n.id === nodeId) as Node<StickyNoteData> | undefined;

  const [text, setText] = useState('');
  const [color, setColor] = useState<StickyNoteColor>('yellow');

  useEffect(() => {
    if (node && node.type === 'stickyNote') {
      setText(node.data.text);
      setColor(node.data.color);
    }
  }, [node]);

  if (!node || node.type !== 'stickyNote') {
    return null;
  }

  const handleTextChange = (newText: string) => {
    setText(newText);
    updateStickyNote(nodeId, { text: newText });
  };

  const handleColorChange = (newColor: StickyNoteColor) => {
    setColor(newColor);
    updateStickyNote(nodeId, { color: newColor });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2 text-slate-700">Sticky Note</h3>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">
          Text
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          placeholder="Enter note text..."
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">
          Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleColorChange(option.value)}
              className={`${option.previewBg} border-2 rounded-md h-12 transition-all ${
                color === option.value
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              title={option.label}
            />
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          <p>Double-click the note on the canvas to edit text inline.</p>
          <p className="mt-1">Drag the corners to resize.</p>
        </div>
      </div>
    </div>
  );
}
