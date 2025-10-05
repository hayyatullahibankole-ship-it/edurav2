import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExamResult {
  examTitle: string;
  studentName: string;
  studentEmail: string;
  examDate: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  score: number;
  percentage: number;
  timeTaken: number;
  timeAllotted: number;
  subjectBreakdown: Record<string, { total: number; correct: number; percentage: number }>;
  grade?: string;
  attemptId: string;
}

export const generateExamReportPDF = async (result: ExamResult): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Edura Brand Colors
  const eduraPrimary = [59, 130, 246]; // Blue
  const eduraAccent = [16, 185, 129]; // Emerald Green
  const eduraDark = [15, 23, 42]; // Slate Dark
  const successColor = [34, 197, 94]; // Green
  const warningColor = [251, 191, 36]; // Amber
  const dangerColor = [239, 68, 68]; // Red
  const lightGray = [248, 250, 252]; // Very light gray
  const textGray = [71, 85, 105]; // Slate gray

  // Helper function to get grade and color
  const getGradeInfo = (percentage: number) => {
    if (percentage >= 70) return { grade: 'A', color: successColor, description: 'Excellent Performance' };
    if (percentage >= 60) return { grade: 'B', color: eduraAccent, description: 'Good Performance' };
    if (percentage >= 50) return { grade: 'C', color: warningColor, description: 'Average Performance' };
    if (percentage >= 40) return { grade: 'D', color: [255, 140, 0], description: 'Below Average' };
    return { grade: 'F', color: dangerColor, description: 'Needs Improvement' };
  };

  const gradeInfo = getGradeInfo(result.percentage);

  // Page 1: Modern Header
  let yPosition = 0;

  // Gradient-style header background
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.rect(0, 0, pageWidth, 50, 'F');
  
  // Accent bar at top
  pdf.setFillColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.rect(0, 0, pageWidth, 4, 'F');
  
  // EDURA Logo/Brand
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EDURA', 20, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Computer Based Testing', 20, 32);
  
  // Report title on right
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXAM REPORT', pageWidth - 20, 25, { align: 'right' });
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.text(`Report ID: ${result.attemptId.substring(0, 8).toUpperCase()}`, pageWidth - 20, 32, { align: 'right' });

  yPosition = 60;

  // Modern Info Card
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.roundedRect(20, yPosition, pageWidth - 40, 50, 3, 3, 'F');
  
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STUDENT INFORMATION', 25, yPosition + 8);
  
  yPosition += 16;
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const studentInfo = [
    ['Student Name:', result.studentName],
    ['Email Address:', result.studentEmail],
    ['Examination:', result.examTitle],
    ['Test Date:', result.examDate]
  ];

  studentInfo.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(label, 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    pdf.text(value, 75, yPosition);
    yPosition += 8;
  });

  yPosition += 10;

  // Performance Summary with Modern Card
  pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERFORMANCE OVERVIEW', 20, yPosition);
  
  // Decorative line
  pdf.setDrawColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.setLineWidth(2);
  pdf.line(20, yPosition + 3, 80, yPosition + 3);
  
  yPosition += 15;

  // Modern score showcase
  const centerX = pageWidth / 2;
  const scoreBoxWidth = 140;
  const scoreBoxHeight = 70;
  const scoreBoxX = centerX - scoreBoxWidth / 2;
  
  // Score card with shadow effect
  pdf.setFillColor(245, 245, 245);
  pdf.roundedRect(scoreBoxX + 2, yPosition + 2, scoreBoxWidth, scoreBoxHeight, 5, 5, 'F');
  
  // Main score card
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 5, 5, 'F');
  
  // Border with grade color
  pdf.setDrawColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.setLineWidth(3);
  pdf.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 5, 5, 'S');
  
  // Large percentage score
  pdf.setTextColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.setFontSize(42);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${result.percentage.toFixed(0)}%`, centerX, yPosition + 30, { align: 'center' });
  
  // Grade badge
  pdf.setFontSize(18);
  pdf.text(`Grade ${gradeInfo.grade}`, centerX, yPosition + 48, { align: 'center' });
  
  // Description
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text(gradeInfo.description, centerX, yPosition + 60, { align: 'center' });

  yPosition += scoreBoxHeight + 20;

  // Modern Statistics Grid
  const stats = [
    { label: 'Total', value: result.totalQuestions, color: textGray, icon: '📝' },
    { label: 'Correct', value: result.correctAnswers, color: successColor, icon: '✓' },
    { label: 'Wrong', value: result.wrongAnswers, color: dangerColor, icon: '✗' },
    { label: 'Skipped', value: result.unanswered, color: warningColor, icon: '○' }
  ];

  const boxWidth = (pageWidth - 50) / 4;
  const boxHeight = 35;

  stats.forEach((stat, index) => {
    const xPos = 20 + index * (boxWidth + 3);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(xPos, yPosition, boxWidth, boxHeight, 3, 3, 'F');
    
    // Colored top border
    pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.roundedRect(xPos, yPosition, boxWidth, 4, 1, 1, 'F');
    
    // Value
    pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.text(stat.value.toString(), xPos + boxWidth / 2, yPosition + 19, { align: 'center' });
    
    // Label
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(stat.label, xPos + boxWidth / 2, yPosition + 29, { align: 'center' });
  });

  yPosition += boxHeight + 20;

  // Time Statistics Card
  pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  pdf.roundedRect(20, yPosition, pageWidth - 40, 42, 3, 3, 'F');
  
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('⏱️ TIME ANALYSIS', 25, yPosition + 8);
  
  yPosition += 16;

  const timeStats = [
    ['Duration Allowed:', `${result.timeAllotted} min`],
    ['Time Utilized:', `${result.timeTaken} min`],
    ['Avg. per Question:', `${(result.timeTaken / result.totalQuestions).toFixed(1)} min`]
  ];

  pdf.setFontSize(10);
  const timeColWidth = (pageWidth - 50) / 3;
  timeStats.forEach(([label, value], idx) => {
    const xPos = 25 + idx * timeColWidth;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(label, xPos, yPosition);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    pdf.text(value, xPos, yPosition + 8);
  });

  yPosition += 22;

  // Subject Breakdown (if fits on page, otherwise on next page)
  if (yPosition + 70 > pageHeight - 25) {
    pdf.addPage();
    yPosition = 20;
    
    // Re-add header on new page
    pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.rect(0, 0, pageWidth, 15, 'F');
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EDURA - Exam Report (Continued)', 20, 10);
    yPosition = 25;
  } else {
    yPosition += 15;
  }

  pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('📊 SUBJECT PERFORMANCE', 20, yPosition);
  
  // Decorative line
  pdf.setDrawColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.setLineWidth(2);
  pdf.line(20, yPosition + 3, 95, yPosition + 3);
  
  yPosition += 15;

  // Modern table header
  const colWidths = [70, 25, 30, 25, 40];
  const colPositions = [20, 90, 115, 145, 170];
  
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.roundedRect(20, yPosition, pageWidth - 40, 12, 2, 2, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  
  const headers = ['Subject Name', 'Total', 'Correct', 'Wrong', 'Score'];
  headers.forEach((header, index) => {
    pdf.text(header, colPositions[index] + 3, yPosition + 8);
  });
  
  yPosition += 12;

  // Subject rows with modern styling
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  
  Object.entries(result.subjectBreakdown).forEach((entry, index) => {
    const [subject, stats] = entry;
    const rowHeight = 11;
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(20, yPosition, pageWidth - 40, rowHeight, 1, 1, 'F');
    }
    
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    
    // Subject name
    const truncatedSubject = subject.length > 25 ? subject.substring(0, 22) + '...' : subject;
    pdf.setFont('helvetica', 'bold');
    pdf.text(truncatedSubject, colPositions[0] + 3, yPosition + 7);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(stats.total.toString(), colPositions[1] + 3, yPosition + 7);
    pdf.text(stats.correct.toString(), colPositions[2] + 3, yPosition + 7);
    pdf.text((stats.total - stats.correct).toString(), colPositions[3] + 3, yPosition + 7);
    
    // Percentage with color badge
    const percentage = stats.percentage;
    let badgeColor;
    if (percentage >= 70) badgeColor = successColor;
    else if (percentage >= 50) badgeColor = warningColor;
    else badgeColor = dangerColor;
    
    pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    pdf.roundedRect(colPositions[4] + 2, yPosition + 2, 30, 7, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${percentage.toFixed(0)}%`, colPositions[4] + 17, yPosition + 7, { align: 'center' });
    
    yPosition += rowHeight;
  });

  // Modern Footer
  const footerY = pageHeight - 15;
  
  // Footer background
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
  
  // Accent line
  pdf.setFillColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.rect(0, footerY - 5, pageWidth, 2, 'F');
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);
  pdf.text('© EDURA - Computer Based Testing Platform', 20, footerY + 3);
  
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, footerY + 3, { align: 'right' });

  // Save the PDF with branded name
  const fileName = `EDURA-Exam-Report-${new Date().toISOString().split('T')[0]}-${result.attemptId.substring(0, 8).toUpperCase()}.pdf`;
  pdf.save(fileName);
};

