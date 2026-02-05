import React, { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { EntityData } from '@/types/diagram';
import { KeyRound, Table, Trash2, GripVertical, CheckCircle2, Ban, List, Link2 } from 'lucide-react';
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
  const enumDefinitions = useDiagramStore((state) => state.enumDefinitions);
  const edges = useDiagramStore((state) => state.edges);

  // Helper to get display type
  const getDisplayType = (attr: EntityData['attributes'][0]) => {
    if (attr.type === 'enum' && attr.enumDefinitionId) {
      const enumDef = enumDefinitions.find(e => e.id === attr.enumDefinitionId);
      return enumDef ? enumDef.name : 'ENUM';
    }
    return attr.type;
  };

  // Helper to get enum values for tooltip
  const getEnumValues = (attr: EntityData['attributes'][0]) => {
    if (attr.type === 'enum' && attr.enumDefinitionId) {
      const enumDef = enumDefinitions.find(e => e.id === attr.enumDefinitionId);
      return enumDef ? enumDef.values : [];
    }
    return [];
  };

  // Check if a column has any relations
  const hasRelations = (attrId: string) => {
    return edges.some(edge => 
      edge.data?.sourceColumnId === attrId || edge.data?.targetColumnId === attrId
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={clsx(
        "bg-white border-2 rounded-lg shadow-xl min-w-[220px] max-w-[300px] overflow-hidden transition-all duration-200 group/node",
        selected ? "border-blue-500 shadow-blue-200 ring-2 ring-blue-100" : "border-slate-200 hover:border-slate-300"
    )}>
      {/* Header with Drag Handle */}
      <div className={clsx(
        "px-3 py-2 border-b border-slate-200 flex items-center gap-2 cursor-grab active:cursor-grabbing",
        data.tableType === 'enum' ? "bg-purple-100" : data.tableType === 'view' ? "bg-blue-100" : "bg-slate-100"
      )}>
        <GripVertical className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        {data.tableType === 'enum' ? (
          <List className="w-4 h-4 text-purple-600 shrink-0" />
        ) : data.tableType === 'view' ? (
          <Table className="w-4 h-4 text-blue-600 shrink-0" />
        ) : (
          <Table className="w-4 h-4 text-slate-500 shrink-0" />
        )}
        <EditableLabel 
          value={data.label} 
          onSave={(val) => updateEntity(id, { label: val })}
          className="font-bold text-slate-700 text-sm flex-1"
          inputClassName="text-sm font-bold w-full"
        />
        {data.tableType === 'enum' && (
          <span className="text-[9px] bg-purple-200 text-purple-700 px-2 py-0.5 rounded font-semibold uppercase">
            ENUM
          </span>
        )}
        {data.tableType === 'view' && (
          <span className="text-[9px] bg-blue-200 text-blue-700 px-2 py-0.5 rounded font-semibold uppercase">
            VIEW
          </span>
        )}
      </div>

      {/* Attributes or Enum Values */}
      <div className="flex flex-col bg-white">
        {data.tableType === 'enum' ? (
          // Display enum values
          <>
            {(data.enumValues && data.enumValues.length > 0) ? (
              data.enumValues.filter(v => v.trim()).map((value, index) => (
                <div key={index} className="px-3 py-2 flex items-center gap-2 text-xs border-b border-slate-50 last:border-0 hover:bg-purple-50 transition-colors">
                  <span className="w-5 h-5 flex items-center justify-center bg-purple-100 text-purple-600 rounded-full text-[10px] font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-slate-700 font-mono">{value}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-xs text-slate-400 text-center italic">
                No enum values defined yet.
              </div>
            )}
          </>
        ) : (
          // Display regular attributes
          <>
        {data.attributes.map((attr) => (
          <div key={attr.id} className="px-3 py-2 flex items-center justify-between text-xs border-b border-slate-50 last:border-0 hover:bg-slate-50 relative group/attr transition-colors">
            {/* Left Handle for incoming connections */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`${id}-${attr.id}-left`}
              className="!bg-blue-400 !w-2.5 !h-2.5 !-left-1.5 !border-2 !border-white opacity-0 group-hover/attr:opacity-100 transition-opacity hover:!scale-125 hover:!bg-blue-600"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            
            {/* Right Handle for outgoing connections */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`${id}-${attr.id}-right`}
              className="!bg-blue-400 !w-2.5 !h-2.5 !-right-1.5 !border-2 !border-white opacity-0 group-hover/attr:opacity-100 transition-opacity hover:!scale-125 hover:!bg-blue-600"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />
            
            <div className="flex items-center gap-1.5 flex-1 min-w-0 mr-2">
               {/* PK/FK Indicators */}
               {attr.isPrimaryKey && (
                 <span title="Primary Key">
                   <KeyRound className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                 </span>
               )}
               {attr.isForeignKey && (
                 <span title="Foreign Key">
                   <KeyRound className="w-3.5 h-3.5 text-blue-400 transform rotate-45 shrink-0" />
                 </span>
               )}
               {/* Unique Indicator */}
               {attr.isUnique && (
                 <span title="Unique">
                   <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                 </span>
               )}
               {/* NOT NULL Indicator */}
               {!attr.isNullable && (
                 <span title="NOT NULL">
                   <Ban className="w-3.5 h-3.5 text-red-500 shrink-0" />
                 </span>
               )}
               {/* Has Relations Indicator */}
               {hasRelations(attr.id) && (
                 <span title="Has Relations">
                   <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                 </span>
               )}
               
               <EditableLabel 
                 value={attr.name}
                 onSave={(val) => updateAttribute(id, attr.id, { name: val })}
                 className={clsx(attr.isPrimaryKey && "font-bold text-slate-800", !attr.isPrimaryKey && "text-slate-600")}
                 inputClassName="w-full"
               />
            </div>
            
            <div className="flex items-center gap-2">
               {/* Enum Indicator with Values */}
               {attr.type === 'enum' && attr.enumDefinitionId && (
                 <span 
                   className="flex items-center gap-1 text-[9px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-medium shrink-0" 
                   title={`Enum values: ${getEnumValues(attr).join(', ')}`}
                 >
                   <List className="w-3 h-3" />
                   <span className="uppercase">{getDisplayType(attr)}</span>
                 </span>
               )}
               {/* Regular Type Display */}
               {!(attr.type === 'enum' && attr.enumDefinitionId) && (
                 <span className="text-slate-400 font-mono text-[10px] shrink-0 uppercase">{getDisplayType(attr)}</span>
               )}
               {/* Default Value Badge */}
               {attr.defaultValue && (
                 <span className="text-[9px] bg-purple-100 text-purple-600 px-1 py-0.5 rounded font-mono shrink-0" title={`Default: ${attr.defaultValue}`}>
                   ={attr.defaultValue.length > 6 ? attr.defaultValue.substring(0, 6) + '...' : attr.defaultValue}
                 </span>
               )}
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
         </>
         )}
        </div>
    </motion.div>
  );
};

export default memo(EntityNode);
