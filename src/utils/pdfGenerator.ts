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
  
  // Define colors
  const primaryColor = [59, 130, 246]; // Blue
  const secondaryColor = [99, 102, 241]; // Indigo
  const successColor = [34, 197, 94]; // Green
  const warningColor = [245, 158, 11]; // Amber
  const dangerColor = [239, 68, 68]; // Red
  const grayColor = [107, 114, 128]; // Gray

  // Helper function to get grade and color
  const getGradeInfo = (percentage: number) => {
    if (percentage >= 70) return { grade: 'A', color: successColor, description: 'Excellent' };
    if (percentage >= 60) return { grade: 'B', color: primaryColor, description: 'Good' };
    if (percentage >= 50) return { grade: 'C', color: warningColor, description: 'Average' };
    if (percentage >= 40) return { grade: 'D', color: [255, 140, 0], description: 'Below Average' };
    return { grade: 'F', color: dangerColor, description: 'Fail' };
  };

  const gradeInfo = getGradeInfo(result.percentage);

  // Page 1: Main Report
  let yPosition = 20;

  // Header with logo area
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXAMINATION REPORT', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Computer Based Test Results', pageWidth / 2, 28, { align: 'center' });

  yPosition = 50;

  // Student Information Section
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STUDENT INFORMATION', 20, yPosition);
  
  yPosition += 10;
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  const studentInfo = [
    ['Name:', result.studentName],
    ['Email:', result.studentEmail],
    ['Exam:', result.examTitle],
    ['Date:', result.examDate],
    ['Attempt ID:', result.attemptId]
  ];

  studentInfo.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 70, yPosition);
    yPosition += 7;
  });

  yPosition += 10;

  // Performance Summary Section
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PERFORMANCE SUMMARY', 20, yPosition);
  
  yPosition += 10;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // Score circle/badge
  const centerX = pageWidth / 2;
  const circleRadius = 30;
  
  // Draw main circle
  pdf.setFillColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.circle(centerX, yPosition + circleRadius, circleRadius, 'F');
  
  // Score text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${result.percentage.toFixed(1)}%`, centerX, yPosition + circleRadius - 5, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.text(`Grade ${gradeInfo.grade}`, centerX, yPosition + circleRadius + 8, { align: 'center' });

  // Grade description
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(gradeInfo.description, centerX, yPosition + circleRadius + 20, { align: 'center' });

  yPosition += circleRadius * 2 + 30;

  // Statistics boxes
  const stats = [
    { label: 'Total Questions', value: result.totalQuestions, color: grayColor },
    { label: 'Correct', value: result.correctAnswers, color: successColor },
    { label: 'Wrong', value: result.wrongAnswers, color: dangerColor },
    { label: 'Unanswered', value: result.unanswered, color: warningColor }
  ];

  const boxWidth = (pageWidth - 60) / 4;
  const boxHeight = 25;

  stats.forEach((stat, index) => {
    const xPos = 20 + index * (boxWidth + 5);
    
    // Box background
    pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.rect(xPos, yPosition, boxWidth, boxHeight, 'F');
    
    // Value
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(stat.value.toString(), xPos + boxWidth / 2, yPosition + 12, { align: 'center' });
    
    // Label
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(stat.label, xPos + boxWidth / 2, yPosition + 20, { align: 'center' });
  });

  yPosition += boxHeight + 20;

  // Time Analysis
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TIME ANALYSIS', 20, yPosition);
  
  yPosition += 10;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  const timeStats = [
    ['Time Allowed:', `${result.timeAllotted} minutes`],
    ['Time Taken:', `${result.timeTaken} minutes`],
    ['Time Remaining:', `${Math.max(0, result.timeAllotted - result.timeTaken)} minutes`],
    ['Average per Question:', `${(result.timeTaken / result.totalQuestions).toFixed(1)} minutes`]
  ];

  pdf.setFontSize(12);
  timeStats.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, 25, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, 100, yPosition);
    yPosition += 7;
  });

  // Subject Breakdown (if fits on page, otherwise on next page)
  if (yPosition + 60 > pageHeight - 20) {
    pdf.addPage();
    yPosition = 20;
  } else {
    yPosition += 15;
  }

  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUBJECT BREAKDOWN', 20, yPosition);
  
  yPosition += 10;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // Subject table header
  const tableStartY = yPosition;
  const colWidths = [60, 30, 30, 30, 40];
  const colPositions = [20, 80, 110, 140, 170];
  
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 15, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  
  const headers = ['Subject', 'Total', 'Correct', 'Wrong', 'Percentage'];
  headers.forEach((header, index) => {
    pdf.text(header, colPositions[index] + 5, yPosition + 5);
  });
  
  yPosition += 15;

  // Subject rows
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');
  
  Object.entries(result.subjectBreakdown).forEach((entry, index) => {
    const [subject, stats] = entry;
    const isEven = index % 2 === 0;
    
    if (isEven) {
      pdf.setFillColor(248, 250, 252); // Light gray
      pdf.rect(20, yPosition - 3, pageWidth - 40, 12, 'F');
    }
    
    pdf.setTextColor(0, 0, 0);
    
    // Subject name (truncated if too long)
    const truncatedSubject = subject.length > 20 ? subject.substring(0, 17) + '...' : subject;
    pdf.text(truncatedSubject, colPositions[0] + 5, yPosition + 5);
    
    pdf.text(stats.total.toString(), colPositions[1] + 5, yPosition + 5);
    pdf.text(stats.correct.toString(), colPositions[2] + 5, yPosition + 5);
    pdf.text((stats.total - stats.correct).toString(), colPositions[3] + 5, yPosition + 5);
    
    // Percentage with color coding
    const percentage = stats.percentage;
    if (percentage >= 70) pdf.setTextColor(successColor[0], successColor[1], successColor[2]);
    else if (percentage >= 50) pdf.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
    else pdf.setTextColor(dangerColor[0], dangerColor[1], dangerColor[2]);
    
    pdf.text(`${percentage}%`, colPositions[4] + 5, yPosition + 5);
    pdf.setTextColor(0, 0, 0);
    
    yPosition += 12;
  });

  // Footer
  const footerY = pageHeight - 20;
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  pdf.text('Generated by Exam Platform', 20, footerY);
  pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, pageWidth - 20, footerY, { align: 'right' });

  // Save the PDF
  pdf.save(`exam-report-${result.attemptId}.pdf`);
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