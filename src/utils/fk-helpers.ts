import { EntityData, AttributeType, Attribute } from '@/types/diagram';

/**
 * Generate a suggested foreign key column name
 * Examples:
 * - users.id -> user_id
 * - products.id -> product_id
 * - categories.category_id -> category_id
 */
export function generateFKName(
  sourceTableName: string,
  targetColumnName: string
): string {
  // If the column is already named like a foreign key (ends with _id), use it as-is
  if (targetColumnName.toLowerCase().endsWith('_id')) {
    return targetColumnName;
  }
  
  // Convert table name to singular if it's plural (simple heuristic)
  let singularTable = sourceTableName.toLowerCase();
  if (singularTable.endsWith('ies')) {
    // categories -> category
    singularTable = singularTable.slice(0, -3) + 'y';
  } else if (singularTable.endsWith('ses') || singularTable.endsWith('ches') || singularTable.endsWith('shes')) {
    // addresses -> address, branches -> branch
    singularTable = singularTable.slice(0, -2);
  } else if (singularTable.endsWith('s') && !singularTable.endsWith('ss')) {
    // users -> user (but not address -> addres)
    singularTable = singularTable.slice(0, -1);
  }
  
  // If column name is 'id', create fk name from table
  if (targetColumnName.toLowerCase() === 'id') {
    return `${singularTable}_id`;
  }
  
  // Otherwise combine: table_column
  return `${singularTable}_${targetColumnName.toLowerCase()}`;
}

/**
 * Detect if a foreign key is needed
 * A FK is needed when:
 * 1. The source column is a PK
 * 2. The target table doesn't already have a matching FK column
 */
export function shouldSuggestFK(
  sourceColumn: Attribute,
  targetTableData: EntityData,
  suggestedFKName: string
): boolean {
  // FK is needed if source is a PK or unique
  if (!sourceColumn.isPrimaryKey && !sourceColumn.isUnique) {
    return false;
  }
  
  // Check if target table already has this FK column
  const hasMatchingFK = targetTableData.attributes.some(
    attr => attr.name.toLowerCase() === suggestedFKName.toLowerCase() ||
            (attr.isForeignKey && attr.type === sourceColumn.type)
  );
  
  return !hasMatchingFK;
}

/**
 * Detect relationship type based on column properties
 * 1:1 - Both sides are PK or Unique
 * 1:N - Source is PK/Unique, target is not
 * N:1 - Target is PK/Unique, source is not
 * N:M - Neither side is PK/Unique (should use junction table)
 */
export function detectRelationshipType(
  sourceColumn: Attribute,
  targetColumn: Attribute | null
): '1:1' | '1:N' | 'N:1' | 'N:M' {
  const sourceIsUnique = sourceColumn.isPrimaryKey || sourceColumn.isUnique;
  const targetIsUnique = targetColumn ? (targetColumn.isPrimaryKey || targetColumn.isUnique) : false;
  
  if (sourceIsUnique && targetIsUnique) {
    return '1:1';
  } else if (sourceIsUnique && !targetIsUnique) {
    return '1:N';
  } else if (!sourceIsUnique && targetIsUnique) {
    return 'N:1';
  } else {
    return 'N:M';
  }
}

/**
 * Create a new FK attribute based on a source column
 */
export function createFKAttribute(
  sourceColumn: Attribute,
  fkName: string
): Attribute {
  return {
    id: `attr-${Date.now()}`,
    name: fkName,
    type: sourceColumn.type,
    enumDefinitionId: sourceColumn.enumDefinitionId,
    isPrimaryKey: false,
    isForeignKey: true,
    isUnique: false,
    isNullable: true, // FKs are typically nullable unless it's a required relationship
    defaultValue: undefined
  };
}
