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
  version: string; // bump this when fields/tables/pages change so installs can detect updates
  tables: PackTableDefinition[];
  pageDefinitions: PackPageDefinition[];
}
