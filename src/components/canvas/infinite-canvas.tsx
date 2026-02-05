'use client';

import React from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useDiagramStore } from '@/hooks/use-diagram-store';
import EntityNode from './widgets/entity-node';
import EntityPropertiesPanel from './properties-panels/entity-properties';
import EdgePropertiesPanel from './properties-panels/edge-properties';
import CanvasToolbar from './canvas-toolbar';
import { useShortcuts } from '@/hooks/use-shortcuts';
import { CustomEdgeMarkers } from './widgets/custom-edge-markers';

const nodeTypes: NodeTypes = {
  entity: EntityNode as any,
};

const InfiniteCanvasContent = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  } = useDiagramStore();

  const selectedEdge = edges.find((e) => e.selected);
  const selectedNode = nodes.find((n) => n.selected);

  useShortcuts(); // Activate keyboard shortcuts

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
      {selectedNode && <EntityPropertiesPanel />}
      {selectedEdge && !selectedNode && <EdgePropertiesPanel />}
      {!selectedNode && !selectedEdge && (
          <div className="w-80 bg-slate-50 border-l border-slate-200 p-4 flex flex-col items-center justify-center text-slate-400 text-sm text-center">
             <p>Select a table or relationship to edit properties</p>
          </div>
      )}
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
