export interface PluginConfigField {
  name: string;
  type: "TEXT" | "CHECKBOX" | "SELECT";
  placeholder?: string;
  defaultValue?: string | boolean;
  options?: string[];
}

export interface PluginTrigger {
  event: string;
  table: string;
  condition?: string;
  action: string;
}

export interface PluginDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  badge: "Free" | "Pro";
  installs: number;
  configFields: PluginConfigField[];
  triggers: PluginTrigger[];
}
