# Manufacturing & Field Sales Modules Notes

## What
This note documents the implementation of two new built-in packs (modules) for the ERP Builder:
1. **Manufacturing Pack**: Focuses on production, BOMs (Bill of Materials), and quality checks.
2. **Field Sales Pack**: Focuses on FMCG distributor sales tracking, field agents, van orders, and collections.

## How
The implementation was done by registering two new `PackDefinition` objects in `src/lib/packs/registry.ts` and exporting them via the central `packRegistry` in `src/lib/packs/index.ts`.

### 1. Manufacturing Pack
Added as `manufacturingPack` with the following entities:
- **RawMaterials**: Tracks materials with stock quantity and unit.
- **BOM** (Bill of Materials): Main entity for product recipes.
- **BOMItems**: The junction/detail table connecting `BOM` and `RawMaterials` (relational fields).
- **WorkOrders**: Tracks production runs tied to a BOM, including Start/End Dates and Status.
- **QualityChecks**: Associated with WorkOrders, allowing for Inspector assignment and Pass/Fail results.
- **FinishedGoods**: Outputs generated from WorkOrders with quantities and batch numbers.

Dashboard Pages created:
- **Manufacturing Dashboard**: A kanban/table view of Work Orders.
- **Bill of Materials**: Overview of all product recipes.

### 2. Field Sales Pack
Added as `fieldSalesPack` with the following entities:
- **Salespeople**: Tracks the agents, their contact info, and targets.
- **Routes**: Areas covered by salespeople.
- **VanOrders**: Primary order entity linked to a salesperson with statuses (Pending, Delivered, etc.).
- **VanOrderItems**: The line items for each van order.
- **Collections**: Records of payments collected by salespeople (Cash, UPI, Cheque).

Dashboard Pages created:
- **Van Orders Dashboard**: Overview of field sales orders and their statuses.
- **Collections List**: A ledger for all payment collections from the field.

### Enabling the Modules
Both packs were appended to the `packRegistry` object in `src/lib/packs/index.ts`. This makes them discoverable by the `getAllPacks()` method, which populates the platform's module marketplace and installation flows.

## Why
The ERP Builder is designed to be extensible and adapt to various industries. By defining these business schemas as "Packs," users can install complete table structures and pre-configured dashboards in a single click. 
- The **Manufacturing Pack** proves the system's ability to handle deeper multi-level entity relationships (Raw Materials -> BOM -> Work Order -> Finished Goods).
- The **Field Sales Pack** demonstrates how the platform can handle mobile/field-specific data models (Agents, Routes, Collections), giving a ready-made solution for FMCG traders.
