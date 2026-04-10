export type BlockType =
  | "TABLE_VIEW"
  | "KANBAN_VIEW"
  | "FORM"
  | "TEXT"
  | "FILTER_BAR"
  | "CHART";

export interface BlockConfig {
  tableRef?: string;
  visibleFields?: string[];
  groupByField?: string;
  content?: string;
  level?: "h1" | "h2" | "h3" | "p";
  chartType?: "bar" | "line" | "pie";
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

export interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
  children?: Block[];
}
