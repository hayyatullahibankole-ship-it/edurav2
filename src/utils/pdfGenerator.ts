import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import eduraLogo from '@/assets/edura-logo.png';

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
    if (percentage >= 70) return { grade: 'A', color: successColor, description: 'Excellent' };
    if (percentage >= 60) return { grade: 'B', color: eduraAccent, description: 'Good' };
    if (percentage >= 50) return { grade: 'C', color: warningColor, description: 'Average' };
    if (percentage >= 40) return { grade: 'D', color: [255, 140, 0], description: 'Fair' };
    return { grade: 'F', color: dangerColor, description: 'Poor' };
  };

  const gradeInfo = getGradeInfo(result.percentage);

  // ONE PAGE LAYOUT - Compact Design
  let yPosition = 0;

  // Header background
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  // Accent bar at top
  pdf.setFillColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.rect(0, 0, pageWidth, 4, 'F');
  
  // Add Edura Logo
  pdf.addImage(eduraLogo, 'PNG', 18, 10, 25, 25);
  
  // EDURA Brand Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EDURA', 46, 22);
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Computer Based Testing', 46, 29);
  
  // Report title on right
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXAM REPORT', pageWidth - 20, 22, { align: 'right' });
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.text(`ID: ${result.attemptId.substring(0, 8).toUpperCase()}`, pageWidth - 20, 29, { align: 'right' });

  yPosition = 53;

  // Info Section - Two columns
  const leftCol = 20;
  const rightCol = 115;
  
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STUDENT INFORMATION', leftCol, yPosition);
  
  yPosition += 8;
  pdf.setFontSize(10);
  
  const studentInfoLeft = [
    ['Student:', result.studentName],
    ['Exam:', result.examTitle]
  ];
  
  const studentInfoRight = [
    ['Email:', result.studentEmail],
    ['Date:', result.examDate]
  ];

  studentInfoLeft.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(label, leftCol, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    const truncatedValue = value.length > 30 ? value.substring(0, 27) + '...' : value;
    pdf.text(truncatedValue, leftCol + 20, yPosition);
    yPosition += 7;
  });
  
  let yPosRight = yPosition - 14;
  studentInfoRight.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(label, rightCol, yPosRight);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    const truncatedValue = value.length > 30 ? value.substring(0, 27) + '...' : value;
    pdf.text(truncatedValue, rightCol + 15, yPosRight);
    yPosRight += 7;
  });

  yPosition += 5;

  // Performance Section - Side by side layout
  const centerX = pageWidth / 2;
  const scoreBoxWidth = 60;
  const scoreBoxHeight = 50;
  const scoreBoxX = 20;
  
  // Score card
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 3, 3, 'F');
  
  // Border with grade color
  pdf.setDrawColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.setLineWidth(2.5);
  pdf.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 3, 3, 'S');
  
  // Large percentage score
  pdf.setTextColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${result.percentage.toFixed(0)}%`, scoreBoxX + scoreBoxWidth / 2, yPosition + 22, { align: 'center' });
  
  // Grade badge
  pdf.setFontSize(14);
  pdf.text(`Grade ${gradeInfo.grade}`, scoreBoxX + scoreBoxWidth / 2, yPosition + 34, { align: 'center' });
  
  // Description
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text(gradeInfo.description, scoreBoxX + scoreBoxWidth / 2, yPosition + 43, { align: 'center' });

  // Statistics Grid - Next to score
  const stats = [
    { label: 'Total', value: result.totalQuestions, color: textGray },
    { label: 'Correct', value: result.correctAnswers, color: successColor },
    { label: 'Wrong', value: result.wrongAnswers, color: dangerColor },
    { label: 'Skipped', value: result.unanswered, color: warningColor }
  ];

  const boxWidth = 35;
  const boxHeight = 24;
  const startX = scoreBoxX + scoreBoxWidth + 8;

  stats.forEach((stat, index) => {
    const xPos = startX + (index % 2) * (boxWidth + 3);
    const yPos = yPosition + Math.floor(index / 2) * (boxHeight + 3);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'F');
    
    // Colored top border
    pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.roundedRect(xPos, yPos, boxWidth, 3, 1, 1, 'F');
    
    // Value
    pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(stat.value.toString(), xPos + boxWidth / 2, yPos + 14, { align: 'center' });
    
    // Label
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(stat.label, xPos + boxWidth / 2, yPos + 20, { align: 'center' });
  });

  // Time info next to stats
  const timeX = startX + 2 * (boxWidth + 3) + 8;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text('TIME ANALYSIS', timeX, yPosition + 5);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Duration: ${result.timeAllotted}min`, timeX, yPosition + 12);
  pdf.text(`Used: ${result.timeTaken}min`, timeX, yPosition + 19);
  pdf.text(`Avg: ${(result.timeTaken / result.totalQuestions).toFixed(1)}min/q`, timeX, yPosition + 26);

  yPosition += Math.max(scoreBoxHeight, boxHeight * 2 + 3) + 10;

  // Subject Breakdown table
  pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUBJECT PERFORMANCE', 20, yPosition);
  
  // Decorative line
  pdf.setDrawColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.setLineWidth(1.5);
  pdf.line(20, yPosition + 2, 80, yPosition + 2);
  
  yPosition += 10;

  // Table header
  const colPositions = [20, 100, 127, 154, 175];
  
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.roundedRect(20, yPosition, pageWidth - 40, 10, 2, 2, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  
  const headers = ['Subject', 'Total', 'Correct', 'Wrong', 'Score'];
  headers.forEach((header, index) => {
    pdf.text(header, colPositions[index] + 3, yPosition + 7);
  });
  
  yPosition += 10;

  // Subject rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  
  Object.entries(result.subjectBreakdown).forEach((entry, index) => {
    const [subject, stats] = entry;
    const rowHeight = 9;
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(20, yPosition, pageWidth - 40, rowHeight, 1, 1, 'F');
    }
    
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    
    // Subject name
    const truncatedSubject = subject.length > 28 ? subject.substring(0, 25) + '...' : subject;
    pdf.setFont('helvetica', 'bold');
    pdf.text(truncatedSubject, colPositions[0] + 3, yPosition + 6);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(stats.total.toString(), colPositions[1] + 3, yPosition + 6);
    pdf.text(stats.correct.toString(), colPositions[2] + 3, yPosition + 6);
    pdf.text((stats.total - stats.correct).toString(), colPositions[3] + 3, yPosition + 6);
    
    // Percentage with color badge
    const percentage = stats.percentage;
    let badgeColor;
    if (percentage >= 70) badgeColor = successColor;
    else if (percentage >= 50) badgeColor = warningColor;
    else badgeColor = dangerColor;
    
    pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    pdf.roundedRect(colPositions[4] + 2, yPosition + 2, 26, 6, 2, 2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${percentage.toFixed(0)}%`, colPositions[4] + 15, yPosition + 6, { align: 'center' });
    
    yPosition += rowHeight;
  });

  // Footer
  const footerY = pageHeight - 12;
  
  // Footer background
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.rect(0, footerY - 4, pageWidth, 16, 'F');
  
  // Accent line
  pdf.setFillColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.rect(0, footerY - 4, pageWidth, 2, 'F');
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);
  pdf.text('© EDURA - Computer Based Testing Platform', 20, footerY + 4);
  
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, footerY + 4, { align: 'right' });

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