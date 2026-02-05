import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { EntityData } from '@/types/diagram';
import { KeyRound, Table, Trash2, GripVertical } from 'lucide-react';
import clsx from 'clsx';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { motion } from 'framer-motion';

// Helper component for inline editing
const EditableLabel = ({ 
  value, 
  onSave, 
  className, 
  inputClassName 
}: { 
  value: string; 
  onSave: (val: string) => void;
  className?: string;
  inputClassName?: string;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setLocalValue(value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localValue.trim() !== value) {
      onSave(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Stop propagation so backspace/delete doesn't remove the node/attribute
    e.stopPropagation(); 
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setLocalValue(value);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={clsx("min-w-0 bg-white border border-blue-400 rounded px-1 outline-none text-slate-800", inputClassName)}
      />
    );
  }

  return (
    <span onDoubleClick={handleDoubleClick} className={clsx("cursor-text truncate min-w-[20px]", className)}>
      {value}
    </span>
  );
};

const EntityNode = ({ id, data, selected }: NodeProps<Node<EntityData>>) => {
  const updateEntity = useDiagramStore((state) => state.updateEntity);
  const updateAttribute = useDiagramStore((state) => state.updateAttribute);
  const deleteAttribute = useDiagramStore((state) => state.deleteAttribute);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "bg-white border-2 rounded-lg shadow-xl min-w-[220px] max-w-[300px] overflow-hidden transition-all duration-200 group/node",
        selected ? "border-blue-500 shadow-blue-200 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
    )}>
      {/* Header with Drag Handle */}
      <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex items-center gap-2 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        <Table className="w-4 h-4 text-slate-500 shrink-0" />
        <EditableLabel 
          value={data.label} 
          onSave={(val) => updateEntity(id, { label: val })}
          className="font-bold text-slate-700 text-sm flex-1"
          inputClassName="text-sm font-bold w-full"
        />
      </div>

      {/* Attributes */}
      <div className="flex flex-col bg-white">
        {data.attributes.map((attr) => (
          <div key={attr.id} className="px-3 py-2 flex items-center justify-between text-xs border-b border-slate-50 last:border-0 hover:bg-slate-50 relative group/attr transition-colors">
            <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
               {/* PK/FK Indicators */}
               {attr.isPrimaryKey && <KeyRound className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
               {attr.isForeignKey && <KeyRound className="w-3.5 h-3.5 text-blue-400 transform rotate-45 shrink-0" />}
               
               <EditableLabel 
                 value={attr.name}
                 onSave={(val) => updateAttribute(id, attr.id, { name: val })}
                 className={clsx(attr.isPrimaryKey && "font-bold text-slate-800", !attr.isPrimaryKey && "text-slate-600")}
                 inputClassName="w-full"
               />
            </div>
            
            <div className="flex items-center gap-2">
               <span className="text-slate-400 font-mono text-[10px] shrink-0 uppercase">{attr.type}</span>
               {/* Inline Delete Button */}
               <button 
                 onClick={(e) => { e.stopPropagation(); deleteAttribute(id, attr.id); }}
                 className="opacity-0 group-hover/attr:opacity-100 p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all"
                 title="Remove attribute"
               >
                 <Trash2 className="w-3.5 h-3.5" />
               </button>
            </div>
          </div>
        ))}
        
        {data.attributes.length === 0 && (
           <div className="p-4 text-xs text-slate-400 text-center italic">
             No attributes yet.<br/>Press <span className="font-bold">Shift + A</span> to add one.
           </div>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="!bg-slate-300 !w-3 !h-3 !-left-1.5 !border-2 !border-white transition-all hover:!bg-blue-500 hover:!w-4 hover:!h-4" />
      <Handle type="source" position={Position.Right} className="!bg-slate-300 !w-3 !h-3 !-right-1.5 !border-2 !border-white transition-all hover:!bg-blue-500 hover:!w-4 hover:!h-4" />
      <Handle type="target" position={Position.Top} className="!bg-slate-300 !w-3 !h-3 !-top-1.5 !border-2 !border-white transition-all hover:!bg-blue-500 hover:!w-4 hover:!h-4" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-300 !w-3 !h-3 !-bottom-1.5 !border-2 !border-white transition-all hover:!bg-blue-500 hover:!w-4 hover:!h-4" />
    </motion.div>
  );
};

export default memo(EntityNode);
