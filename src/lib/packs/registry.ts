import { PackDefinition } from "@/types/pack";

export const inventoryPack: PackDefinition = {
  id: "inventory",
  name: "Inventory",
  description:
    "Track stock across godowns and manage stock alerts. Perfect for multi-location warehousing and manufacturing.",
  icon: "package",
  category: "Operations",
  badge: "Free",
  fields: 24,
  pages: 6,
  tables: [
    {
      name: "Products",
      icon: "box",
      fields: [
        { name: "Product Name", type: "TEXT", required: true },
        { name: "SKU", type: "TEXT", required: true },
        {
          name: "Category",
          type: "SINGLE_SELECT",
          config: { options: ["Raw Materials", "Finished Goods", "Packaging"] },
        },
        {
          name: "Price (INR)",
          type: "CURRENCY",
          config: { currency: "INR" },
        },
        { name: "Stock Qty", type: "NUMBER" },
        {
          name: "Supplier",
          type: "RELATION",
          config: { linkedTable: "Suppliers" },
        },
        { name: "Reorder Level", type: "NUMBER" },
      ],
      seedData: [
        {
          "Product Name": "Basmati Rice 5kg",
          SKU: "BR-005",
          Category: "Finished Goods",
          "Price (INR)": 450,
          "Stock Qty": 120,
        },
        {
          "Product Name": "Cardboard Box 12x12",
          SKU: "CB-012",
          Category: "Packaging",
          "Price (INR)": 25,
          "Stock Qty": 500,
        },
        {
          "Product Name": "Toor Dal 1kg",
          SKU: "TD-001",
          Category: "Finished Goods",
          "Price (INR)": 180,
          "Stock Qty": 340,
        },
        {
          "Product Name": "Turmeric Powder 500g",
          SKU: "TP-500",
          Category: "Finished Goods",
          "Price (INR)": 95,
          "Stock Qty": 200,
        },
      ],
    },
    {
      name: "Suppliers",
      icon: "truck",
      fields: [
        { name: "Supplier Name", type: "TEXT", required: true },
        { name: "Contact Person", type: "TEXT" },
        { name: "Phone", type: "PHONE" },
        { name: "Email", type: "EMAIL" },
        { name: "City", type: "TEXT" },
        { name: "GST Number", type: "TEXT" },
      ],
      seedData: [
        {
          "Supplier Name": "Krishna Traders",
          "Contact Person": "Mohan Krishna",
          Phone: "+91 98765 43210",
          City: "Mumbai",
          "GST Number": "27AAAAA0000A1Z5",
        },
        {
          "Supplier Name": "Patel Exports",
          "Contact Person": "Rajesh Patel",
          Phone: "+91 98765 12345",
          City: "Ahmedabad",
          "GST Number": "24BBBBB0000B2Y6",
        },
        {
          "Supplier Name": "Sharma & Sons",
          "Contact Person": "Vikram Sharma",
          Phone: "+91 99887 76655",
          City: "Jaipur",
          "GST Number": "08CCCCC0000C3X7",
        },
      ],
    },
    {
      name: "Stock Movements",
      icon: "arrow-left-right",
      fields: [
        {
          name: "Product",
          type: "RELATION",
          config: { linkedTable: "Products" },
        },
        {
          name: "Type",
          type: "SINGLE_SELECT",
          config: {
            options: ["Inward", "Outward", "Transfer", "Adjustment"],
          },
        },
        { name: "Quantity", type: "NUMBER", required: true },
        { name: "Date", type: "DATE" },
        {
          name: "Godown",
          type: "SINGLE_SELECT",
          config: {
            options: ["Main Warehouse", "Godown A", "Godown B"],
          },
        },
        { name: "Notes", type: "TEXT" },
      ],
    },
  ],
  pageDefinitions: [
    {
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
              "Price (INR)",
              "Stock Qty",
            ],
          },
        },
      ],
    },
    {
      title: "Stock Pipeline",
      icon: "kanban",
      blocks: [
        {
          type: "TEXT",
          config: { content: "Stock Movement Pipeline", level: "h1" },
        },
        {
          type: "KANBAN_VIEW",
          config: {
            tableRef: "Stock Movements",
            groupByField: "Type",
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
      title: "Invoice Tracker",
      icon: "file-text",
      blocks: [
        { type: "TEXT", config: { content: "Invoice Tracker", level: "h1" } },
        { type: "TABLE_VIEW", config: { tableRef: "Invoices", visibleFields: ["Invoice Number", "Customer", "Amount", "Status", "Due Date"] } },
      ],
    },
  ],
};
