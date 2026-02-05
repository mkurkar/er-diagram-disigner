import React from 'react';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { Edge } from '@xyflow/react';
import { ArrowLeftRight, Trash2, Type, Palette, Activity, AlertTriangle, Database } from 'lucide-react';
import { EntityData, RelationshipEdgeData } from '@/types/diagram';

const EdgePropertiesPanel = () => {
  const edges = useDiagramStore((state) => state.edges);
  const nodes = useDiagramStore((state) => state.nodes);
  const updateEdge = useDiagramStore((state) => state.updateEdge);
  const deleteEdge = useDiagramStore((state) => state.deleteEdge);

  const selectedEdge = edges.find((e) => e.selected);

  if (!selectedEdge) {
    return null;
  }

  const edgeData = selectedEdge.data as RelationshipEdgeData | undefined;
  
  // Get column information if available
  let sourceColumnInfo: { tableName: string; columnName: string; columnType: string } | null = null;
  let targetColumnInfo: { tableName: string; columnName: string; columnType: string } | null = null;
  
  if (edgeData?.sourceColumnId && edgeData?.targetColumnId) {
    const sourceNode = nodes.find(n => n.id === selectedEdge.source);
    const targetNode = nodes.find(n => n.id === selectedEdge.target);
    
    if (sourceNode?.type === 'entity') {
      const entityData = sourceNode.data as EntityData;
      const sourceAttr = entityData.attributes?.find(a => a.id === edgeData.sourceColumnId);
      if (sourceAttr) {
        sourceColumnInfo = {
          tableName: entityData.label,
          columnName: sourceAttr.name,
          columnType: sourceAttr.type
        };
      }
    }
    
    if (targetNode?.type === 'entity') {
      const entityData = targetNode.data as EntityData;
      const targetAttr = entityData.attributes?.find(a => a.id === edgeData.targetColumnId);
      if (targetAttr) {
        targetColumnInfo = {
          tableName: entityData.label,
          columnName: targetAttr.name,
          columnType: targetAttr.type
        };
      }
    }
  }

  const relationshipTypes = [
    { label: 'One ( | )', value: 'url(#marker-one)' },
    { label: 'Many ( < )', value: 'url(#marker-many)' },
    { label: 'Zero or One ( 0| )', value: 'url(#marker-zero-one)' },
    { label: 'Zero or Many ( 0< )', value: 'url(#marker-zero-many)' },
    { label: 'One or Many ( |< )', value: 'url(#marker-one-many)' },
    { label: 'None', value: undefined },
  ];

  const colors = [
    { label: 'Default', value: '#94a3b8' }, // Slate 400
    { label: 'Blue', value: '#3b82f6' },    // Blue 500
    { label: 'Red', value: '#ef4444' },     // Red 500
    { label: 'Green', value: '#22c55e' },   // Green 500
    { label: 'Amber', value: '#f59e0b' },   // Amber 500
    { label: 'Purple', value: '#a855f7' },  // Purple 500
  ];

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-slate-500" />
            Relationship Details
        </h2>
        
        <div className="space-y-5">
             {/* Column Information */}
             {sourceColumnInfo && targetColumnInfo && (
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                 <div className="flex items-center gap-2 text-xs font-medium text-blue-800">
                   <Database className="w-3.5 h-3.5" />
                   Column Relationship
                 </div>
                 <div className="text-xs space-y-1">
                   <div className="flex items-start gap-2">
                     <span className="text-slate-500 min-w-[60px]">From:</span>
                     <span className="text-slate-700 font-medium">
                       {sourceColumnInfo.tableName}.
                       <span className="text-blue-600">{sourceColumnInfo.columnName}</span>
                       <span className="text-slate-400 ml-1">({sourceColumnInfo.columnType})</span>
                     </span>
                   </div>
                   <div className="flex items-start gap-2">
                     <span className="text-slate-500 min-w-[60px]">To:</span>
                     <span className="text-slate-700 font-medium">
                       {targetColumnInfo.tableName}.
                       <span className="text-blue-600">{targetColumnInfo.columnName}</span>
                       <span className="text-slate-400 ml-1">({targetColumnInfo.columnType})</span>
                     </span>
                   </div>
                 </div>
               </div>
             )}
             
             {/* Type Warning */}
             {edgeData?.hasTypeWarning && (
               <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 flex items-start gap-2">
                 <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                 <div className="text-xs">
                   <div className="font-medium text-amber-800 mb-1">Type Mismatch Warning</div>
                   <div className="text-amber-700">{edgeData.typeWarningMessage}</div>
                 </div>
               </div>
             )}
        
             {/* Label Input */}
             <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5" /> Label
                </label>
                <input 
                    className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="e.g. has, owns, manages"
                    value={(selectedEdge.label as string) || ''}
                    onChange={(e) => updateEdge(selectedEdge.id, { label: e.target.value })}
                />
             </div>

             {/* Color Selection */}
             <div className="space-y-1.5">
                <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" /> Color
                </label>
                <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                        <button
                            key={c.value}
                            onClick={() => updateEdge(selectedEdge.id, { 
                                style: { ...selectedEdge.style, stroke: c.value } 
                            })}
                            className={`w-6 h-6 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110 ${selectedEdge.style?.stroke === c.value ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`}
                            style={{ backgroundColor: c.value }}
                            title={c.label}
                        />
                    ))}
                </div>
             </div>

             {/* Line Style */}
             <div className="space-y-1.5">
                 <label className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Style
                 </label>
                 <select 
                     className="w-full text-sm border border-slate-200 rounded px-2 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500"
                     value={selectedEdge.style?.strokeDasharray ? 'dashed' : 'solid'}
                     onChange={(e) => {
                         const isDashed = e.target.value === 'dashed';
                         updateEdge(selectedEdge.id, { 
                             style: { 
                                 ...selectedEdge.style, 
                                 strokeDasharray: isDashed ? '5,5' : undefined 
                             } 
                         });
                     }}
                 >
                     <option value="solid">Solid (Strong)</option>
                     <option value="dashed">Dashed (Weak)</option>
                 </select>
             </div>

             <div className="h-px bg-slate-100 my-2" />

             {/* Cardinality */}
             <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium">Start</label>
                    <select 
                        className="w-full text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500"
                        value={selectedEdge.markerStart as string || 'undefined'}
                        onChange={(e) => updateEdge(selectedEdge.id, { markerStart: e.target.value === 'undefined' ? undefined : e.target.value })}
                    >
                        {relationshipTypes.map(t => (
                            <option key={t.label} value={t.value || 'undefined'}>{t.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs text-slate-500 font-medium">End</label>
                    <select 
                         className="w-full text-xs border border-slate-200 rounded px-1.5 py-1.5 bg-slate-50 focus:outline-none focus:border-blue-500"
                         value={selectedEdge.markerEnd as string || 'undefined'}
                         onChange={(e) => updateEdge(selectedEdge.id, { markerEnd: e.target.value === 'undefined' ? undefined : e.target.value })}
                    >
                        {relationshipTypes.map(t => (
                            <option key={t.label} value={t.value || 'undefined'}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={() => deleteEdge(selectedEdge.id)}
                className="w-full flex items-center justify-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 py-2 rounded text-xs font-semibold transition-colors mt-4"
            >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Relationship
            </button>
        </div>
      </div>
    </div>
  );
};

export default EdgePropertiesPanel;
