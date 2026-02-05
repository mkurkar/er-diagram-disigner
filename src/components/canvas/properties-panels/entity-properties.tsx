import React, { useState } from 'react';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { Node } from '@xyflow/react';
import { EntityData, AttributeType } from '@/types/diagram';
import { Plus, Trash2, X } from 'lucide-react';

const EntityPropertiesPanel = () => {
  const nodes = useDiagramStore((state) => state.nodes);
  const updateEntity = useDiagramStore((state) => state.updateEntity);
  const addAttribute = useDiagramStore((state) => state.addAttribute);
  const updateAttribute = useDiagramStore((state) => state.updateAttribute);
  const deleteAttribute = useDiagramStore((state) => state.deleteAttribute);
  const addUniqueConstraint = useDiagramStore((state) => state.addUniqueConstraint);
  const updateUniqueConstraint = useDiagramStore((state) => state.updateUniqueConstraint);
  const deleteUniqueConstraint = useDiagramStore((state) => state.deleteUniqueConstraint);
  const enumDefinitions = useDiagramStore((state) => state.enumDefinitions);

  const [showConstraintForm, setShowConstraintForm] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [constraintName, setConstraintName] = useState('');

  const selectedNode = nodes.find((n) => n.selected) as Node<EntityData> | undefined;

  const handleAddConstraint = () => {
    if (selectedNode && selectedColumns.length > 0) {
      const name = constraintName || `uk_${selectedColumns.length}_cols`;
      addUniqueConstraint(selectedNode.id, selectedColumns, name);
      setSelectedColumns([]);
      setConstraintName('');
      setShowConstraintForm(false);
    }
  };

  const handleColumnToggle = (columnId: string) => {
    setSelectedColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleAddEnumValue = () => {
    if (selectedNode && selectedNode.data.tableType === 'enum') {
      updateEntity(selectedNode.id, {
        enumValues: [...(selectedNode.data.enumValues || []), '']
      });
    }
  };

  const handleUpdateEnumValue = (index: number, value: string) => {
    if (selectedNode && selectedNode.data.tableType === 'enum') {
      const newValues = [...(selectedNode.data.enumValues || [])];
      newValues[index] = value;
      updateEntity(selectedNode.id, { enumValues: newValues });
    }
  };

  const handleDeleteEnumValue = (index: number) => {
    if (selectedNode && selectedNode.data.tableType === 'enum') {
      const newValues = (selectedNode.data.enumValues || []).filter((_, i) => i !== index);
      updateEntity(selectedNode.id, { enumValues: newValues });
    }
  };

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
        <div className="space-y-3">
            <div>
                <label className="text-xs text-slate-500 font-medium">Table Name</label>
                <input
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                value={selectedNode.data.label}
                onChange={(e) => updateEntity(selectedNode.id, { label: e.target.value })}
                />
            </div>
            <div>
                <label className="text-xs text-slate-500 font-medium block mb-1">Table Type</label>
                <select
                    className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                    value={selectedNode.data.tableType || 'table'}
                    onChange={(e) => {
                        const newType = e.target.value as 'table' | 'view' | 'enum';
                        updateEntity(selectedNode.id, { 
                            tableType: newType,
                            enumValues: newType === 'enum' ? [''] : undefined
                        });
                    }}
                >
                    <option value="table">Table</option>
                    <option value="view">View</option>
                    <option value="enum">Enum</option>
                </select>
            </div>
        </div>
      </div>

      {/* Enum Values Section (only shown when tableType is 'enum') */}
      {selectedNode.data.tableType === 'enum' && (
        <div className="flex-1 overflow-y-auto p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enum Values</h3>
            <button
              onClick={handleAddEnumValue}
              className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
              title="Add Enum Value"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {(selectedNode.data.enumValues || []).map((value, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleUpdateEnumValue(index, e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder={`Value ${index + 1}`}
                />
                <button
                  onClick={() => handleDeleteEnumValue(index)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all"
                  title="Remove value"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attributes Section (hidden when tableType is 'enum') */}
      {selectedNode.data.tableType !== 'enum' && (
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
                            value={attr.type === 'enum' && attr.enumDefinitionId ? attr.enumDefinitionId : attr.type}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Check if it's a custom enum ID
                                const isCustomEnum = enumDefinitions.find(ed => ed.id === value);
                                if (isCustomEnum) {
                                    updateAttribute(selectedNode.id, attr.id, { 
                                        type: 'enum',
                                        enumDefinitionId: value 
                                    });
                                } else {
                                    updateAttribute(selectedNode.id, attr.id, { 
                                        type: value as AttributeType,
                                        enumDefinitionId: undefined
                                    });
                                }
                            }}
                        >
                            <optgroup label="Standard Types">
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
                            </optgroup>
                            {enumDefinitions.length > 0 && (
                                <optgroup label="Custom Enums">
                                    {enumDefinitions.map(enumDef => (
                                        <option key={enumDef.id} value={enumDef.id}>
                                            {enumDef.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                    </div>

                    {/* Show enum values preview if enum is selected */}
                    {attr.type === 'enum' && attr.enumDefinitionId && (
                        <div className="mb-2 p-2 bg-purple-50 rounded border border-purple-200">
                            <div className="text-[10px] text-purple-600 font-medium mb-1">Enum Values:</div>
                            <div className="text-[10px] text-purple-700 font-mono">
                                {enumDefinitions.find(ed => ed.id === attr.enumDefinitionId)?.values.join(', ') || 'N/A'}
                            </div>
                        </div>
                    )}

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
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={attr.isUnique}
                                onChange={(e) => updateAttribute(selectedNode.id, attr.id, { isUnique: e.target.checked })}
                                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-600 font-medium">UQ</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!attr.isNullable}
                                onChange={(e) => updateAttribute(selectedNode.id, attr.id, { isNullable: !e.target.checked })}
                                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] text-slate-600 font-medium">NOT NULL</span>
                        </label>
                    </div>

                    {/* Default Value Input */}
                    <div className="mt-2">
                        <label className="text-[10px] text-slate-500 font-medium block mb-1">Default Value</label>
                        <input
                            type="text"
                            className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                            placeholder="NULL"
                            value={attr.defaultValue || ''}
                            onChange={(e) => updateAttribute(selectedNode.id, attr.id, { defaultValue: e.target.value || undefined })}
                        />
                    </div>
                </div>
            ))}
        </div>
      </div>
      )}

      {/* Composite Unique Constraints Section (hidden when tableType is 'enum') */}
      {selectedNode.data.tableType !== 'enum' && (
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unique Constraints</h3>
          <button
            onClick={() => setShowConstraintForm(!showConstraintForm)}
            className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
            title="Add Composite Constraint"
          >
            {showConstraintForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Add Constraint Form */}
        {showConstraintForm && (
          <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="mb-2">
              <label className="text-[10px] text-slate-600 font-medium block mb-1">Constraint Name</label>
              <input
                type="text"
                className="w-full text-xs border border-slate-300 rounded px-2 py-1"
                placeholder="e.g., uk_email_tenant"
                value={constraintName}
                onChange={(e) => setConstraintName(e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="text-[10px] text-slate-600 font-medium block mb-1">Select Columns</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {selectedNode.data.attributes.map(attr => (
                  <label key={attr.id} className="flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(attr.id)}
                      onChange={() => handleColumnToggle(attr.id)}
                      className="w-3 h-3 rounded border-slate-300 text-blue-600"
                    />
                    <span>{attr.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddConstraint}
              disabled={selectedColumns.length === 0}
              className="w-full text-xs bg-blue-600 text-white py-1 rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Constraint
            </button>
          </div>
        )}

        {/* List of Existing Constraints */}
        <div className="space-y-2">
          {(selectedNode.data.uniqueConstraints || []).map(constraint => (
            <div key={constraint.id} className="bg-slate-50 rounded p-2 border border-slate-200 group">
              <div className="flex items-center justify-between mb-1">
                <input
                  type="text"
                  className="flex-1 text-xs font-medium bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none"
                  value={constraint.name}
                  onChange={(e) => updateUniqueConstraint(selectedNode.id, constraint.id, { name: e.target.value })}
                />
                <button
                  onClick={() => deleteUniqueConstraint(selectedNode.id, constraint.id)}
                  className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="text-[10px] text-slate-500">
                Columns: {constraint.columnIds.map(colId => {
                  const attr = selectedNode.data.attributes.find(a => a.id === colId);
                  return attr?.name;
                }).filter(Boolean).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default EntityPropertiesPanel;
