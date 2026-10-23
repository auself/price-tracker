# Price Tracker

A shared, unit-based application for tracking supplier prices over time, comparing prices across company units, and analysing price movements.

> **Build approach:** Create the application structure, UI, core calculations, and service connections first. Use demo data initially. Add full authentication, database persistence, and production workflows in a later phase.

## Project Checklist

Check an item only after it has been implemented and tested.

## 1. Goals and Scope
- [ ] Organise items by category.
- [ ] Record price updates by date and preserve historical records.
- [ ] Track local and overseas suppliers.
- [ ] Support multiple company units/sister concerns in one shared app.
- [ ] Compare supplier prices within and across units.
- [ ] Analyse price changes over time.
- [ ] Support Excel import and export.
- [ ] Let users suggest corrections for administrator review.
- [ ] Build structure and core logic before full backend workflows.

## 2. User Roles and Permissions
- [ ] **Super Admin:** application configuration, App Admin accounts, global access, and backup-related settings.
- [ ] **App Admin:** manage units, categories, items, suppliers, users, official price records, imports, reports, and suggestions.
- [ ] **User:** view permitted prices, history, comparisons, and reports; submit suggestions; cannot directly edit official price records.
- [ ] Provide role-aware navigation and UI states.
- [ ] Centralise permission definitions.
- [ ] Enforce permissions on the server and database before production; frontend checks alone are not security.
- [ ] Add account activation/deactivation and password-reset workflows when authentication is implemented.

## 3. Pages and Navigation
- [ ] Dashboard
- [ ] Items
- [ ] Categories
- [ ] Suppliers
- [ ] Company Units
- [ ] Price Records
- [ ] Price History
- [ ] Price Comparison
- [ ] Analytics and Reports
- [ ] Excel Import/Export
- [ ] Suggestions and Corrections
- [ ] User Management
- [ ] Application Settings
- [ ] Login and access-denied screens
- [ ] Loading, empty, validation-error, and general-error states
- [ ] Responsive navigation for desktop, tablet, and mobile
- [ ] Consistent page titles, breadcrumbs, filters, buttons, and forms

## 4. Master Data
### Items
- [ ] Unique item code/SKU, item name, description, category, and active status
- [ ] Brand, grade, specification, or other attributes when relevant
- [ ] Base measurement unit such as kg, metre, yard, piece, or litre
- [ ] Search, filtering, sorting, and pagination

### Categories
- [ ] Create and maintain categories and optional subcategories
- [ ] Prevent duplicate codes/names where applicable
- [ ] Support active/inactive status

### Suppliers
- [ ] Unique supplier code and name
- [ ] Contact/reference details where needed
- [ ] Local or overseas supplier type
- [ ] Country and default currency where relevant
- [ ] Active/inactive status

### Company Units
- [ ] Unique unit code and unit name
- [ ] Associate each price record with its company unit
- [ ] Define which unit data each role can view
- [ ] Support permitted cross-unit comparison

### Currencies and Measurements
- [ ] Maintain supported currencies and units of measure
- [ ] Convert only compatible measurement units
- [ ] Keep item specifications visible to avoid comparing unlike products

## 5. Price Records and History
- [ ] Record item, supplier, company unit, effective date, price, currency, measurement unit, and remarks.
- [ ] Preserve the original supplier price and currency.
- [ ] Store exchange rate, rate date, and source when converting overseas prices.
- [ ] Keep full date-wise history; do not silently replace old records.
- [ ] Distinguish effective date from record creation/update timestamps.
- [ ] Record who created or changed data when authentication and audit logging exist.
- [ ] Support search, filters, sorting, pagination, and date ranges.
- [ ] Flag duplicate or conflicting entries.
- [ ] Define correction/edit rules and retain an audit trail in production.
- [ ] Display the latest record date and flag stale prices using a configurable threshold.

