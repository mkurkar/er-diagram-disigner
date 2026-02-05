export type AttributeType = 
  | 'int' 
  | 'varchar' 
  | 'boolean' 
  | 'date' 
  | 'text' 
  | 'json' 
  | 'array' 
  | 'image' 
  | 'float' 
  | 'decimal'
  | 'enum';

export interface EnumDefinition {
  id: string;
  name: string;
  values: string[];
}

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  enumDefinitionId?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isUnique: boolean;
  isNullable: boolean;
  defaultValue?: string;
}

export interface UniqueConstraint {
  id: string;
  name: string;
  columnIds: string[];
}

export interface EntityData extends Record<string, unknown> {
  label: string;
  attributes: Attribute[];
  uniqueConstraints: UniqueConstraint[];
  tableType?: 'table' | 'view' | 'enum';
  enumValues?: string[];
}

export type StickyNoteColor = 'yellow' | 'blue' | 'green' | 'pink' | 'purple';

export interface StickyNoteData extends Record<string, unknown> {
  text: string;
  color: StickyNoteColor;
  width: number;
  height: number;
}

export type RelationshipType = '1:1' | '1:N' | 'N:1' | 'N:M';

export interface RelationshipEdgeData extends Record<string, unknown> {
  relationshipType?: RelationshipType;
  sourceColumnId?: string;
  targetColumnId?: string;
  label?: string;
  hasTypeWarning?: boolean;
  typeWarningMessage?: string;
}
