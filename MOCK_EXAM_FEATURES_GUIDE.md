# Mock Exam Management Features Guide

This guide explains how to use the three new features for managing AKBOY mock exams: viewing student batch assignments, verifying students on exam day, and allowing students to reprint admit slips.

## 1. Mock Exam Dashboard (View Student Batch Assignments)

### Purpose
View all registered students, see which batch they're assigned to, their exam date/venue, and track their exam progress.

### How to Access
1. Log in to Admin Portal
2. Navigate to **AKBOY Mock Exam** section
3. Click on **Student Batches** tab

### Features

#### Dashboard Overview
- **Total Registrations**: Count of all students registered
- **Exams Submitted**: Number of completed exams
- **Payments Verified**: Number of verified payments
- **Active Batches**: Number of available exam batches

#### Search & Filter
- **Search by**: Registration number, student name, or phone number
- **Filter by Batch**: See only students in a specific batch
- **Filter by Mode**: Virtual or Physical exams
- **Filter by Status**: Registered, Started, or Submitted

#### Student Information Display
Each student row shows:
- **Registration Number** (unique identifier)
- **Student Name** and Phone
- **Assigned Batch** with Venue
- **Exam Date** (formatted date and time)
- **Exam Mode** (Virtual/Physical)
- **Exam Status** (Registered/Started/Submitted)
- **Payment Status** (Pending/Verified/Waived)

#### Expandable Details
Click the expand icon (▼) on any student row to see:
- Full contact information
- List of selected subjects
- Timeline (registration date, exam start, submission time)

#### Export to CSV
Click **Export CSV** button to download all visible registrations as a spreadsheet.

#### View Full Details
Click the eye icon to open a detailed modal showing:
- Complete registration information
- Assigned batch details
- Subject selections
- Payment status
- All timeline dates

---

## 2. Exam Day Verification

### Purpose
Check in students on exam day, mark them as present/absent, and track attendance.

### How to Access
1. Log in to Admin Portal
2. Navigate to **AKBOY Mock Exam** section
3. Click on **Verify Students** tab

### Features

#### Quick Statistics
- **Total Registrations**: All registered students for selected batch
- **Verified Present**: Students marked as attending
- **Not Yet Verified**: Students still pending check-in
- **Exams Submitted**: Students who completed the exam

#### Methods to Check In Students

##### Method 1: Barcode/QR Code Scanning
1. Connect a barcode/QR code scanner to your device
2. Scan the registration number from the admit slip
3. The system will automatically find the student
4. A verification dialog will appear

##### Method 2: Manual Search
1. Enter search term in the search field (registration number, name, or phone)
2. Select the batch from the filter (optional)
3. Find the student in the list below
4. Click **Verify** button on their row

#### Verification Process
1. **Review Student Details**:
   - Confirm student name
   - Check registration number
   - Verify batch assignment

2. **Mark Attendance**:
   - Click **"Yes, Mark Present"** if student is attending
   - Click **"No, Mark Absent"** if student is not present

3. **Confirmation**:
   - System updates the exam status to "Started"
   - Timestamp of verification is recorded
   - Student appears with green checkmark in the list

#### Status Indicators
- **Green Checkmark**: Student verified and present
- **Yellow Badge**: Student not yet verified
- **"Update" Button**: Can change previous verification decision

#### Real-time Updates
The list automatically shows:
- Verified students grouped at top
- Time of verification recorded
- Real-time status updates without page refresh

---

## 3. Student Admit Slip Reprint

### Purpose
Allow students to download updated admit slips if their exam batch or date changed.

### Student Access (Public Page)

#### URL
`https://akboy.ng/reprint-admit-slip`

#### How Students Use It

1. **Enter Registration Number**
   - Students receive this during registration (e.g., AKBOY2026001)
   - Case-insensitive entry

2. **Search**
   - Click "Search" button or press Enter
   - System retrieves their registration details

3. **Verify Information**
   If found, students see:
   - Full name
   - Registration number
   - Phone number
   - Exam mode (Virtual/Physical)
   - Assigned batch and exam details
   - Selected subjects
   - Latest exam date and venue

