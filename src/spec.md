# Specification

## Summary
**Goal:** Build a multi-institution (SMP/SMA) admin system to manage students, SPP settings, billing, payments (with receipts), arrears, dashboards, calendars, and reports with role-based access via Internet Identity.

**Planned changes:**
- Apply a modern ERP-like admin UI theme (Navy/Emerald palette, cards/tables, sidebar navigation, responsive layout, modern font, optional dark mode).
- Add Internet Identity authentication plus role-based authorization (Super Admin, SMP Admin, SMA Admin, Treasurer) with institution-scoped access restrictions.
- Persist two predefined institutions and enforce that each student belongs to exactly one institution.
- Implement Student Management (CRUD) with required fields plus search and filters (class, institution, status) and an English-only UI.
- Add frontend-only Excel import for students with column mapping/validation, preview, and bulk creation.
- Implement SPP settings per institution per academic year with optional per-class overrides.
- Implement bill generation (monthly and full academic year) with idempotent behavior and paid/unpaid status derived from payments.
- Implement payment workflow (cash/transfer, amount, date, notes) with receipt image upload stored in canister storage; allow edit/delete with recalculation.
- Add receipt printing and browser-only PDF generation for proof of payment.
- Implement automatic arrears calculations and badges, plus per-student billing/payment history views.
- Build dashboard KPIs and charts (payments per month, SMP vs SMA comparison) plus arrears notification count and link.
- Add a monthly payment calendar with color-coded days and per-date payment lists.
- Implement Reports & Recap screens (monthly, by class, by institution, arrears list) with browser-only Excel/PDF exports.
- Implement backend data models and stable persistence in a single Motoko actor for institutions, students, SPP settings, bills, payments, and users, including access checks and methods needed by the UI.

**User-visible outcome:** Staff can sign in with Internet Identity, manage SMP/SMA students, configure tuition, generate bills, record and receipt payments (print/PDF), see arrears status and history, view dashboards and calendars, and export reports to Excel/PDF—all with role- and institution-based access control.
