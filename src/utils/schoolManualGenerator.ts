import jsPDF from "jspdf";

export const generateSchoolManual = () => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text: string, fontSize: number = 11, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, contentWidth);
    
    lines.forEach((line: string) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += fontSize * 0.5;
    });
    yPosition += 5;
  };

  // Helper function to add section
  const addSection = (title: string, content: string) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }
    addText(title, 14, true);
    addText(content, 11, false);
    yPosition += 5;
  };

  // Cover Page
  doc.setFillColor(59, 130, 246); // Primary blue
  doc.rect(0, 0, pageWidth, 80, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("School Dashboard", pageWidth / 2, 35, { align: "center" });
  
  doc.setFontSize(16);
  doc.text("User Manual", pageWidth / 2, 50, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("WAEC • JAMB • NECO CBT Practice Platform", pageWidth / 2, 65, { align: "center" });
  
  doc.setTextColor(0, 0, 0);
  yPosition = 100;

  addText("Welcome to your School Dashboard! This manual will guide you through all features and help you get the most out of the platform.", 12);
  yPosition += 10;

  // Table of Contents
  addText("Table of Contents", 16, true);
  const tocItems = [
    "1. Getting Started",
    "2. Dashboard Overview",
    "3. Managing Students",
    "4. Viewing Reports",
    "5. Monitoring Performance",
    "6. Billing & Subscriptions",
    "7. Account Settings",
    "8. Support & Contact"
  ];
  tocItems.forEach(item => addText(item, 11));
  yPosition += 10;

  // Page 2 - Getting Started
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "1. Getting Started",
    "After logging in with your school credentials, you'll land on the Overview page. This is your central hub for monitoring all activities."
  );

  addSection(
    "Key Features at a Glance:",
    "• Real-time student performance tracking\n• Comprehensive analytics and reports\n• Easy student management\n• Secure payment and subscription management"
  );

  // Page 3 - Dashboard Overview
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "2. Dashboard Overview",
    "The Overview page displays key metrics and quick actions to help you stay informed about your school's performance."
  );

  addSection(
    "What You'll See:",
    "• Total Students: Current number of registered students\n• Active This Week: Students who practiced this week\n• Average Score: Overall performance across all students\n• School Code: Share this code with students for registration"
  );

  addSection(
    "Quick Actions Panel:",
    "Use the Quick Actions panel to:\n• Add new students\n• Download reports\n• View all students\n• Access detailed analytics"
  );

  // Page 4 - Managing Students
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "3. Managing Students",
    "Navigate to the Students tab from the sidebar to manage your student accounts."
  );

  addSection(
    "Adding Students (Two Methods):",
    "Method 1: Individual Addition\n1. Click 'Add Student' button\n2. Fill in student details (name, email, class)\n3. Click 'Create Student'\n4. Student receives login credentials via email\n\nMethod 2: Bulk Upload\n1. Click 'Bulk Upload' button\n2. Download the Excel template\n3. Fill in student details in the template\n4. Upload the completed file\n5. System processes and creates all accounts"
  );

  addSection(
    "Managing Student Accounts:",
    "• View: Click on any student to see detailed performance\n• Edit: Update student information\n• Reset Password: Generate new login credentials\n• Deactivate: Temporarily disable student access\n• Export: Download student list as Excel/PDF"
  );

  // Page 5 - Reports
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "4. Viewing Reports",
    "The Reports section provides comprehensive analytics on student performance."
  );

  addSection(
    "Available Report Types:",
    "• Individual Performance: Detailed breakdown per student\n• Subject Analysis: Performance across different subjects\n• Practice History: Tracking study patterns\n• Weak Areas: Subjects needing improvement\n• Comparison Reports: School-wide performance trends"
  );

  addSection(
    "Exporting Reports:",
    "1. Navigate to Reports tab\n2. Select report type and date range\n3. Click 'Export' button\n4. Choose format (PDF or Excel)\n5. Report downloads automatically"
  );

  // Page 6 - Performance Monitoring
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "5. Monitoring Performance",
    "Track student engagement and identify areas needing attention."
  );

  addSection(
    "Performance Metrics:",
    "• Student Engagement: Practice frequency and duration\n• Score Trends: Performance improvement over time\n• Top Performers: Students excelling in practice\n• At-Risk Students: Those needing additional support\n• Subject Mastery: Proficiency levels per subject"
  );

  addSection(
    "Real-time Activity Feed:",
    "Monitor live activity including:\n• Students currently practicing\n• Recent test completions\n• New registrations\n• Achievement milestones"
  );

  // Page 7 - Billing
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "6. Billing & Subscriptions",
    "Manage your school's subscription and payment history."
  );

  addSection(
    "Current Plan Information:",
    "View your active subscription details:\n• Student limit\n• Expiration date\n• Subscription price\n• Remaining days"
  );

  addSection(
    "Making Payments:",
    "1. Go to Billing tab\n2. Click 'Upgrade Plan' if needed\n3. Select student count\n4. Complete payment securely\n5. Subscription activates immediately"
  );

  addSection(
    "Payment History:",
    "View all past transactions with:\n• Payment date\n• Transaction reference\n• Amount paid\n• Payment status"
  );

  // Page 8 - Settings & Support
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "7. Account Settings",
    "Update your school information and security settings."
  );

  addSection(
    "School Information:",
    "Keep your details current:\n• School name\n• Contact email\n• Phone number\n• Physical address\n• State/Location"
  );

  addSection(
    "Security:",
    "Change your password regularly:\n1. Navigate to Settings\n2. Enter new password\n3. Confirm password\n4. Save changes"
  );

  addSection(
    "8. Support & Contact",
    "We're here to help! Contact us anytime:\n\n📱 WhatsApp: +234 906 161 5303\n📧 Email: support@edura.com\n🌐 Live Chat: Available in dashboard\n\nSupport Hours: 24/7 for Premium Schools\n\nCommon Issues:\n• Password Reset: Click 'Forgot Password' on login\n• Student Can't Login: Check student list for correct credentials\n• Payment Issues: Contact support with transaction reference\n• Technical Problems: Use in-app chat for quick resolution"
  );

  // Page 9 - Tips & Best Practices
  doc.addPage();
  yPosition = margin;
  
  addSection(
    "Tips for Success",
    "Maximize your platform usage with these recommendations:"
  );

  addSection(
    "Best Practices:",
    "✓ Review reports weekly to identify struggling students\n✓ Encourage daily practice (even 15 minutes helps)\n✓ Use bulk upload for faster student registration\n✓ Export reports before parent-teacher meetings\n✓ Monitor weak topics to guide classroom teaching\n✓ Set practice targets for students\n✓ Celebrate top performers to motivate others\n✓ Renew subscription early to avoid downtime"
  );

  addSection(
    "Recommended Schedule:",
    "Monday: Review weekend practice activity\nWednesday: Check mid-week progress\nFriday: Export weekly reports\nMonthly: Comprehensive performance review"
  );

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      "Edura CBT Platform - School Dashboard Manual",
      margin,
      pageHeight - 10
    );
  }

  // Save the PDF
  doc.save("Edura-School-Dashboard-Manual.pdf");
};
