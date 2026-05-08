import { PackDefinition } from "@/types/pack";

export const inventoryPack: PackDefinition = {
  id: "inventory",
  name: "Inventory",
  description:
    "Track stock across godowns and manage stock alerts. Perfect for multi-location warehousing and manufacturing.",
  icon: "package",
  category: "Operations",
  badge: "Free",
  // 1.1.0: added GST Rate (%) to Products, Reorder Level to Stock,
  // and expanded Customers (Email, GSTIN, Billing Address, City, State,
  // Credit Limit, Payment Terms).
  // 1.2.0: linked Products → Suppliers (Preferred Supplier) and
  // Products → Customers (Frequent Customer) via RELATION fields so the
  // marketplace stops reporting `0 relations` on those tables.
  version: "1.2.0",
  tables: [
    // ─── 1. Stock ─────────────────────────────────────────────────────────────
    // NOTE: order matters — RELATION fields can only resolve to tables that
    // were created earlier in this list during a fresh install. Suppliers and
    // Customers must come before Products (which links to both). For existing
    // installs, the /api/packs/update endpoint resolves cross-table refs from
    // the DB so order there doesn't matter.
    {
      name: "Stock",
      icon: "layers",
      fields: [
        { name: "Item", type: "TEXT", required: true },
        { name: "Unit", type: "TEXT" },
        { name: "Current Stock", type: "NUMBER", required: true },
        { name: "Reorder Level", type: "NUMBER" },
        { name: "Price", type: "CURRENCY", config: { currency: "INR" } },
        {
          name: "Status",
          type: "SINGLE_SELECT",
          config: {
            options: ["IN STOCK", "LOW STOCK", "OUT OF STOCK"],
            autoCompute: "stock_status",
          },
        },
      ],
      seedData: [
        {
          Item: "LED Desk Lamp",
          Unit: "pcs",
          "Current Stock": 240,
          "Reorder Level": 50,
          Price: 1250,
          Status: "IN STOCK",
        },
        {
          Item: "Notebook A5",
          Unit: "pcs",
          "Current Stock": 80,
          "Reorder Level": 100,
          Price: 90,
          Status: "LOW STOCK",
        },
        {
          Item: "Ink Refill",
          Unit: "bottle",
          "Current Stock": 15,
          "Reorder Level": 25,
          Price: 280,
          Status: "LOW STOCK",
        },
      ],
    },

    // ─── 2. Suppliers ─────────────────────────────────────────────────────────
    {
      name: "Suppliers",
      icon: "truck",
      fields: [
        { name: "Company Name", type: "TEXT", required: true },
        { name: "Contact Person", type: "TEXT" },
        { name: "Contact Number", type: "PHONE" },
        { name: "Address", type: "TEXT" },
        { name: "GSTIN", type: "TEXT" },
      ],
      seedData: [
        {
          "Company Name": "Krishna Polymers",
          "Contact Person": "Rahul Patel",
          "Contact Number": "+91 98765 43210",
          Address: "Phase 1, GIDC",
          GSTIN: "24AAAAA0000A1Z5",
        },
      ],
    },

    // ─── 3. Customers ─────────────────────────────────────────────────────────
    {
      name: "Customers",
      icon: "users",
      fields: [
        { name: "Customer Name", type: "TEXT", required: true },
        { name: "Contact Number", type: "PHONE" },
        { name: "Email", type: "EMAIL" },
        { name: "GSTIN", type: "TEXT" },
        { name: "Billing Address", type: "TEXT" },
        { name: "City", type: "TEXT" },
        {
          name: "State",
          type: "SINGLE_SELECT",
          config: {
            options: [
              "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
              "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
              "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
              "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
              "Uttarakhand", "West Bengal",
            ],
          },
        },
        { name: "Credit Limit", type: "CURRENCY", config: { currency: "INR" } },
        {
          name: "Payment Terms",
          type: "SINGLE_SELECT",
          config: { options: ["Advance", "COD", "Net 7", "Net 15", "Net 30", "Net 45"] },
        },
      ],
      seedData: [
        {
          "Customer Name": "ABC Manufacturing",
          "Contact Number": "+91 99887 76655",
          Email: "accounts@abcmfg.in",
          GSTIN: "27AABCA1234A1Z5",
          "Billing Address": "Plot 18, MIDC Industrial Area",
          City: "Pune",
          State: "Maharashtra",
          "Credit Limit": 250000,
          "Payment Terms": "Net 30",
        },
      ],
    },

    // ─── 4. Products (Catalog) ────────────────────────────────────────────────
    // Listed last so its RELATION fields can resolve to Suppliers + Customers
    // during a fresh install.
    {
      name: "Products",
      icon: "box",
      fields: [
        { name: "Product Name", type: "TEXT", required: true },
        {
          name: "Category",
          type: "SINGLE_SELECT",
          config: { options: ["Electronics", "Stationery", "Furniture", "Accessories", "Packaging"] },
        },
        { name: "HSN Code", type: "TEXT" },
        { name: "Rate", type: "CURRENCY", config: { currency: "INR" } },
        {
          name: "GST Rate (%)",
          type: "SINGLE_SELECT",
          config: { options: ["0%", "5%", "12%", "18%", "28%"] },
        },
        { name: "Measurable Unit", type: "TEXT" },
        {
          name: "Preferred Supplier",
          type: "RELATION",
          config: { linkedTable: "Suppliers" },
        },
        {
          name: "Frequent Customer",
          type: "RELATION",
          config: { linkedTable: "Customers" },
        },
      ],
      seedData: [
        {
          "Product Name": "Wireless Mouse",
          Category: "Electronics",
          "HSN Code": "8471",
          Rate: 850,
          "GST Rate (%)": "18%",
          "Measurable Unit": "pcs",
        },
        {
          "Product Name": "Mechanical Keyboard",
          Category: "Electronics",
          "HSN Code": "8471",
          Rate: 3200,
          "GST Rate (%)": "18%",
          "Measurable Unit": "pcs",
        },
        {
          "Product Name": "A4 Paper Ream",
          Category: "Stationery",
          "HSN Code": "4802",
          Rate: 320,
          "GST Rate (%)": "12%",
          "Measurable Unit": "ream",
        },
      ],
    },

    /* ===== COMMENTED OUT PREVIOUS TABLES =====
    // ─── 1. Products ──────────────────────────────────────────────────────────
    {
      name: "Products",
      icon: "box",
      fields: [
        { name: "Product Name", type: "TEXT", required: true },
        { name: "SKU", type: "TEXT", required: true },
        { name: "HSN Code", type: "TEXT" }, // Harmonised System of Nomenclature — required for GST invoicing
        {
          name: "Category",
          type: "SINGLE_SELECT",
          config: { options: ["Raw Materials", "Finished Goods", "Packaging", "Semi-Finished"] },
        },
        {
          name: "Unit of Measure",
          type: "SINGLE_SELECT",
          config: { options: ["Kg", "Litre", "Piece", "Box", "Carton", "Dozen", "Metre"] },
        },
        { name: "Purchase Price (INR)", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Selling Price (INR)", type: "CURRENCY", config: { currency: "INR" } },
        {
          name: "GST Rate (%)",
          type: "SINGLE_SELECT",
          config: { options: ["0%", "5%", "12%", "18%", "28%"] }, // Indian GST slabs
        },
        { name: "Reorder Level", type: "NUMBER" },
        { name: "Reorder Qty", type: "NUMBER" },
        {
          name: "Supplier",
          type: "RELATION",
          config: { linkedTable: "Suppliers" },
        },
        { name: "Is Active", type: "CHECKBOX", config: { defaultValue: true } },
      ],
      seedData: [
        {
          "Product Name": "Basmati Rice 5kg",
          SKU: "BR-005",
          "HSN Code": "1006",
          Category: "Finished Goods",
          "Unit of Measure": "Kg",
          "Purchase Price (INR)": 380,
          "Selling Price (INR)": 450,
          "GST Rate (%)": "5%",
          "Reorder Level": 50,
          "Reorder Qty": 200,
          "Is Active": true,
        },
        {
          "Product Name": "Toor Dal 1kg",
          SKU: "TD-001",
          "HSN Code": "0713",
          Category: "Finished Goods",
          "Unit of Measure": "Kg",
          "Purchase Price (INR)": 140,
          "Selling Price (INR)": 180,
          "GST Rate (%)": "5%",
          "Reorder Level": 100,
          "Reorder Qty": 500,
          "Is Active": true,
        },
        {
          "Product Name": "Turmeric Powder 500g",
          SKU: "TP-500",
          "HSN Code": "0910",
          Category: "Finished Goods",
          "Unit of Measure": "Kg",
          "Purchase Price (INR)": 70,
          "Selling Price (INR)": 95,
          "GST Rate (%)": "5%",
          "Reorder Level": 80,
          "Reorder Qty": 300,
          "Is Active": true,
        },
        {
          "Product Name": "Cardboard Box 12x12",
          SKU: "CB-012",
          "HSN Code": "4819",
          Category: "Packaging",
          "Unit of Measure": "Piece",
          "Purchase Price (INR)": 18,
          "Selling Price (INR)": 25,
          "GST Rate (%)": "18%",
          "Reorder Level": 200,
          "Reorder Qty": 1000,
          "Is Active": true,
        },
      ],
    },

    // ─── 2. Suppliers ─────────────────────────────────────────────────────────
    {
      name: "Suppliers",
      icon: "truck",
      fields: [
        { name: "Supplier Name", type: "TEXT", required: true },
        { name: "Contact Person", type: "TEXT" },
        { name: "Phone", type: "PHONE" },
        { name: "Email", type: "EMAIL" },
        { name: "GST Number (GSTIN)", type: "TEXT" }, // 15-char GSTIN — required for ITC claims
        { name: "PAN Number", type: "TEXT" },          // For TDS deduction
        { name: "Address", type: "TEXT" },
        { name: "City", type: "TEXT" },
        {
          name: "State",
          type: "SINGLE_SELECT",
          config: {
            options: [
              "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
              "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
              "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
              "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
              "Uttarakhand", "West Bengal",
            ],
          },
        },
        {
          name: "Payment Terms",
          type: "SINGLE_SELECT",
          config: { options: ["Advance", "COD", "Net 7", "Net 15", "Net 30", "Net 45"] },
        },
        { name: "Credit Limit (INR)", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Is Active", type: "CHECKBOX", config: { defaultValue: true } },
      ],
      seedData: [
        {
          "Supplier Name": "Krishna Traders",
          "Contact Person": "Mohan Krishna",
          Phone: "+91 98765 43210",
          Email: "mohan@krishnatraders.in",
          "GST Number (GSTIN)": "27AAAAA0000A1Z5",
          "PAN Number": "AAAAA0000A",
          City: "Mumbai",
          State: "Maharashtra",
          "Payment Terms": "Net 30",
          "Credit Limit (INR)": 500000,
          "Is Active": true,
        },
        {
          "Supplier Name": "Patel Exports",
          "Contact Person": "Rajesh Patel",
          Phone: "+91 98765 12345",
          Email: "rajesh@patelexports.in",
          "GST Number (GSTIN)": "24BBBBB0000B2Y6",
          "PAN Number": "BBBBB0000B",
          City: "Ahmedabad",
          State: "Gujarat",
          "Payment Terms": "Net 15",
          "Credit Limit (INR)": 300000,
          "Is Active": true,
        },
        {
          "Supplier Name": "Sharma & Sons",
          "Contact Person": "Vikram Sharma",
          Phone: "+91 99887 76655",
          Email: "vikram@sharmasons.in",
          "GST Number (GSTIN)": "08CCCCC0000C3X7",
          "PAN Number": "CCCCC0000C",
          City: "Jaipur",
          State: "Rajasthan",
          "Payment Terms": "Net 30",
          "Credit Limit (INR)": 250000,
          "Is Active": true,
        },
      ],
    },

    // ─── 3. Godowns ───────────────────────────────────────────────────────────
    // Promoted from a hard-coded SINGLE_SELECT to a proper relational table.
    // Enables dynamic addition and location-level stock reports.
    {
      name: "Godowns",
      icon: "warehouse",
      fields: [
        { name: "Godown Name", type: "TEXT", required: true },
        { name: "Location Code", type: "TEXT" }, // Short code e.g. "DEL-WH1"
        { name: "Address", type: "TEXT" },
        { name: "City", type: "TEXT" },
        {
          name: "State",
          type: "SINGLE_SELECT",
          config: {
            options: [
              "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
              "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
              "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
              "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
              "Uttarakhand", "West Bengal",
            ],
          },
        },
        { name: "Manager Name", type: "TEXT" },
        { name: "Phone", type: "PHONE" },
        { name: "Storage Capacity", type: "NUMBER" }, // In workspace-relevant units
        { name: "Is Active", type: "CHECKBOX", config: { defaultValue: true } },
      ],
      seedData: [
        {
          "Godown Name": "Main Warehouse",
          "Location Code": "DEL-WH1",
          Address: "Plot 42, Okhla Industrial Area, Phase II",
          City: "New Delhi",
          State: "Delhi",
          "Manager Name": "Deepika Nair",
          Phone: "+91 98765 99001",
          "Storage Capacity": 5000,
          "Is Active": true,
        },
        {
          "Godown Name": "Godown A",
          "Location Code": "GGN-GD1",
          Address: "Sector 18, Udyog Vihar",
          City: "Gurgaon",
          State: "Haryana",
          "Manager Name": "Rahul Verma",
          Phone: "+91 98765 99002",
          "Storage Capacity": 2000,
          "Is Active": true,
        },
        {
          "Godown Name": "Godown B",
          "Location Code": "NOI-GD1",
          Address: "Phase II, Noida Industrial Area",
          City: "Noida",
          State: "Uttar Pradesh",
          "Manager Name": "Amit Patel",
          Phone: "+91 98765 99003",
          "Storage Capacity": 1500,
          "Is Active": true,
        },
      ],
    },

    // ─── 4. Stock Movements ───────────────────────────────────────────────────
    {
      name: "Stock Movements",
      icon: "arrow-left-right",
      fields: [
        {
          name: "Product",
          type: "RELATION",
          config: { linkedTable: "Products" },
          required: true,
        },
        {
          name: "Movement Type",
          type: "SINGLE_SELECT",
          config: { options: ["Inward", "Outward", "Transfer", "Adjustment", "Return"] },
          required: true,
        },
        { name: "Quantity", type: "NUMBER", required: true },
        { name: "Date", type: "DATE", required: true },
        {
          name: "From Godown",        // Source — used for Transfer and Outward
          type: "RELATION",
          config: { linkedTable: "Godowns" },
        },
        {
          name: "To Godown",          // Destination — used for Inward, Transfer, Return
          type: "RELATION",
          config: { linkedTable: "Godowns" },
        },
        { name: "Reference / Bill No", type: "TEXT" }, // PO number, sale order, etc.
        { name: "Unit Price (INR)", type: "CURRENCY", config: { currency: "INR" } }, // Price at movement time for FIFO
        { name: "Created By", type: "TEXT" },
        { name: "Notes", type: "TEXT" },
      ],
    },

    // ─── 5. Purchase Orders ───────────────────────────────────────────────────
    {
      name: "Purchase Orders",
      icon: "file-plus",
      fields: [
        { name: "PO Number", type: "TEXT", required: true },
        {
          name: "Supplier",
          type: "RELATION",
          config: { linkedTable: "Suppliers" },
          required: true,
        },
        { name: "Order Date", type: "DATE" },
        { name: "Expected Delivery", type: "DATE" },
        {
          name: "Status",
          type: "SINGLE_SELECT",
          config: { options: ["Draft", "Sent", "Partial", "Received", "Cancelled"] },
        },
        { name: "Total Amount (INR)", type: "CURRENCY", config: { currency: "INR" } },
        {
          name: "Deliver To Godown",
          type: "RELATION",
          config: { linkedTable: "Godowns" },
        },
        { name: "Notes", type: "TEXT" },
      ],
      seedData: [
        {
          "PO Number": "PO-2026-001",
          "Order Date": "2026-04-01",
          "Expected Delivery": "2026-04-10",
          Status: "Received",
          "Total Amount (INR)": 95000,
        },
        {
          "PO Number": "PO-2026-002",
          "Order Date": "2026-04-08",
          "Expected Delivery": "2026-04-20",
          Status: "Sent",
          "Total Amount (INR)": 42000,
        },
      ],
    },

    // ─── 6. Purchase Order Items ──────────────────────────────────────────────
    {
      name: "Purchase Order Items",
      icon: "list",
      fields: [
        {
          name: "Purchase Order",
          type: "RELATION",
          config: { linkedTable: "Purchase Orders" },
          required: true,
        },
        {
          name: "Product",
          type: "RELATION",
          config: { linkedTable: "Products" },
          required: true,
        },
        { name: "Ordered Qty", type: "NUMBER", required: true },
        { name: "Received Qty", type: "NUMBER" }, // Updated when stock arrives via Stock Movement
        { name: "Unit Price (INR)", type: "CURRENCY", config: { currency: "INR" } },
        {
          name: "GST Rate (%)",
          type: "SINGLE_SELECT",
          config: { options: ["0%", "5%", "12%", "18%", "28%"] },
        },
        { name: "Amount (INR)", type: "CURRENCY", config: { currency: "INR" } }, // Ordered Qty × Unit Price
      ],
    },

    // ─── 7. Stock Alerts ──────────────────────────────────────────────────────
    {
      name: "Stock Alerts",
      icon: "bell-ring",
      fields: [
        {
          name: "Product",
          type: "RELATION",
          config: { linkedTable: "Products" },
          required: true,
        },
        { name: "Alert Date", type: "DATE" },
        { name: "Current Stock", type: "NUMBER" },  // Qty at time of alert
        { name: "Reorder Level", type: "NUMBER" },  // Threshold that was crossed
        {
          name: "Status",
          type: "SINGLE_SELECT",
          config: { options: ["Open", "Acknowledged", "PO Raised", "Closed"] },
        },
        { name: "Assigned To", type: "TEXT" },
        { name: "Notes", type: "TEXT" },
      ],
    },
    */
  ],
  pageDefinitions: [
    {
      key: "products_overview",
      title: "Products Overview",
      icon: "layout-dashboard",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Product Catalog",
            level: "h1",
            description: "Manage your product catalog, maintain HSN codes and track rates.",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Products" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Products",
            visibleFields: [
              "Product Name",
              "Category",
              "HSN Code",
              "Rate",
              "GST Rate (%)",
              "Measurable Unit",
            ],
          },
        },
      ],
    },
    {
      key: "stock_dashboard",
      title: "Current Stock",
      icon: "layers",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Stock Dashboard",
            level: "h1",
            description: "Inward inventory and stock tracking",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Stock" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Stock",
            visibleFields: [
              "Item",
              "Unit",
              "Current Stock",
              "Reorder Level",
              "Price",
              "Status",
            ],
          },
        },
      ],
    },
    {
      key: "supplier_directory",
      title: "Suppliers",
      icon: "users",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Supplier Directory",
            level: "h1",
            description: "Manage supplier contacts, addresses, and GSTIN information.",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Suppliers" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Suppliers",
            visibleFields: [
              "Company Name",
              "Contact Person",
              "Contact Number",
              "GSTIN",
            ],
          },
        },
      ],
    },
    {
      key: "customer_directory",
      title: "Customers",
      icon: "users",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Customer Directory",
            level: "h1",
            description: "Manage customer contacts, billing addresses, GSTIN, and payment terms.",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Customers" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Customers",
            visibleFields: [
              "Customer Name",
              "Contact Number",
              "Email",
              "City",
              "GSTIN",
              "Payment Terms",
            ],
          },
        },
      ],
    },

    /* ===== COMMENTED OUT PREVIOUS PAGES =====
    {
      key: "products_overview",
      title: "Products Overview",
      icon: "layout-dashboard",
      blocks: [
        { type: "TEXT", config: { content: "Products Overview", level: "h1" } },
        {
          type: "TEXT",
          config: {
            content: "Manage your complete product catalog, monitor pricing, and track category-wise inventory levels. This dashboard is your central hub for all SKUs.",
            level: "p",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Products" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Products",
            visibleFields: [
              "Product Name",
              "SKU",
              "Category",
              "Selling Price (INR)",
              "Reorder Level",
              "Is Active",
            ],
          },
        },
      ],
    },

    {
      key: "stock_movement_log",
      title: "Stock Movement Log",
      icon: "arrow-left-right",
      blocks: [
        { type: "TEXT", config: { content: "Stock Movements", level: "h1" } },
        {
          type: "TEXT",
          config: {
            content: "An audit trail of every stock entry. Track daily inward and outward movements, warehouse transfers, and adjustments to ensure inventory accuracy.",
            level: "p",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Stock Movements" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Stock Movements",
            visibleFields: [
              "Product",
              "Movement Type",
              "Quantity",
              "Date",
              "From Godown",
              "To Godown",
            ],
          },
        },
      ],
    },
    {
      key: "supplier_directory",
      title: "Supplier Directory",
      icon: "users",
      blocks: [
        { type: "TEXT", config: { content: "Suppliers", level: "h1" } },
        {
          type: "TEXT",
          config: {
            content: "Your vendor rolodex. Keep vendor contact details handy and review approved payment terms for smoother supply chain operations.",
            level: "p",
          },
        },
        { type: "FILTER_BAR", config: { tableRef: "Suppliers" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Suppliers",
            visibleFields: [
              "Supplier Name",
              "Contact Person",
              "Phone",
              "Email",
              "City",
              "Payment Terms",
            ],
          },
        },
      ],
    },
    {
      key: "purchase_orders",
      title: "Purchase Orders",
      icon: "file-plus",
      blocks: [
        {
          type: "TEXT",
          config: { content: "Purchase Orders Kanban", level: "h1" },
        },
        {
          type: "TEXT",
          config: {
            content: "Drag & drop purchase orders across stages. Easily visualize how much material is pending delivery vs received.",
            level: "p",
          },
        },
        {
          type: "KANBAN_VIEW",
          config: {
            tableRef: "Purchase Orders",
            groupByField: "Status",
          },
        },
      ],
    },
    {
      key: "godown_summary",
      title: "Godown Summary",
      icon: "warehouse",
      blocks: [
        { type: "TEXT", config: { content: "Godown Overview", level: "h1" } },
        {
          type: "TEXT",
          config: {
            content: "Manage your physical warehouse setup. Review storage capacities and assign managers across multiple states or regions.",
            level: "p",
          },
        },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Godowns",
            visibleFields: [
              "Godown Name",
              "Location Code",
              "City",
              "Storage Capacity",
              "Manager Name",
            ],
          },
        },
      ],
    },
    */
  ],
};

