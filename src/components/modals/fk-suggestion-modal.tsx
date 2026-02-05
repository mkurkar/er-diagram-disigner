import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useDiagramStore } from '@/hooks/use-diagram-store';
import { X, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { AttributeType } from '@/types/diagram';

interface FKSuggestion {
  targetTableName: string;
  targetTableId: string;
  targetColumnName: string;
  targetColumnId: string;
  targetColumnType: AttributeType;
  suggestedFKName: string;
  relationshipType: '1:1' | '1:N' | 'N:1' | 'N:M';
}

interface FKSuggestionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: FKSuggestion | null;
  sourceTableName: string;
  sourceTableId: string;
  onAccept: (fkName: string) => void;
  onReject: () => void;
}

const FKSuggestionModal = ({ 
  open, 
  onOpenChange, 
  suggestion, 
  sourceTableName,
  sourceTableId,
  onAccept, 
  onReject 
}: FKSuggestionModalProps) => {
  const [customFKName, setCustomFKName] = useState('');
  const [useCustomName, setUseCustomName] = useState(false);

  useEffect(() => {
    if (suggestion) {
      setCustomFKName(suggestion.suggestedFKName);
      setUseCustomName(false);
    }
  }, [suggestion]);

  if (!suggestion) return null;

  const handleAccept = () => {
    const fkName = useCustomName ? customFKName : suggestion.suggestedFKName;
    onAccept(fkName);
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  const getRelationshipDescription = () => {
    switch (suggestion.relationshipType) {
      case '1:1':
        return 'One-to-One: Each record relates to exactly one record';
      case '1:N':
        return 'One-to-Many: One record can relate to many records';
      case 'N:1':
        return 'Many-to-One: Many records relate to one record';
      case 'N:M':
        return 'Many-to-Many: Requires a junction table (advanced)';
      default:
        return '';
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[500px] max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in">
          <div className="p-6">
            <Dialog.Title className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-500" />
              Create Foreign Key?
            </Dialog.Title>

            <Dialog.Description className="text-sm text-slate-600 mb-4">
              A foreign key column can be created to establish this relationship properly.
            </Dialog.Description>

            {/* Relationship Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-blue-900">Relationship Detected</span>
                  </div>
                  <div className="text-blue-700">
                    <span className="font-semibold">{suggestion.targetTableName}</span>
                    <span className="mx-1">→</span>
                    <span className="font-semibold">{sourceTableName}</span>
                  </div>
                  <div className="text-blue-600 text-xs">
                    Type: <span className="font-medium">{suggestion.relationshipType}</span>
                    <br />
                    {getRelationshipDescription()}
                  </div>
                </div>
              </div>
            </div>

            {/* FK Details */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Foreign Key Details
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">References:</span>
                    <span className="font-medium text-slate-700">
                      {suggestion.targetTableName}.{suggestion.targetColumnName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-mono text-xs text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      {suggestion.targetColumnType.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Add to:</span>
                    <span className="font-medium text-slate-700">{sourceTableName}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">
                  Foreign Key Column Name
                </label>
                {!useCustomName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={suggestion.suggestedFKName}
                      disabled
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-100 text-slate-700"
                    />
                    <button
                      onClick={() => setUseCustomName(true)}
                      className="px-3 py-2 text-xs border border-slate-300 rounded-md hover:bg-slate-50 text-slate-600"
                    >
                      Customize
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customFKName}
                      onChange={(e) => setCustomFKName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter custom FK name"
                      autoFocus
                    />
                    <button
                      onClick={() => {
                        setUseCustomName(false);
                        setCustomFKName(suggestion.suggestedFKName);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Use suggested name
                    </button>
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <div className="text-xs text-green-700">
                  The foreign key column will be created with the appropriate type and constraints automatically.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Create Foreign Key
              </button>
            </div>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
              onClick={handleReject}
            >
              <X className="w-5 h-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FKSuggestionModal;
