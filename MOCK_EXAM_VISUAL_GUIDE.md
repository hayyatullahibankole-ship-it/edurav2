# Mock Exam Features - Visual Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         AKBOY SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐         ┌──────────────────────┐       │
│  │   STUDENT SIDE       │         │    ADMIN SIDE        │       │
│  ├──────────────────────┤         ├──────────────────────┤       │
│  │                      │         │                      │       │
│  │ Reprint Admit Slip   │         │ Student Batches      │       │
│  │   (Public URL)       │         │    Dashboard         │       │
│  │  /reprint-admit-slip │         │                      │       │
│  │                      │         │ • View all students  │       │
│  │ • Enter reg number   │         │ • See batch assign   │       │
│  │ • Download slip      │         │ • Filter & search    │       │
│  │ • View new date      │         │ • Export to CSV      │       │
│  │ • Print/Save PDF     │         │                      │       │
│  └──────────────┬───────┘         └──────────┬───────────┘       │
│                 │                            │                   │
│                 │                 ┌──────────────────────┐        │
│                 │                 │  Exam Day Verify     │        │
│                 │                 ├──────────────────────┤        │
│                 │                 │                      │        │
│                 │                 │ • Scan admit slip    │        │
│                 │                 │ • Manual search      │        │
│                 │                 │ • Mark present/absent│        │
│                 │                 │ • Record timestamp   │        │
│                 │                 │ • Real-time stats    │        │
│                 │                 └──────────────────────┘        │
│                 │                            │                   │
│                 └────────────┬───────────────┘                   │
│                              │                                    │
│                    ┌─────────▼──────────┐                         │
│                    │  Supabase          │                         │
│                    │  Database          │                         │
│                    │                    │                         │
│                    │ • mock_registrations│                        │
│                    │ • mock_batches     │                         │
│                    │ • mock_results     │                         │
│                    │ • mock_settings    │                         │
│                    └────────────────────┘                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Registration → Batch Assignment → Admit Slip Flow

```
REGISTRATION PHASE
┌──────────────┐
│   Student    │
│   Registers  │
└─────┬────────┘
      │
      ▼
┌──────────────┐         ┌───────────────────┐
│ Registration │────────▶│  Auto-Assigned    │
│  Submitted   │         │  to Batch         │
└──────────────┘         └────────┬──────────┘
                                  │
                                  ▼
                        ┌──────────────────┐
                        │  Admit Slip      │
                        │  Generated       │
                        │  (with batch     │
                        │   date & venue)  │
                        └─────────┬────────┘
                                  │
                    ┌─────────────┴──────────┐
                    │                        │
                    ▼                        ▼
          ┌──────────────────┐    ┌──────────────────┐
          │ Student Views    │    │ Admin Sees       │
          │ on Dashboard     │    │ in Admin Portal  │
          │ or Downloaded    │    │ (Student Batches │
          └──────────────────┘    │  tab)            │
                                   └──────────────────┘

IF BATCH CHANGES LATER:
   Batch Date/Venue Updated
          │
          ▼
   ┌──────────────────┐
   │ Dashboard Shows  │
   │ Updated Info     │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────┐
   │ Student Reprints │
   │ Gets New Slip    │ ◄──── /reprint-admit-slip
   │ with Updated     │       Public Page
   │ Date & Venue     │
   └──────────────────┘
```

### 2. Exam Day Workflow

