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
import { EntityData, Attribute, UniqueConstraint, EnumDefinition, StickyNoteData, StickyNoteColor, RelationshipEdgeData, AttributeType } from '@/types/diagram';

// Helper function to check type compatibility for relationships
function checkTypeCompatibility(sourceType: AttributeType, targetType: AttributeType): boolean {
  // Exact match is always compatible
  if (sourceType === targetType) return true;
  
  // Numeric types are compatible with each other
  const numericTypes: AttributeType[] = ['int', 'float', 'decimal'];
  if (numericTypes.includes(sourceType) && numericTypes.includes(targetType)) return true;
  
  // Text types are compatible with each other
  const textTypes: AttributeType[] = ['varchar', 'text'];
  if (textTypes.includes(sourceType) && textTypes.includes(targetType)) return true;
  
  // Otherwise, types are incompatible
  return false;
}

interface DiagramState {
  nodes: Node<EntityData | StickyNoteData>[];
  edges: Edge[];
  enumDefinitions: EnumDefinition[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addEntity: () => void;
  updateEntity: (id: string, data: Partial<EntityData>) => void;
  addAttribute: (entityId: string) => void;
  addFKAttribute: (entityId: string, attribute: Attribute) => void;
  updateAttribute: (entityId: string, attrId: string, data: Partial<Attribute>) => void;
  deleteAttribute: (entityId: string, attrId: string) => void;
  addUniqueConstraint: (entityId: string, columnIds: string[], name?: string) => void;
  updateUniqueConstraint: (entityId: string, constraintId: string, data: Partial<UniqueConstraint>) => void;
  deleteUniqueConstraint: (entityId: string, constraintId: string) => void;
  addEnumDefinition: (name: string, values: string[]) => void;
  updateEnumDefinition: (id: string, data: Partial<EnumDefinition>) => void;
  deleteEnumDefinition: (id: string) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  addStickyNote: () => void;
  updateStickyNote: (id: string, data: Partial<StickyNoteData>) => void;
  loadGraph: (nodes: Node<EntityData | StickyNoteData>[], edges: Edge[], enumDefinitions?: EnumDefinition[]) => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  enumDefinitions: [],
  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<EntityData | StickyNoteData>[],
    });
  },
  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;
    
    // Extract column IDs from handle IDs (format: nodeId-columnId-side)
    const sourceColumnId = sourceHandle?.split('-').slice(1, -1).join('-');
    const targetColumnId = targetHandle?.split('-').slice(1, -1).join('-');
    
    // Find source and target nodes
    const sourceNode = get().nodes.find(n => n.id === source) as Node<EntityData> | undefined;
    const targetNode = get().nodes.find(n => n.id === target) as Node<EntityData> | undefined;
    
    let edgeData: RelationshipEdgeData = {};
    
    // If we have column-specific connection, add validation
    if (sourceColumnId && targetColumnId && sourceNode && targetNode) {
      const sourceAttr = sourceNode.data.attributes?.find(a => a.id === sourceColumnId);
      const targetAttr = targetNode.data.attributes?.find(a => a.id === targetColumnId);
      
      edgeData.sourceColumnId = sourceColumnId;
      edgeData.targetColumnId = targetColumnId;
      
      // Type compatibility check
      if (sourceAttr && targetAttr) {
        const typesCompatible = checkTypeCompatibility(sourceAttr.type, targetAttr.type);
        if (!typesCompatible) {
          edgeData.hasTypeWarning = true;
          edgeData.typeWarningMessage = `Type mismatch: ${sourceAttr.type.toUpperCase()} → ${targetAttr.type.toUpperCase()}`;
        }
        
        // Generate label
        edgeData.label = `${sourceAttr.name} → ${targetAttr.name}`;
      }
    }
    
    const newEdge = {
      ...connection,
      data: edgeData,
    };
    
    set({
      edges: addEdge(newEdge, get().edges),
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
            { 
              id: `attr-${Date.now()}`, 
              name: 'id', 
              type: 'int', 
              isPrimaryKey: true, 
              isForeignKey: false,
              isUnique: false,
              isNullable: false
            }
        ],
        uniqueConstraints: [],
        tableType: 'table'
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
        if (node.id === entityId && node.type === 'entity') {
            const entityData = node.data as EntityData;
            const newAttr: Attribute = {
                id: `attr-${Date.now()}`,
                name: 'new_column',
                type: 'varchar',
                isPrimaryKey: false,
                isForeignKey: false,
                isUnique: false,
                isNullable: true
            };
            return {
                ...node,
                data: {
                    ...entityData,
                    attributes: [...entityData.attributes, newAttr]
                }
            };
        }
        return node;
      })
    });
  },
  addFKAttribute: (entityId, attribute) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === entityId && node.type === 'entity') {
            const entityData = node.data as EntityData;
            return {
                ...node,
                data: {
                    ...entityData,
                    attributes: [...entityData.attributes, attribute]
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
              if (node.id === entityId && node.type === 'entity') {
                  const entityData = node.data as EntityData;
                  return {
                      ...node,
                      data: {
                          ...entityData,
                          attributes: entityData.attributes.map(attr =>
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
              if (node.id === entityId && node.type === 'entity') {
                  const entityData = node.data as EntityData;
                  return {
                      ...node,
                      data: {
                          ...entityData,
                          attributes: entityData.attributes.filter(attr => attr.id !== attrId)
                      }
                  };
              }
              return node;
          })
      });
  },
  addUniqueConstraint: (entityId, columnIds, name) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === entityId && node.type === 'entity') {
          const entityData = node.data as EntityData;
          const constraintId = `constraint-${Date.now()}`;
          const constraintName = name || `uk_${columnIds.length}_cols`;
          const newConstraint: UniqueConstraint = {
            id: constraintId,
            name: constraintName,
            columnIds
          };
          return {
            ...node,
            data: {
              ...entityData,
              uniqueConstraints: [...(entityData.uniqueConstraints || []), newConstraint]
            }
          };
        }
        return node;
      })
    });
  },
  updateUniqueConstraint: (entityId, constraintId, data) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === entityId && node.type === 'entity') {
          const entityData = node.data as EntityData;
          return {
            ...node,
            data: {
              ...entityData,
              uniqueConstraints: (entityData.uniqueConstraints || []).map(constraint =>
                constraint.id === constraintId ? { ...constraint, ...data } : constraint
              )
            }
          };
        }
        return node;
      })
    });
  },
  deleteUniqueConstraint: (entityId, constraintId) => {
    set({
      nodes: get().nodes.map(node => {
        if (node.id === entityId && node.type === 'entity') {
          const entityData = node.data as EntityData;
          return {
            ...node,
            data: {
              ...entityData,
              uniqueConstraints: (entityData.uniqueConstraints || []).filter(
                constraint => constraint.id !== constraintId
              )
            }
          };
        }
        return node;
      })
    });
  },
  addEnumDefinition: (name, values) => {
    const newEnum: EnumDefinition = {
      id: `enum-${Date.now()}`,
      name,
      values
    };
    set({
      enumDefinitions: [...get().enumDefinitions, newEnum]
    });
  },
  updateEnumDefinition: (id, data) => {
    set({
      enumDefinitions: get().enumDefinitions.map(enumDef =>
        enumDef.id === id ? { ...enumDef, ...data } : enumDef
      )
    });
  },
  deleteEnumDefinition: (id) => {
    // Check if enum is in use
    const isInUse = get().nodes.some(node => {
      if (node.type === 'entity') {
        const entityData = node.data as EntityData;
        return entityData.attributes.some(attr => attr.enumDefinitionId === id);
      }
      return false;
    });

    if (isInUse) {
      console.warn('Cannot delete enum: it is currently in use by one or more attributes');
      return;
    }

    set({
      enumDefinitions: get().enumDefinitions.filter(enumDef => enumDef.id !== id)
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
  addStickyNote: () => {
    const id = `sticky-${Date.now()}`;
    const newNode: Node<StickyNoteData> = {
      id,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        text: 'New note',
        color: 'yellow',
        width: 200,
        height: 200
      },
      type: 'stickyNote',
    };
    set({ nodes: [...get().nodes, newNode] });
  },
  updateStickyNote: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id && node.type === 'stickyNote' 
          ? { ...node, data: { ...node.data, ...data } as StickyNoteData } 
          : node
      ),
    });
  },
  loadGraph: (nodes: Node<EntityData | StickyNoteData>[], edges: Edge[], enumDefinitions?: EnumDefinition[]) => {
      // Migrate old data to new structure for backward compatibility
      const migratedNodes = nodes.map(node => {
        if (node.type === 'entity') {
          const entityData = node.data as EntityData;
          return {
            ...node,
            data: {
              ...entityData,
              uniqueConstraints: entityData.uniqueConstraints || [],
              attributes: entityData.attributes.map(attr => ({
                ...attr,
                isUnique: attr.isUnique ?? false,
                isNullable: attr.isNullable ?? true,
                defaultValue: attr.defaultValue ?? undefined,
                enumDefinitionId: attr.enumDefinitionId ?? undefined
              }))
            }
          };
        }
        return node;
      });
      
      set({ 
        nodes: migratedNodes, 
        edges,
        enumDefinitions: enumDefinitions || []
      });
  }
}));
