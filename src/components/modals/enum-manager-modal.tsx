import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { Plus, Trash2, X, GripVertical, Table } from 'lucide-react';
import { EnumDefinition } from '@/types/diagram';

interface EnumManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EnumManagerModal = ({ open, onOpenChange }: EnumManagerModalProps) => {
  const nodes = useDiagramStore((state) => state.nodes);
  const addEnumEntity = useDiagramStore((state) => state.addEnumEntity);
  const updateEntity = useDiagramStore((state) => state.updateEntity);
  const enumDefinitions = useDiagramStore((state) => state.enumDefinitions);
  const addEnumDefinition = useDiagramStore((state) => state.addEnumDefinition);
  const updateEnumDefinition = useDiagramStore((state) => state.updateEnumDefinition);
  const deleteEnumDefinition = useDiagramStore((state) => state.deleteEnumDefinition);

  const [selectedEnumId, setSelectedEnumId] = useState<string | null>(null);
  const [newEnumName, setNewEnumName] = useState('');
  const [newEnumValues, setNewEnumValues] = useState<string[]>(['']);

  const selectedEnum = enumDefinitions.find((e) => e.id === selectedEnumId);

  const handleCreateEnum = () => {
    if (newEnumName.trim() && newEnumValues.some((v) => v.trim())) {
      const filteredValues = newEnumValues.filter((v) => v.trim());
      addEnumDefinition(newEnumName.trim(), filteredValues);
      setNewEnumName('');
      setNewEnumValues(['']);
    }
  };

  const handleUpdateEnumName = (name: string) => {
    if (selectedEnumId) {
      updateEnumDefinition(selectedEnumId, { name });
    }
  };

  const handleUpdateEnumValues = (values: string[]) => {
    if (selectedEnumId) {
      updateEnumDefinition(selectedEnumId, { values });
    }
  };

  const handleAddValueToSelected = () => {
    if (selectedEnum) {
      handleUpdateEnumValues([...selectedEnum.values, '']);
    }
  };

  const handleUpdateValueInSelected = (index: number, value: string) => {
    if (selectedEnum) {
      const newValues = [...selectedEnum.values];
      newValues[index] = value;
      handleUpdateEnumValues(newValues);
    }
  };

  const handleDeleteValueFromSelected = (index: number) => {
    if (selectedEnum && selectedEnum.values.length > 1) {
      const newValues = selectedEnum.values.filter((_, i) => i !== index);
      handleUpdateEnumValues(newValues);
    }
  };

  const handleDeleteEnum = (id: string) => {
    deleteEnumDefinition(id);
    if (selectedEnumId === id) {
      setSelectedEnumId(null);
    }
  };

  // Find if there's an enum table linked to this enum definition
  const getLinkedEnumTable = (enumDef: EnumDefinition) => {
    return nodes.find(
      (node) => 
        node.type === 'entity' && 
        node.data.tableType === 'enum' && 
        node.data.label === enumDef.name
    );
  };

  // Create or update enum table from enum definition
  const handleCreateEnumTable = (enumDef: EnumDefinition) => {
    const existingTable = getLinkedEnumTable(enumDef);
    
    if (existingTable) {
      // Update existing table
      updateEntity(existingTable.id, {
        enumValues: enumDef.values
      });
    } else {
      // Create new enum table
      addEnumEntity(enumDef.name, enumDef.values);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl w-[800px] max-h-[600px] z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200">
            <Dialog.Title className="text-lg font-semibold text-slate-800">
              Manage Enums
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left Panel - Enum List */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col">
              <div className="p-3 border-b border-slate-200">
                <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Enum Types ({enumDefinitions.length})
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {enumDefinitions.length === 0 ? (
                  <div className="text-xs text-slate-400 text-center py-8 italic">
                    No enums defined yet
                  </div>
                ) : (
                  <div className="space-y-1">
                    {enumDefinitions.map((enumDef) => {
                      const linkedTable = getLinkedEnumTable(enumDef);
                      return (
                      <div
                        key={enumDef.id}
                        className={`group flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                          selectedEnumId === enumDef.id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                        onClick={() => setSelectedEnumId(enumDef.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 truncate">
                            {enumDef.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <span>{enumDef.values.length} value{enumDef.values.length !== 1 ? 's' : ''}</span>
                            {linkedTable && (
                              <span className="inline-flex items-center gap-1 text-green-600">
                                <Table className="w-3 h-3" />
                                <span>Table</span>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateEnumTable(enumDef);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition-all"
                            title={linkedTable ? "Update enum table" : "Create enum table"}
                          >
                            <Table className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEnum(enumDef.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all"
                            title="Delete enum"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Edit Form */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedEnum ? (
                // Edit Existing Enum
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                      Enum Name
                    </label>
                    <input
                      type="text"
                      value={selectedEnum.name}
                      onChange={(e) => handleUpdateEnumName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g., UserStatus"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Values
                      </label>
                      <button
                        onClick={handleAddValueToSelected}
                        className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        title="Add value"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {selectedEnum.values.map((value, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                          <GripVertical className="w-4 h-4 text-slate-300" />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleUpdateValueInSelected(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder={`Value ${index + 1}`}
                          />
                          {selectedEnum.values.length > 1 && (
                            <button
                              onClick={() => handleDeleteValueFromSelected(index)}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Create New Enum
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Create New Enum</h3>
                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                      Enum Name
                    </label>
                    <input
                      type="text"
                      value={newEnumName}
                      onChange={(e) => setNewEnumName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="e.g., UserStatus, OrderState"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Values
                      </label>
                      <button
                        onClick={() => setNewEnumValues([...newEnumValues, ''])}
                        className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                        title="Add value"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {newEnumValues.map((value, index) => (
                        <div key={index} className="flex items-center gap-2 group">
                          <GripVertical className="w-4 h-4 text-slate-300" />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => {
                              const updated = [...newEnumValues];
                              updated[index] = e.target.value;
                              setNewEnumValues(updated);
                            }}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder={`Value ${index + 1} (e.g., active, pending)`}
                          />
                          {newEnumValues.length > 1 && (
                            <button
                              onClick={() => setNewEnumValues(newEnumValues.filter((_, i) => i !== index))}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-200">
                    <button
                      onClick={handleCreateEnum}
                      disabled={!newEnumName.trim() || !newEnumValues.some((v) => v.trim())}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Create Enum
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200">
            <Dialog.Close asChild>
              <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EnumManagerModal;
