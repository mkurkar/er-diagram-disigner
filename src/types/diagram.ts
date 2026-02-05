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

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

export interface EntityData extends Record<string, unknown> {
  label: string;
  attributes: Attribute[];
}
