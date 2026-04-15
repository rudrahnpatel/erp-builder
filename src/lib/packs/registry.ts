import { PackDefinition } from "@/types/pack";

export const inventoryPack: PackDefinition = {
  id: "inventory",
  name: "Inventory",
  description:
    "Track stock across godowns and manage stock alerts. Perfect for multi-location warehousing and manufacturing.",
  icon: "package",
  category: "Operations",
  badge: "Free",
  fields: 65,
  pages: 6,
  tables: [
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
  ],
  pageDefinitions: [
    {
      key: "products_overview",
      title: "Products Overview",
      icon: "layout-dashboard",
      blocks: [
        { type: "TEXT", config: { content: "Products Overview", level: "h1" } },
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
      key: "low_stock_dashboard",
      title: "Low Stock Dashboard",
      icon: "alert-triangle",
      blocks: [
        { type: "TEXT", config: { content: "Low Stock Dashboard", level: "h1" } },
        {
          type: "TABLE_VIEW",
          config: {
            tableRef: "Products",
            visibleFields: [
              "Product Name",
              "SKU",
              "Category",
              "Reorder Level",
            ],
            // We can add filtering configurations functionally later.
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
  fields: 18,
  pages: 5,
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
          config: { content: "Sales Pipeline", level: "h1" },
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
  fields: 30,
  pages: 8,
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
        { type: "TEXT", config: { content: "Employee Directory", level: "h1" } },
        { type: "TABLE_VIEW", config: { tableRef: "Employees", visibleFields: ["Employee Name", "Employee ID", "Department", "Designation"] } },
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
  fields: 22,
  pages: 7,
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
        { type: "TEXT", config: { content: "Invoice Tracker", level: "h1" } },
        { type: "TABLE_VIEW", config: { tableRef: "Invoices", visibleFields: ["Invoice Number", "Customer", "Amount", "Status", "Due Date"] } },
      ],
    },
  ],
};