## 6. Price Comparison
- [ ] Compare an item across suppliers and company units.
- [ ] Compare local and overseas suppliers.
- [ ] **Latest available mode:** use the latest available record for each supplier/unit, even if dates differ.
- [ ] Display each record date in latest-available mode and flag stale records.
- [ ] Never imply that prices from different dates were recorded on the same date.
- [ ] **Selected-date mode:** compare records for the selected date only.
- [ ] Show “No record for selected date” when missing; do not substitute another date's price.
- [ ] Display price, currency, measurement unit, supplier, company unit, date, and remarks.
- [ ] Calculate absolute difference: compared price minus reference price.
- [ ] Calculate percentage difference: (compared price − reference price) ÷ reference price × 100.
- [ ] Handle zero or missing reference prices safely.
- [ ] Identify lowest price, highest price, and spread among comparable records.
- [ ] Compare matching item specifications and compatible units only.
- [ ] Clearly label the reference/baseline price.
- [ ] Filter by item/category, supplier, company unit, supplier type, currency, and date/mode.
- [ ] Clearly show missing data and unavailable comparisons.

## 7. Overseas Prices and Landed Cost
- [ ] Preserve original foreign-currency price and currency code.
- [ ] Store exchange rate, effective date, and source when available.
- [ ] Show converted BDT price separately from original price.
- [ ] Do not use today's exchange rate to silently rewrite historical comparisons.
- [ ] Decide whether comparisons use supplier price or estimated landed cost.
- [ ] If enabled, support configurable freight, insurance, customs duty/tax, and other charges.
- [ ] Clearly label estimates and assumptions.
- [ ] Do not compare different currencies or units until valid conversion is applied.

## 8. Dashboard and Analytics
- [ ] Summary cards for tracked items, active suppliers, recent price updates, and represented units
- [ ] Recent price changes and newly added records
- [ ] Price-trend charts by item, supplier, and company unit
- [ ] Absolute and percentage changes over selected periods
- [ ] Lowest/highest prices and price spread for comparable records
- [ ] Filters for date range, item/category, supplier, and company unit
- [ ] Explicit chart labels, units, currencies, and date ranges
- [ ] Handle missing or sparse history without inventing values
- [ ] Reuse the same calculation rules across dashboard and comparison screens

## 9. Excel Import and Export
- [ ] Document the import template, required columns, and examples.
- [ ] Export price records, comparison results, and reports to Excel-compatible files.
- [ ] Preview parsed rows before import.
- [ ] Validate item/supplier codes, units, currencies, dates, numeric prices, and required fields.
- [ ] Report row-level errors with row number, field, and reason.
- [ ] Detect duplicates and conflicting records before saving.
- [ ] Show accepted, rejected, skipped, and duplicate row counts.
- [ ] Never silently overwrite historical records during import.
- [ ] Require explicit confirmation for supported update/correction operations.
- [ ] Show progress and useful errors for large files.
- [ ] Test blank cells, invalid dates, duplicate rows, malformed files, and invalid numeric values.

## 10. Suggestions and Review
- [ ] Users can submit a suggested correction or data issue.
- [ ] Capture affected item/record, suggestion, reason, submitter, and submission date.
- [ ] Track pending, accepted, and rejected statuses.
- [ ] App Admins can review and respond.
- [ ] Suggestions must not silently change official price records.
- [ ] Record the reviewer and decision when database persistence is available.

## 11. Initial Technical Structure
- [ ] Next.js with TypeScript
- [ ] Tailwind CSS for responsive styling
- [ ] Reusable layout, form, table, chart, dialog, filter, and status components
- [ ] Shared types for items, categories, suppliers, units, users, price records, comparisons, and suggestions
- [ ] Separate calculation logic from UI components
- [ ] Shared validation layer
- [ ] Typed service interfaces for items, suppliers, prices, comparisons, reports, and suggestions
- [ ] Repository/data-access interfaces so demo data can later be replaced by database access
- [ ] Typed demo data for initial development
- [ ] Environment-based configuration for secrets and environment-specific settings
- [ ] Supabase/PostgreSQL integration point and migration directory
- [ ] Keep architecture modular without unnecessary complexity

