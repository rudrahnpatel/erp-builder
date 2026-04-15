export interface PackFieldDefinition {
  name: string;
  type: string;
  required?: boolean;
  config?: Record<string, unknown>;
}

export interface PackTableDefinition {
  name: string;
  icon: string;
  fields: PackFieldDefinition[];
  seedData?: Record<string, unknown>[];
}

export interface PackPageDefinition {
  key: string;     // stable identifier, e.g. "products_overview" — never changes
  title: string;
  icon: string;
  blocks: { type: string; config: Record<string, unknown> }[];
}

export interface PackDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  badge: "Free" | "Pro";
  fields: number;
  pages: number;
  tables: PackTableDefinition[];
  pageDefinitions: PackPageDefinition[];
}