```
EXAM DAY TIMELINE
┌──────────────────────────────────────────────────────────┐
│                   MORNING                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Student Arrives with Admit Slip                    │  │
│  └────────────────┬─────────────────────────────────┘  │
│                   │                                     │
│                   ▼                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Registration Desk: Admin Opens Verify Page         │  │
│  │ ┌──────────────────────────────────────────────┐  │  │
│  │ │ "Verify Students" Tab in Admin Portal        │  │  │
│  │ └──────────────┬───────────────────────────────┘  │  │
│  │                │                                   │  │
│  │    ┌───────────┴──────────────┐                   │  │
│  │    │                          │                   │  │
│  │    ▼                          ▼                   │  │
│  │ ┌──────────────┐      ┌──────────────┐            │  │
│  │ │ Barcode Scan │      │ Manual Search│            │  │
│  │ │ Admit Slip   │      │ by Reg #     │            │  │
│  │ └──────┬───────┘      └──────┬───────┘            │  │
│  │        └──────────┬──────────┘                     │  │
│  │                   │                                │  │
│  │                   ▼                                │  │
│  │        ┌──────────────────────────┐               │  │
│  │        │ Student Details Show     │               │  │
│  │        │ - Name                   │               │  │
│  │        │ - Registration #         │               │  │
│  │        │ - Batch Assignment       │               │  │
│  │        └──────┬────────────────────┘               │  │
│  │               │                                    │  │
│  │               ▼                                    │  │
│  │        ┌──────────────────────────┐               │  │
│  │        │ Verify Presence          │               │  │
│  │        │ ┌──────────────────────┐ │               │  │
│  │        │ │ Mark Present │ Absent│ │               │  │
│  │        │ └────┬─────────────┬───┘ │               │  │
│  │        └─────┼─────────┼──────────┘               │  │
│  │              │         │                          │  │
│  │              ▼         ▼                          │  │
│  │         ┌────────┐  ┌──────────┐                  │  │
│  │         │ Status │  │ Status   │                  │  │
│  │         │Changed │  │ Remains  │                  │  │
│  │         │to STARTED│ REGISTERED│                  │  │
│  │         └────┬───┘  └──────────┘                  │  │
│  │              │                                    │  │
│  │ ┌────────────▼─────────────────────────────────┐ │  │
│  │ │ Dashboard Updates Instantly:                  │ │  │
│  │ │ ✓ Shows "Verified" with green checkmark      │ │  │
│  │ │ ✓ Records verification timestamp             │ │  │
│  │ │ ✓ Updates verified count in statistics       │ │  │
│  │ │ ✓ Available for admin to export report       │ │  │
│  │ └────────────────────────────────────────────── ┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│                   DURING EXAM                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Student logs in → Exam starts                      │  │
│  │ Status updates to "Started" in system              │  │
│  │ Admin can monitor from dashboard                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│                   AFTER EXAM                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Student submits exam                               │  │
│  │ Status updates to "Submitted"                      │  │
│  │ Results calculated and released when ready         │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 3. Admin Dashboard Usage Pattern

```
ADMIN PORTAL - STUDENT BATCHES TAB
┌────────────────────────────────────────────────────┐
│ STATISTICS (Quick Overview)                         │
│ ┌──────────┬───────────┬───────────┬──────────────┐│
│ │Total: 250│ Submitted:│ Payments: │ Active Batch:│
│ │          │ 180       │ 240       │ 5            │
│ └──────────┴───────────┴───────────┴──────────────┘│
│                                                    │
│ FILTERS & SEARCH                                   │
│ ┌──────────────────────────────────────────────────┐│
│ │ Search: [student name/reg#/phone]                 ││
│ │ Batch:  [Select Batch ▼]                          ││
│ │ Mode:   [All Modes ▼]                             ││
│ │ Status: [All Statuses ▼]                          ││
│ │                                      [Export CSV] ││
│ └──────────────────────────────────────────────────┘│
│                                                    │
│ STUDENT TABLE                                      │
│ ┌──────────────────────────────────────────────────┐│
│ │ REG #    │ NAME      │ BATCH     │ DATE  │ MODE  ││
│ │────────────────────────────────────────────────── ││
│ │ AMB2026001│ Ahmed Ali │ Batch 1   │ Apr 4 │Phys  ││
│ │     ▼     │           │           │       │      ││
│ │────────────────────────────────────────────────── ││
│ │▶ Expanded details                      [?] [◄►]  ││
│ │  Subjects: English, Math, Physics                ││
│ │  Email: ahmed@example.com                        ││
│ │  Timeline: Registered 3/1, Started 4/4, Submitted││
│ │────────────────────────────────────────────────── ││
│ │ (more rows...)                                    ││
│ └──────────────────────────────────────────────────┘│
│                                                    │
│ DETAILS MODAL (Optional)                           │
│ ┌──────────────────────────────────────────────────┐│
│ │ X REGISTRATION DETAILS                            ││
│ │ ┌──────────────────────────────────────────────┐ ││
│ │ │ Reg #: AMB2026001                            │ ││
│ │ │ Name: Ahmed Ali                              │ ││
│ │ │ Phone: +234...                               │ ││
│ │ │ Email: ahmed@example.com                     │ ││
│ │ │                                              │ ││
│ │ │ Batch: Physical Exam Batch                   │ ││
│ │ │ Date: April 4, 2026 09:00 AM                 │ ││
│ │ │ Venue: Lagos CBD                             │ ││
│ │ │                                              │ ││
│ │ │ Subjects: English, Math, Physics             │ ││
│ │ │ Payment: Verified ✓                          │ ││
│ │ └──────────────────────────────────────────────┘ ││
│ └──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

### 4. Exam Day Verification UI

```
ADMIN PORTAL - VERIFY STUDENTS TAB
┌────────────────────────────────────────────────────┐
│ 📊 STATISTICS                                      │
│ ┌────────┬─────────┬──────────────┬──────────────┐ │
│ │Total:  │ Verified│ Not Yet      │ Submitted:   │ │
│ │250     │ 220     │ 30           │ 180          │ │
│ └────────┴─────────┴──────────────┴──────────────┘ │
│                                                    │
│ 📱 BARCODE SCAN / MANUAL SEARCH                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ [Scan Registration #] ← Scanner Ready           │ │
│ │ Press Enter or scan barcode...                 │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ 🔍 OR SEARCH MANUALLY                             │
│ ┌────────────────────────────────────────────────┐ │
│ │ Search: [name/reg/phone]  Batch: [Select ▼]  │ │
│ │                            [Refresh]            │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ 👥 STUDENT LIST                                    │
│ ┌────────────────────────────────────────────────┐ │
│ │ ✓ Ahmed Ali                    [Verified] [Update]│
│ │   AKBOY2026001 │ +234...│ 09:15               │ │
│ │   Physical Exam Batch                          │ │
│ │                                                 │ │
│ │ ⏳ Zainab Okonkwo               [Pending] [Verify]│
│ │   AKBOY2026002 │ +234...│ -                   │ │
│ │   Physical Exam Batch                          │ │
│ │                                                 │ │
│ │ (more students...)                              │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ VERIFICATION DIALOG (When Clicked)                 │
│ ┌────────────────────────────────────────────────┐ │
│ │ ✓ VERIFY STUDENT PRESENCE                      │ │
│ │                                                 │ │
│ │ Name: Ahmed Ali                                 │ │
│ │ Reg #: AKBOY2026001                            │ │
│ │ Batch: Physical Exam Batch                     │ │
│ │                                                 │ │
│ │ Is this student present?                       │ │
│ │                                                 │ │
│ │ [✓ Yes, Mark Present]  [✗ No, Mark Absent]    │ │
│ └────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

### 5. Student Admit Slip Reprint Flow

```
STUDENT JOURNEY - REPRINT ADMIT SLIP
┌────────────────────────────────────────────────────┐
│ URL: https://akboy.ng/reprint-admit-slip           │
│ (Public - No Login Needed)                          │
├────────────────────────────────────────────────────┤
│                                                    │
│ STEP 1: SEARCH                                     │
│ ┌────────────────────────────────────────────────┐ │
│ │ 🔍 Enter Your Registration Number               │ │
│ │                                                 │ │
│ │ [AKBOY2026001        ] [SEARCH]                 │ │
│ │                                                 │ │
│ │ You received this number when you registered   │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ STEP 2: VERIFY                                     │
│ ┌────────────────────────────────────────────────┐ │
│ │ ✓ REGISTRATION FOUND!                           │ │
│ │                                                 │ │
│ │ Name: Ahmed Ali                                 │ │
│ │ Reg #: AKBOY2026001                            │ │
│ │ Phone: +234 800 XXXX XXX                        │ │
│ │ Mode: Physical                                  │ │
│ │                                                 │ │
│ │ EXAM DETAILS                                    │ │
│ │ ┌──────────────────────────────────────────┐   │ │
│ │ │ Batch: Physical Exam Batch               │   │ │
│ │ │ Date: April 4, 2026, 9:00 AM             │   │ │
│ │ │ Venue: Lagos CBD Complex                 │   │ │
│ │ └──────────────────────────────────────────┘   │ │
│ │                                                 │ │
│ │ SUBJECTS: English | Math | Physics              │ │
│ │                                                 │ │
│ │ ✓ Important: Bring valid ID and this slip     │ │
│ │ ✓ Arrive 30 minutes early                     │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ STEP 3: DOWNLOAD                                   │
│ ┌────────────────────────────────────────────────┐ │
│ │           [📥 Download Admit Slip]              │ │
│ │                                                 │ │
│ │ ✓ Opens in new window/tab                       │ │
│ │ ✓ Beautiful formatted admit slip                │ │
│ │ ✓ Can print directly (Click Print)              │ │
│ │ ✓ Can save as PDF                               │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
│ STEP 4: ADMIT SLIP DOCUMENT                        │
│ ┌────────────────────────────────────────────────┐ │
│ │ ╔════════════════════════════════════════════╗ │ │
│ │ ║           AKBOY MOCK EXAM                 ║ │ │
│ │ ║         ADMIT SLIP - ENTRY PERMIT         ║ │ │
│ │ ╚════════════════════════════════════════════╝ │ │
│ │                                                 │ │
│ │  [═══════════════════════════════════════┐   │ │
│ │  │ REG #: AKBOY2026001                   │   │ │
│ │  │ Registration Number                   │   │ │
│ │  [═══════════════════════════════════════┘   │ │
│ │                                                 │ │
│ │  Name: Ahmed Ali                                │ │
│ │  Phone: +234 800 XXXX XXX                       │ │
│ │  Email: ahmed@email.com                        │ │
│ │                                                 │ │
│ │  📅 EXAM SCHEDULE                              │ │
│ │  ┌────────────────────────────────────────┐   │ │
│ │  │ Batch: Physical Exam Batch             │   │ │
│ │  │ Date: 4 April 2026, 09:00 AM           │   │ │
│ │  │ Venue: Lagos CBD Complex               │   │ │
│ │  └────────────────────────────────────────┘   │ │
│ │                                                 │ │
│ │  📚 SELECTED SUBJECTS                           │ │
│ │  [ English | Math | Physics ]                   │ │
│ │                                                 │ │
│ │  ⚠️ IMPORTANT                                   │ │
│ │  • Arrive 30 minutes early                      │ │
│ │  • Bring valid ID and this slip                 │ │
│ │  • Ensure stable internet connection            │ │
│ │  • For support: contact@akboy.ng                │ │
│ │                                                 │ │
│ │ Printed: 3 April 2026, 2:45 PM                 │ │
│ │   [🖨️ Print] [💾 Save as PDF]                 │ │
│ └────────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

---

## Data Model

```
MOCK REGISTRATIONS TABLE
┌──────────────────────────────────┐
│ id (UUID, Primary Key)            │
│ registration_number (VARCHAR)     │
│ full_name (VARCHAR)               │
│ phone (VARCHAR)                   │
│ email (VARCHAR)                   │
│ mode (VARCHAR: virtual/physical)  │
│ subjects (JSONB)                  │
│ ├─ [0]: { id, name, questions }  │
│ ├─ [1]: { id, name, questions }  │
│ └─ [2]: { id, name, questions }  │
│ batch_id (UUID, FK)────────┐      │
│ payment_status (VARCHAR)    │     │
│ exam_status (VARCHAR)       │     │
│ exam_started_at (TIMESTAMPTZ)│    │
│ exam_submitted_at (TIMESTAMPTZ)│  │
│ ✨ NEW:                     │     │
│ verified_present (BOOLEAN)  │     │
│ verified_at (TIMESTAMPTZ)   │     │
│ created_at (TIMESTAMPTZ)    │     │
│ updated_at (TIMESTAMPTZ)    │     │
└──────────────┬───────────────┘     │
               │                     │
               │                     │
               └─────────────────────┪─────┐
                                     ▼     │
                    MOCK BATCHES TABLE     │
                    ┌─────────────────────┤
                    │ id (UUID, PK)       │
                    │ title (VARCHAR)     │
                    │ exam_date (TS)      │
                    │ exam_venue (TEXT)   │
                    │ is_active (BOOL)    │
                    │ results_released    │
                    │ created_at (TS)     │
                    │ updated_at (TS)     │
                    └─────────────────────┘
```

---

## Security & Access Control

```
PUBLIC ROUTES
│
├─ /akboy/reprint-admit-slip
│  └─ No auth needed
│     Only shows data for registration_number entered
│     ✓ Student can view own data
│     ✗ Cannot see others' data (no SQL injection, exact match)

ADMIN ONLY ROUTES
│
├─ Admin Portal > Student Batches
│  └─ Admin login required
│     ✓ Can view all registrations
│     ✓ Can filter and export
│     ✓ Can see batch assignments
│
├─ Admin Portal > Verify Students
│  └─ Admin login required
│     ✓ Can mark attendance
│     ✓ Can update exam status
│     ✓ Can see verification timestamps

DATABASE
│
└─ RLS Policies (Row Level Security)
   ├─ Students: Can only see own data
   ├─ Admins: Can see all registrations
   ├─ Batches: Visible based on registration status
   └─ Results: Only visible to student if released
```

---

## Component Relationships

```
AdminPortal.tsx
│
├─ State: activeSection
├─ Navigation Buttons:
│  ├─ Student Batches → mock-dashboard
│  └─ Verify Students → exam-verification
│
├─ Renders (conditional):
│  │
│  ├─ activeSection === 'mock-dashboard'
│  │  └─ <MockExamDashboard />
│  │     ├─ Fetch registrations + batches
│  │     ├─ Display statistics
│  │     ├─ Filter & search functionality
│  │     ├─ Expandable rows
│  │     ├─ Details modal
│  │     └─ CSV export
│  │
│  └─ activeSection === 'exam-verification'
│     └─ <ExamDayVerification />
│        ├─ Fetch registrations + batches
│        ├─ Statistics display
│        ├─ Barcode scan input
│        ├─ Manual search
│        ├─ Student list with status
│        ├─ Verification dialog
│        └─ Real-time updates

PlatformRouter.tsx
│
├─ AkboyRoutes
│  └─ /reprint-admit-slip
│     └─ <ReprintAdmitSlip />
│        ├─ Registration number search
│        ├─ Fetch registration + batch
│        ├─ Display student info
│        ├─ Generate admit slip HTML
│        ├─ Print functionality
│        └─ PDF save capability
```

---

## Technology Stack

```
Frontend
├─ React + TypeScript
├─ Lucide React (Icons)
├─ date-fns (Date formatting)
├─ React Router (Navigation)
├─ Sonner (Notifications)
└─ Custom UI Components (Button, Card, Input, etc.)

Backend
├─ Supabase (Database & Auth)
├─ PostgreSQL (Database)
└─ Row Level Security (RLS)

Features
├─ Real-time data updates
├─ CSV export functionality
├─ PDF document generation
├─ Barcode/QR scanning support
├─ Print optimization
└─ Mobile responsive design
```

---

## Summary Table

| Feature | Access | Purpose | Key Feature |
|---------|--------|---------|------------|
| **Student Batches** | Admin | View all students & assignments | See batch dates/venues |
| **Verify Students** | Admin | Check in on exam day | Mark present/absent |
| **Reprint Slip** | Public | Download admit slip | Get updated exam info |