export const crmPack: PackDefinition = {
  id: "crm",
  name: "CRM & Sales",
  description:
    "Manage dealer relationships and sales pipelines. Track field agents and order conversions in real-time.",
  icon: "users",
  category: "Sales",
  badge: "Free",
  version: "1.0.0",
  tables: [
    {
      name: "Contacts",
      icon: "user",
      fields: [
        { name: "Name", type: "TEXT", required: true },
        { name: "Company", type: "TEXT" },
        { name: "Email", type: "EMAIL" },
        { name: "Phone", type: "PHONE" },
        {
          name: "Stage",
          type: "SINGLE_SELECT",
          config: { options: ["Lead", "Prospect", "Customer", "Churned"] },
        },
        { name: "Deal Value", type: "CURRENCY", config: { currency: "INR" } },
      ],
      seedData: [
        {
          Name: "Priya Sharma",
          Company: "Sharma Industries",
          Email: "priya@sharma.in",
          Phone: "+91 98765 11111",
          Stage: "Customer",
          "Deal Value": 250000,
        },
        {
          Name: "Amit Patel",
          Company: "Patel Trading Co",
          Email: "amit@pateltrading.in",
          Phone: "+91 98765 22222",
          Stage: "Prospect",
          "Deal Value": 180000,
        },
      ],
    },
    {
      name: "Deals",
      icon: "handshake",
      fields: [
        { name: "Deal Name", type: "TEXT", required: true },
        {
          name: "Contact",
          type: "RELATION",
          config: { linkedTable: "Contacts" },
        },
        {
          name: "Stage",
          type: "SINGLE_SELECT",
          config: {
            options: [
              "Qualification",
              "Proposal",
              "Negotiation",
              "Closed Won",
              "Closed Lost",
            ],
          },
        },
        { name: "Value", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Close Date", type: "DATE" },
        {
          name: "Assigned To",
          type: "TEXT",
        },
      ],
    },
  ],
  pageDefinitions: [
    {
      key: "sales_pipeline",
      title: "Sales Pipeline",
      icon: "kanban",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Sales Pipeline",
            level: "h1",
            description: "Track key accounts from lead generation to closed-won. Keep your pipeline moving forward with visual deal stages.",
          },
        },
        {
          type: "KANBAN_VIEW",
          config: { tableRef: "Deals", groupByField: "Stage" },
        },
      ],
    },
  ],
};

