'use client';

import React, { useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  Connection,
  Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from '@/hooks/use-diagram-store';
import EntityNode from './widgets/entity-node';
import StickyNoteNode from './widgets/sticky-note-node';
import EntityPropertiesPanel from './properties-panels/entity-properties';
import { StickyNoteProperties } from './properties-panels/sticky-note-properties';
import EdgePropertiesPanel from './properties-panels/edge-properties';
import CanvasToolbar from './canvas-toolbar';
import { useShortcuts } from '@/hooks/use-shortcuts';
import { CustomEdgeMarkers } from './widgets/custom-edge-markers';
import FKSuggestionModal from '@/components/modals/fk-suggestion-modal';
import { generateFKName, shouldSuggestFK, detectRelationshipType, createFKAttribute } from '@/utils/fk-helpers';
import { EntityData, AttributeType } from '@/types/diagram';

const nodeTypes: NodeTypes = {
  entity: EntityNode as any,
  stickyNote: StickyNoteNode as any,
};

interface FKSuggestion {
  targetTableName: string;
  targetTableId: string;
  targetColumnName: string;
  targetColumnId: string;
  targetColumnType: AttributeType;
  suggestedFKName: string;
  relationshipType: '1:1' | '1:N' | 'N:1' | 'N:M';
}

const InfiniteCanvasContent = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addFKAttribute,
  } = useDiagramStore();

  const [showFKModal, setShowFKModal] = useState(false);
  const [fkSuggestion, setFKSuggestion] = useState<FKSuggestion | null>(null);
  const [pendingConnection, setPendingConnection] = useState<{
    sourceTableId: string;
    sourceTableName: string;
    connection: Connection;
  } | null>(null);

  const selectedEdge = edges.find((e) => e.selected);
  const selectedNode = nodes.find((n) => n.selected);

  useShortcuts(); // Activate keyboard shortcuts

  // Custom connection handler with FK detection
  const handleConnect = (connection: Connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    // Extract column IDs from handle IDs
    const sourceColumnId = sourceHandle?.split('-').slice(1, -1).join('-');
    const targetColumnId = targetHandle?.split('-').slice(1, -1).join('-');
    
    // Find nodes and columns
    const sourceNode = nodes.find(n => n.id === source) as Node<EntityData> | undefined;
    const targetNode = nodes.find(n => n.id === target) as Node<EntityData> | undefined;
    
    if (!sourceNode || !targetNode || !sourceColumnId || !targetColumnId || sourceNode.type !== 'entity' || targetNode.type !== 'entity') {
      // Fallback to default behavior
      onConnect(connection);
      return;
    }
    
    const sourceData = sourceNode.data as EntityData;
    const targetData = targetNode.data as EntityData;
    const sourceColumn = sourceData.attributes.find(a => a.id === sourceColumnId);
    const targetColumn = targetData.attributes.find(a => a.id === targetColumnId);
    
    if (!sourceColumn || !targetColumn) {
      onConnect(connection);
      return;
    }
    
    // Generate FK name and check if we should suggest FK
    const suggestedFKName = generateFKName(sourceData.label, sourceColumn.name);
    
    if (shouldSuggestFK(sourceColumn, targetData, suggestedFKName)) {
      const relationshipType = detectRelationshipType(sourceColumn, targetColumn);
      
      // Store the connection to create after FK is added (or skipped)
      setPendingConnection({
        sourceTableId: target,
        sourceTableName: targetData.label,
        connection
      });
      
      setFKSuggestion({
        targetTableName: sourceData.label,
        targetTableId: source,
        targetColumnName: sourceColumn.name,
        targetColumnId: sourceColumn.id,
        targetColumnType: sourceColumn.type,
        suggestedFKName,
        relationshipType
      });
      
      setShowFKModal(true);
    } else {
      // No FK needed, create connection normally
      onConnect(connection);
    }
  };

  // Handle FK creation acceptance
  const handleAcceptFK = (fkName: string) => {
    if (!fkSuggestion || !pendingConnection) return;
    
    const sourceNode = nodes.find(n => n.id === fkSuggestion.targetTableId);
    if (sourceNode?.type === 'entity') {
      const sourceData = sourceNode.data as EntityData;
      const sourceColumn = sourceData.attributes.find(a => a.id === fkSuggestion.targetColumnId);
      
      if (sourceColumn) {
        const newFKAttr = createFKAttribute(sourceColumn, fkName);
        addFKAttribute(pendingConnection.sourceTableId, newFKAttr);
        
        // Create the connection with the new FK column
        const updatedConnection = {
          ...pendingConnection.connection,
          targetHandle: `${pendingConnection.sourceTableId}-${newFKAttr.id}-left`
        };
        
        onConnect(updatedConnection);
      }
    }
    
    setPendingConnection(null);
    setFKSuggestion(null);
  };

  // Handle FK creation rejection
  const handleRejectFK = () => {
    // User declined FK creation, create connection anyway
    if (pendingConnection?.connection) {
      onConnect(pendingConnection.connection);
    }
    setPendingConnection(null);
    setFKSuggestion(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50"
          defaultEdgeOptions={{
             type: 'smoothstep',
             animated: false,
             style: { stroke: '#94a3b8', strokeWidth: 2 },
             labelStyle: { fill: '#334155', fontWeight: 600, fontSize: 12 },
             labelBgStyle: { fill: '#f1f5f9', fillOpacity: 0.8, rx: 4, ry: 4 },
             labelBgPadding: [6, 4],
             labelBgBorderRadius: 4,
          }}
          minZoom={0.1}
          maxZoom={4}
        >
          <CustomEdgeMarkers />
          <Background color="#cbd5e1" gap={20} />
          <Controls className="bg-white border-slate-200 shadow-sm text-slate-700" />
          <MiniMap 
            className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden" 
            zoomable 
            pannable 
            nodeColor={() => '#e2e8f0'}
            maskColor="rgba(241, 245, 249, 0.7)"
          />
          <CanvasToolbar />
        </ReactFlow>
      </div>
      
      {/* Show appropriate panel based on selection */}
      {selectedNode && selectedNode.type === 'entity' && <EntityPropertiesPanel />}
      {selectedNode && selectedNode.type === 'stickyNote' && <StickyNoteProperties nodeId={selectedNode.id} />}
      {selectedEdge && !selectedNode && <EdgePropertiesPanel />}
      {!selectedNode && !selectedEdge && (
          <div className="w-80 bg-slate-50 border-l border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400 text-sm text-center">
             <p>Select a table, sticky note, or relationship to edit properties</p>
          </div>
      )}

      {/* FK Suggestion Modal */}
      <FKSuggestionModal
        open={showFKModal}
        onOpenChange={setShowFKModal}
        suggestion={fkSuggestion}
        sourceTableName={pendingConnection?.sourceTableName || ''}
        sourceTableId={pendingConnection?.sourceTableId || ''}
        onAccept={handleAcceptFK}
        onReject={handleRejectFK}
      />
    </div>
  );
};

export default function InfiniteCanvas() {
  return (
    <ReactFlowProvider>
      <InfiniteCanvasContent />
    </ReactFlowProvider>
  );
}