export const generateSimplePDFReport = (result: ExamResult): void => {
  const pdf = new jsPDF();
  
  pdf.setFontSize(20);
  pdf.text('Exam Report', 20, 20);
  
  pdf.setFontSize(12);
  let y = 40;
  const lineHeight = 8;
  
  const reportData = [
    `Student: ${result.studentName}`,
    `Email: ${result.studentEmail}`,
    `Exam: ${result.examTitle}`,
    `Date: ${result.examDate}`,
    ``,
    `Score: ${result.correctAnswers}/${result.totalQuestions} (${result.percentage.toFixed(1)}%)`,
    `Correct Answers: ${result.correctAnswers}`,
    `Wrong Answers: ${result.wrongAnswers}`,
    `Unanswered: ${result.unanswered}`,
    `Time Taken: ${result.timeTaken} minutes`,
    ``,
    `Subject Breakdown:`
  ];
  
  reportData.forEach(line => {
    pdf.text(line, 20, y);
    y += lineHeight;
  });
  
  Object.entries(result.subjectBreakdown).forEach(([subject, stats]) => {
    pdf.text(`- ${subject}: ${stats.correct}/${stats.total} (${stats.percentage}%)`, 25, y);
    y += lineHeight;
  });
  
  pdf.save(`simple-report-${result.attemptId}.pdf`);
};