export const hrPack: PackDefinition = {
  id: "hr-payroll",
  name: "HR & Payroll",
  description:
    "Monitor employee attendance, salaries, and leave requests. Integrated EPF and ESI calculation sheets.",
  icon: "briefcase",
  category: "HR & Payroll",
  badge: "Free",
  version: "1.0.1",
  tables: [
    {
      name: "Employees",
      icon: "users",
      fields: [
        { name: "Employee Name", type: "TEXT", required: true },
        { name: "Employee ID", type: "TEXT", required: true },
        { name: "Department", type: "SINGLE_SELECT", config: { options: ["Engineering", "Sales", "Operations", "HR", "Finance"] } },
        { name: "Designation", type: "TEXT" },
        { name: "Date of Joining", type: "DATE" },
        { name: "Email", type: "EMAIL" },
        { name: "Phone", type: "PHONE" },
        { name: "Salary (CTC)", type: "CURRENCY", config: { currency: "INR" } },
      ],
      seedData: [
        { "Employee Name": "Priya Sharma", "Employee ID": "EMP-00124", Department: "Engineering", Designation: "Sr Developer", "Salary (CTC)": 1200000 },
        { "Employee Name": "Amit Patel", "Employee ID": "EMP-00125", Department: "Sales", Designation: "Sales Lead", "Salary (CTC)": 900000 },
        { "Employee Name": "Deepika Nair", "Employee ID": "EMP-00128", Department: "Operations", Designation: "Ops Manager", "Salary (CTC)": 1050000 },
        { "Employee Name": "Rahul Verma", "Employee ID": "EMP-00132", Department: "Engineering", Designation: "Developer", "Salary (CTC)": 750000 },
        { "Employee Name": "Anjali Gupta", "Employee ID": "EMP-00140", Department: "Finance", Designation: "Accountant", "Salary (CTC)": 680000 },
      ],
    },
    {
      name: "Attendance",
      icon: "clock",
      fields: [
        { name: "Employee", type: "RELATION", config: { linkedTable: "Employees" } },
        { name: "Date", type: "DATE", required: true },
        { name: "Check-in Time", type: "TIME" },
        { name: "Check-out Time", type: "TIME" },
        { name: "Status", type: "SINGLE_SELECT", config: { options: ["Present", "Absent", "Half-day", "On Leave"] } },
        { name: "Late Arrival", type: "CHECKBOX" },
        { name: "Overtime Hours", type: "NUMBER" },
      ],
    },
  ],
  pageDefinitions: [
    {
      key: "employee_directory",
      title: "Employee Directory",
      icon: "users",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Employee Directory",
            level: "h1",
            description: "Centralized hub for all employee profiles. Search by name or department to find team members instantly.",
          },
        },
        { type: "TABLE_VIEW", config: { tableRef: "Employees", visibleFields: ["Employee Name", "Employee ID", "Department", "Designation"] } },
      ],
    },
    {
      key: "attendance_dashboard",
      title: "Attendance Dashboard",
      icon: "calendar",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Attendance Log",
            level: "h1",
            description: "Monitor employee check-ins, calculate duration, and export monthly reports.",
          },
        },
        { type: "ATTENDANCE_LOG", config: {} },
      ],
    },
  ],
};