4. **Download Admit Slip**
   - Click **"Download Admit Slip"** button
   - Beautiful formatted admit slip opens in browser
   - Can print directly or save as PDF

#### Admit Slip Contents
The admit slip includes:
- Student registration number (prominently displayed)
- Student full name
- Contact information
- Exam batch and schedule
- Exam date and time
- Exam venue
- All selected subjects
- Important exam day instructions
- Print timestamp

#### Printing Options
- **Direct Print**: Click print button or Ctrl+P after opening
- **Save as PDF**: Use browser's print-to-PDF feature
- **Mobile**: Can save to device and share if needed

---

## Database Schema

### New Columns Added
The following columns were added to the `mock_registrations` table:

```sql
verified_present BOOLEAN DEFAULT NULL
verified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
```

### These track:
- Whether student attended on exam day
- Exact timestamp of verification

---

## Workflow Example

### Registration Day
1. Student registers via `/mock-registration`
2. Student automatically assigned to a batch
3. Student receives admit slip during registration
4. Admit slip saved/printed

### Exam Date Announced
1. Admin updates batch dates and venues
2. System automatically associates registrations with batches
3. Students can reprint admit slip to get updated info via `/reprint-admit-slip`

### Exam Day

#### Morning (Check-in)
1. Admin opens **Verify Students** panel
2. Server with scanning devices at entrance
3. As students arrive, barcode/admit slip scanned
4. System marks them present
5. List shows real-time check-in progress

#### During Exam
- Students log in with their registration details
- Exam status automatically updates to "started"

#### After Exam
- Exam status updates to "submitted"
- Results released when admin triggers it

### Results Release
1. Admin goes to **Student Batches** dashboard
2. Filters by status to see who submitted
3. Exports list if needed
4. Results published when ready

---

## Tips & Best Practices

### For Admins

- **Batch Management**: Always set exam dates and venues BEFORE registration deadline
- **Verification**: Have verification devices ready and tested on exam morning
- **Backup Plan**: Keep printed list of registrations in case scanning fails
- **Communication**: Send batch assignment reminder 7 days before exam
- **Excel Backup**: Regularly export CSV for backup records

### For Students

- **Keep Registration Number**: Save or screenshot their registration number
- **Reprint Early**: If batch changes, reprint admit slip at least 24 hours before exam
- **Print Hard Copy**: Don't rely solely on phones; print a paper copy
- **Arrive Early**: Come 30 minutes before exam start time
- **Bring ID**: Always bring valid identification on exam day

### Technical Notes

- All data is stored in Supabase with RLS policies
- Verification marks the actual exam start time
- Updates are real-time with live dashboard refresh
- CSV exports include all fields for reporting
- Admit slip is responsive and prints beautifully on mobile

---

## Troubleshooting

### Student Can't Find Registration
- Verify correct registration number (case-insensitive)
- Check if registration exists in database
- Ensure student has finished registration process

### Can't Verify Student on Exam Day
- Check internet connection
- Verify student's registration number is correct
- Ensure student is registered for an active batch
- Try manual search if barcode scanning fails

### Admit Slip Not Printing
- Try different browser
- Check PDF printer availability
- Use "Save as PDF" option instead of physical printer
- Ensure JavaScript is enabled

### Batch Not Showing in Filter
- Only active batches appear (is_active = true)
- Go to Mock Exam Manager to activate batch if needed

---

## API Integration (If Needed)

For integrating with external systems:

**Verify Student Presence (RPC Function)**
```sql
-- Call from backend
SELECT * FROM verify_student_presence(
  registration_number := 'AKBOY2026001',
  present := true
);
```

**Get Batch Statistics**
```sql
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN exam_status = 'started' THEN 1 END) as verified_present,
  COUNT(CASE WHEN exam_status = 'registered' THEN 1 END) as not_verified
FROM mock_registrations
WHERE batch_id = '<batch-id>';
```

---

## Security Notes

- All student searches verify user is authenticated
- Admit slip contains only non-sensitive information
- Verification requires admin login
- All changes timestamped and logged
- RLS policies prevent unauthorized data access
