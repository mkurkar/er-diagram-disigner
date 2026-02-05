import React from 'react';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { Node } from '@xyflow/react';
import { EntityData, AttributeType } from '@/types/diagram';
import { Plus, Trash2 } from 'lucide-react';

const EntityPropertiesPanel = () => {
  const nodes = useDiagramStore((state) => state.nodes);
  const updateEntity = useDiagramStore((state) => state.updateEntity);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const updateAttribute = useDiagramStore((state) => state.updateAttribute);
  const deleteAttribute = useDiagramStore((state) => state.deleteAttribute);

  const selectedNode = nodes.find((n) => n.selected) as Node<EntityData> | undefined;

  if (!selectedNode) {
    return (
      <div className="w-80 bg-slate-50 border-l border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400">
        <p>Select a table to edit</p>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800 mb-3">Table Properties</h2>
        <div className="space-y-1">
            <label className="text-xs text-slate-500 font-medium">Table Name</label>
            <input
            className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
            value={selectedNode.data.label}
            onChange={(e) => updateEntity(selectedNode.id, { label: e.target.value })}
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attributes</h3>
            <button
                onClick={() => addAttribute(selectedNode.id)}
                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                title="Add Column"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>

        <div className="space-y-3">
            {selectedNode.data.attributes.map(attr => (
                <div key={attr.id} className="bg-slate-50 rounded p-2 border border-slate-200 group">
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            className="flex-1 bg-transparent text-sm font-medium focus:outline-none border-b border-transparent focus:border-blue-500 px-0.5"
                            value={attr.name}
                            onChange={(e) => updateAttribute(selectedNode.id, attr.id, { name: e.target.value })}
                        />
                         <button
                            onClick={() => deleteAttribute(selectedNode.id, attr.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <select
                            className="text-xs border border-slate-200 rounded px-1 py-1 bg-white"
                            value={attr.type}
                            onChange={(e) => updateAttribute(selectedNode.id, attr.id, { type: e.target.value as AttributeType })}
                        >
                            <option value="int">INT</option>
                            <option value="varchar">VARCHAR</option>
                            <option value="text">TEXT</option>
                            <option value="boolean">BOOLEAN</option>
                            <option value="date">DATE</option>
                            <option value="float">FLOAT</option>
                            <option value="decimal">DECIMAL</option>
                            <option value="json">JSON</option>
                            <option value="array">ARRAY</option>
                            <option value="image">IMAGE</option>
                            <option value="enum">ENUM</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-3">
                         <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={attr.isPrimaryKey}
                                onChange={(e) => updateAttribute(selectedNode.id, attr.id, { isPrimaryKey: e.target.checked })}
                                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-600 font-medium">PK</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={attr.isForeignKey}
                                onChange={(e) => updateAttribute(selectedNode.id, attr.id, { isForeignKey: e.target.checked })}
                                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-600 font-medium">FK</span>
                        </label>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EntityPropertiesPanel;
