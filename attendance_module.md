# ERP — Employee Attendance Module
## Feature Brief for Antigravity

---

## Overview

Build a new **Attendance Module** for the existing ERP system.

The module has two sides:
- **Employee Side** — a simple check-in / check-out page accessible via a unique link
- **Manager/Admin Side** — a full attendance log with reports, filters, and location tracking

---

## 1. Employee Side — Check-In / Check-Out Page

### How it works
- Company generates a unique link for each employee (or a shared link)
- Employee opens the link on their phone or browser
- They see a simple UI with two buttons: **Check In** and **Check Out**
- When they tap either button, the system automatically captures:
  - Current **timestamp** (date + time)
  - Current **GPS location** (latitude + longitude)
- That data is saved to the database instantly

### UI Requirements
- Clean, minimal UI — just the employee's name, current time, and the two buttons
- If employee has already checked in today, show **Check Out** button only
- If employee has already checked out, show a "You're done for today" message
- Must work on mobile browser — no app install required
- Location permission must be requested on button tap
- If location is denied, still allow check-in but mark location as "Not available"

### Link Structure
```
https://yourapp.com/attendance/{employee_unique_token}
```
- Each employee gets their own unique token
- Token is generated from the Employees section in admin panel
- Admin can copy and share the link directly from the panel

---

## 2. Manager/Admin Side — Attendance Log

### This is already partially built (see screenshot)
Extend and complete the existing Attendance Log page with the following:

### 2.1 Attendance Table Columns
| Column | Description |
|---|---|
| Date | Date of the record |
| Employee | Employee name |
| Client | Client or location they worked at |
| Work Details | Auto-filled as "Office Punch In" or "Office Punch Out" |
| Status | Completed / Working / Absent |
| In Time | Time of check-in |
| Out Time | Time of check-out |
| Duration | Auto-calculated: Out Time minus In Time |
| Remark | Optional note by manager |
| Actions | View location, View details, Delete |

### 2.2 Status Logic
- **Working** — checked in but not yet checked out
- **Completed** — both check-in and check-out done
- **Absent** — no check-in recorded for that day (auto-marked at end of day)

### 2.3 Duration Calculation
- Auto-calculate: `Out Time - In Time`
- Display as `Xh Ym` format (e.g. 8h 32m)
- If not checked out yet, show `0h 0m` or `--`

---

## 3. Filters

### Date Filter
- Single date filter — show records for a specific date
- Date range filter — **Report Start Date** to **Report End Date**
- Default view: today's records

### Employee Filter (Optional)
- Search by employee name
- If selected, show only that employee's records
- If empty, show all employees

### Search Bar
- Search by Employee name, Client, or Area

---

## 4. Report Generation

### View Report Button
- When admin selects a date range and optionally an employee, clicking **View Report** should generate a report

### Report must include:
- Employee name
- Total days present
- Total days absent
- Total hours worked (sum of all durations in range)
- Day-by-day breakdown table: date, in time, out time, duration, status
- Option to **Download as PDF** or **Export as Excel/CSV**

### Report filters:
- By date range (required)
- By specific employee (optional — if empty, generate report for all employees)

---

## 5. Location Tracking

### On the Actions column in the attendance table
- Location pin icon (📍) — clicking it opens a map showing where the employee was when they checked in/out
- Use Google Maps embed or a simple map popup with lat/long marker
- If location was not captured, show "Location not available"

---

## 6. Admin Controls

### Generate Employee Link
- In the Employees section, add a **"Copy Attendance Link"** button per employee
- Clicking it copies the unique attendance URL to clipboard
- Admin can share this link via WhatsApp, email etc.

### Manual Entry
- Admin should be able to manually add or edit an attendance record
- Fields: Employee, Date, In Time, Out Time, Remark
- Useful for correcting errors or adding records for employees without smartphones

### Delete Record
- Delete icon on each row
- Confirm before deleting

---

## 7. Database Structure (Suggested)

```
attendance_records
- id
- employee_id (foreign key → employees table)
- date
- check_in_time
- check_out_time
- check_in_lat
- check_in_lng
- check_out_lat
- check_out_lng
- duration_minutes (auto-calculated)
- status (working / completed / absent)
- remark
- created_at
- updated_at

employee_tokens
- id
- employee_id
- token (unique, random string)
- created_at
```

---

## 8. Tech Notes

- Employee check-in page must use browser **Geolocation API** for location capture
- Duration must be **auto-calculated on backend** — do not rely on frontend calculation only
- All times must be stored in **IST (Indian Standard Time)**
- The attendance link must be **secure** — token should be long and random (min 32 characters)
- Absent marking should run via a **daily cron job** at end of day (e.g. 11:59 PM IST)

---

## 9. Priority Order

| Priority | Feature |
|---|---|
| 1 | Employee check-in / check-out page with location capture |
| 2 | Attendance log table with status and duration |
| 3 | Date range filter + employee filter |
| 4 | Report generation with PDF/Excel export |
| 5 | Location map view on admin side |
| 6 | Manual entry and edit by admin |
| 7 | Absent auto-marking via cron job |

---

## 10. What Already Exists (Do NOT rebuild)

Based on the current screenshot, the following already exists:
- Attendance Log page with table structure
- Date filter UI
- Employee search filter
- Status badges (Completed, Working, Absent)
- Basic action icons (location, details, delete)

**Only build what is missing or incomplete from the above list.**

---

## Deliverables Expected from Antigravity

1. Working employee check-in/check-out page accessible via unique link
2. Location auto-capture on check-in and check-out
3. Duration auto-calculation
4. Date range report generation with PDF/Excel download
5. Location map popup in admin panel
6. Staging/demo link for review before pushing to production

---

*Please confirm understanding of each section before starting. Share estimated time for each priority item.*