export const financePack: PackDefinition = {
  id: "finance",
  name: "Finance",
  description:
    "Automate invoicing, GST filing, and expense tracking. Generate balance sheets and P&L statements instantly.",
  icon: "indian-rupee",
  category: "Finance",
  badge: "Pro",
  version: "1.0.0",
  tables: [
    {
      name: "Invoices",
      icon: "file-text",
      fields: [
        { name: "Invoice Number", type: "TEXT", required: true },
        { name: "Customer", type: "TEXT", required: true },
        { name: "Amount", type: "CURRENCY", config: { currency: "INR" } },
        { name: "GST Amount", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Total", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Status", type: "SINGLE_SELECT", config: { options: ["Draft", "Sent", "Paid", "Overdue", "Cancelled"] } },
        { name: "Due Date", type: "DATE" },
      ],
    },
    {
      name: "Expenses",
      icon: "receipt",
      fields: [
        { name: "Description", type: "TEXT", required: true },
        { name: "Amount", type: "CURRENCY", config: { currency: "INR" } },
        { name: "Category", type: "SINGLE_SELECT", config: { options: ["Travel", "Office Supplies", "Utilities", "Marketing", "Miscellaneous"] } },
        { name: "Date", type: "DATE" },
        { name: "Approved", type: "CHECKBOX" },
      ],
    },
  ],
  pageDefinitions: [
    {
      key: "invoice_tracker",
      title: "Invoice Tracker",
      icon: "file-text",
      blocks: [
        {
          type: "TEXT",
          config: {
            content: "Invoice Tracker",
            level: "h1",
            description: "Monitor accounts receivable. View drafted, sent, and overdue invoices to keep cash flow stable.",
          },
        },
        { type: "TABLE_VIEW", config: { tableRef: "Invoices", visibleFields: ["Invoice Number", "Customer", "Amount", "Status", "Due Date"] } },
      ],
    },
  ],
};