## 12. Backend Integration — Later Phase
- [ ] Design relational tables and relationships for master and transaction data.
- [ ] Configure Supabase using environment variables.
- [ ] Implement authentication and session handling.
- [ ] Add server-side role checks and database row-level security policies.
- [ ] Connect services/repositories to database queries.
- [ ] Implement validated create, read, update, and deactivate operations.
- [ ] Persist price history and audit events.
- [ ] Implement secure Excel processing and report generation.
- [ ] Configure backups and recovery procedures appropriate to deployment.
- [ ] Never commit secrets; include only an environment-variable example file with placeholder values.

## 13. UI and Accessibility
- [ ] Consistent spacing, typography, colours, borders, and status styles
- [ ] Keyboard navigation and visible focus states
- [ ] Accessible form labels and useful validation messages
- [ ] Do not rely on colour alone to communicate status
- [ ] Responsive tables with sensible scrolling or alternate layouts
- [ ] Confirmation for destructive actions
- [ ] Consistent date, number, currency, and percentage formatting
- [ ] Simple, clear business-focused wording

## 14. Testing and Quality
- [ ] Unit-test core calculation functions.
- [ ] Test percentage changes with zero or missing reference prices.
- [ ] Test latest-available and selected-date modes separately.
- [ ] Verify missing selected-date records are never substituted from other dates.
- [ ] Test compatible and incompatible measurement-unit comparisons.
- [ ] Test currency conversion and preservation of historical exchange rates.
- [ ] Test role permissions in UI and later on server/database.
- [ ] Test forms, filters, sorting, pagination, empty states, and error states.
- [ ] Test Excel validation and exported output with representative files.
- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Run linting, type checks, automated tests, and production build checks.

## 15. Deployment and Documentation
- [ ] Prepare deployment on Vercel.
- [ ] Document local setup, prerequisites, installation, and development commands.
- [ ] Document environment variables without exposing secrets.
- [ ] Explain demo-data behaviour and features not yet connected to a backend.
- [ ] Document database setup and migrations when backend work begins.
- [ ] Document roles, comparison modes, currency assumptions, and import template rules.
- [ ] Verify production build and environment configuration before deployment.
- [ ] Maintain a short change log for major milestones.

## 16. Development Milestones
- [ ] **M1 — Foundation:** project setup, shared layout, navigation, styles, routes, demo data.
- [ ] **M2 — Master data UI:** items, categories, suppliers, units, currencies, measurements.
- [ ] **M3 — Price UI and logic:** price forms, history tables, validation, comparison calculations.
- [ ] **M4 — Analytics:** dashboard, trends, filters, and reports.
- [ ] **M5 — Excel and suggestions UI:** import/export screens, validation preview, review workflow.
- [ ] **M6 — Integration preparation:** typed services, repository interfaces, database schema, environment setup.
- [ ] **M7 — Backend:** authentication, persistence, access policies, audit history, real imports/exports.
- [ ] **M8 — Release readiness:** tests, security review, responsive checks, documentation, backups, deployment.

## 17. Definition of Done
- [ ] Every planned page is reachable and uses the shared layout.
- [ ] Core UI interactions work with demo data without a production database.
- [ ] Shared types and calculations are reused rather than duplicated.
- [ ] Both comparison modes work as specified and show record dates.
- [ ] Historical records are preserved in the data model.
- [ ] Local/overseas suppliers and cross-unit comparisons are represented.
- [ ] Missing data, invalid input, loading, and error states are clear.
- [ ] No secrets are committed.
- [ ] Type checks, linting, tests, and production build pass.
- [ ] Backend-dependent features are clearly labelled until actually connected.

## Technology Direction
- **Frontend:** Next.js + TypeScript
- **Styling:** Tailwind CSS
- **Charts:** select a suitable charting library during implementation
- **Backend/database (planned):** Supabase + PostgreSQL
- **Deployment (planned):** Vercel
- **Excel workflows (planned):** XLSX-compatible import/export

## Current Status
This checklist is the implementation roadmap, not a claim that the features are already built. Mark items complete only after implementation and verification. Demo data and frontend role states do not replace production authentication, database persistence, or server-side security.
