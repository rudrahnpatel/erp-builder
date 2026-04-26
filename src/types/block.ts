export type BlockType =
  | "TABLE_VIEW"
  | "KANBAN_VIEW"
  | "FORM"
  | "TEXT"
  | "FILTER_BAR"
  | "CHART"
  | "METRIC"
  | "EXPORT_BUTTON"
  | "IMAGE"
  | "GST_CALCULATOR";

export interface BlockConfig {
  tableRef?: string;
  tableId?: string;
  visibleFields?: string[];
  groupByField?: string;
  content?: string;
  level?: "h1" | "h2" | "h3" | "p";
  chartType?: "bar" | "line" | "pie";
  sortField?: string;
  sortDirection?: "asc" | "desc";
  // METRIC
  metricLabel?: string;
  metricValue?: string; // stored as string; can render "₹50,000" or "240 units"
  metricTrend?: string; // e.g. "+12% vs last month"
  metricAccent?: "blue" | "emerald" | "amber" | "violet" | "rose";
  // EXPORT_BUTTON
  exportFormat?: "csv";
  exportLabel?: string;
  // IMAGE
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: "sm" | "md" | "lg" | "full";
  imageAlign?: "left" | "center" | "right";
  // FILTER_BAR — optional date range picker
  includeDateRange?: boolean;
  dateField?: string;
  // GST_CALCULATOR
  gstDefaultAmount?: number;
  gstDefaultRate?: "0%" | "5%" | "12%" | "18%" | "28%";
  gstSplit?: "intrastate" | "interstate"; // CGST+SGST vs IGST
}

export interface Block {
  id: string;
  type: BlockType;
  config: BlockConfig;
  children?: Block[];
}