export const quotationPack: PackDefinition = {
  id: "quotation",
  name: "Quotations & Invoicing",
  description:
    "Create, manage, and share professional quotations and estimates. Features drag-and-drop item reordering and PDF generation.",
  icon: "briefcase",
  category: "Finance",
  badge: "Free",
  version: "1.0.1",
  tables: [
    {
      name: "Quotations",
      icon: "file-text",
      fields: [
        { name: "Quotation No",   type: "TEXT",   required: true  },
        { name: "Client Name",    type: "TEXT",   required: true  },
        { name: "Date",           type: "DATE",   required: true  },
        { name: "Valid Till",     type: "DATE",   required: false },
        { name: "Total Amount",   type: "NUMBER", required: true  },
        { name: "Status",         type: "SINGLE_SELECT", required: false, config: { options: ["draft","sent","accepted","rejected"] } },
        { name: "Public Share ID",type: "TEXT",          required: false },
        { name: "Line Items",     type: "TEXT",          required: false },
      ],
    },
    {
      name: "Estimates",
      icon: "calculator",
      fields: [
        { name: "Bill No",        type: "TEXT",   required: true  },
        { name: "Bill Date",      type: "DATE",   required: true  },
        { name: "Client Name",    type: "TEXT",   required: true  },
        { name: "Total Amount",   type: "NUMBER", required: true  },
        { name: "Paid Amount",    type: "NUMBER", required: false },
        { name: "Balance Due",    type: "NUMBER", required: false },
        { name: "Status",         type: "SINGLE_SELECT", required: false, config: { options: ["pending","partial","paid"] } },
        { name: "Line Items",     type: "TEXT",          required: false },
      ],
    },
  ],
  pageDefinitions: [
    {
      key: "quotation_list",
      title: "Quotations",
      icon: "file-text",
      blocks: [
        { type: "custom-route", config: { route: "/quotation", label: "Quotations List" } },
      ],
    },
    {
      key: "quotation_create",
      title: "New Quotation",
      icon: "plus-circle",
      blocks: [
        { type: "custom-route", config: { route: "/quotation/create", label: "Create Quotation" } },
      ],
    },
    {
      key: "estimate_list",
      title: "Estimates",
      icon: "calculator",
      blocks: [
        { type: "custom-route", config: { route: "/estimated", label: "Estimates List" } },
      ],
    },
    {
      key: "estimate_create",
      title: "New Estimate",
      icon: "plus-circle",
      blocks: [
        { type: "custom-route", config: { route: "/estimated/create", label: "Create Estimate" } },
      ],
    },
  ],
};
