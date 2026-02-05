import { create } from 'zustand';
import {
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
} from '@xyflow/react';
import { EntityData, Attribute } from '@/types/diagram';

interface DiagramState {
  nodes: Node<EntityData>[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addEntity: () => void;
  updateEntity: (id: string, data: Partial<EntityData>) => void;
  addAttribute: (entityId: string) => void;
  updateAttribute: (entityId: string, attrId: string, data: Partial<Attribute>) => void;
  deleteAttribute: (entityId: string, attrId: string) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  loadGraph: (nodes: Node<EntityData>[], edges: Edge[]) => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<EntityData>[],
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  addEntity: () => {
    const id = `entity-${Date.now()}`;
    const newNode: Node<EntityData> = {
      id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: 'New Table',
        attributes: [
            { id: `attr-${Date.now()}`, name: 'id', type: 'int', isPrimaryKey: true, isForeignKey: false }
        ],
      },
      type: 'entity',
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  updateEntity: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },
  addAttribute: (entityId) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === entityId) {
            const newAttr: Attribute = {
                id: `attr-${Date.now()}`,
                name: 'new_column',
                type: 'varchar',
                isPrimaryKey: false,
                isForeignKey: false
            };
            return {
                ...node,
                data: {
                    ...node.data,
                    attributes: [...node.data.attributes, newAttr]
                }
            };
        }
        return node;
      })
    });
  },
  updateAttribute: (entityId, attrId, data) => {
      set({
          nodes: get().nodes.map(node => {
              if (node.id === entityId) {
                  return {
                      ...node,
                      data: {
                          ...node.data,
                          attributes: node.data.attributes.map(attr =>
                              attr.id === attrId ? { ...attr, ...data } : attr
                          )
                      }
                  };
              }
              return node;
          })
      });
  },
  deleteAttribute: (entityId, attrId) => {
      set({
          nodes: get().nodes.map(node => {
              if (node.id === entityId) {
                  return {
                      ...node,
                      data: {
                          ...node.data,
                          attributes: node.data.attributes.filter(attr => attr.id !== attrId)
                      }
                  };
              }
              return node;
          })
      });
  },
  updateEdge: (id, data) => {
      set({
          edges: get().edges.map((edge) =>
              edge.id === id ? { ...edge, ...data } : edge
          ),
      });
  },
  deleteEdge: (id) => {
      set({
          edges: get().edges.filter((edge) => edge.id !== id),
      });
  },
  loadGraph: (nodes: Node<EntityData>[], edges: Edge[]) => {
      set({ nodes, edges });
  }
}));
