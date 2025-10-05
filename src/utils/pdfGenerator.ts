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

  // Compact header background
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.rect(0, 0, pageWidth, 35, 'F');
  
  // Accent bar at top
  pdf.setFillColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.rect(0, 0, pageWidth, 3, 'F');
  
  // Add Edura Logo
  pdf.addImage(eduraLogo, 'PNG', 15, 8, 20, 20);
  
  // EDURA Brand Text
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EDURA', 38, 17);
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Computer Based Testing', 38, 22);
  
  // Report title on right
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('EXAM REPORT', pageWidth - 15, 17, { align: 'right' });
  
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.text(`ID: ${result.attemptId.substring(0, 8).toUpperCase()}`, pageWidth - 15, 22, { align: 'right' });

  yPosition = 40;

  // Compact Info Section - Two columns
  const leftCol = 15;
  const rightCol = 110;
  
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STUDENT INFORMATION', leftCol, yPosition);
  
  yPosition += 5;
  pdf.setFontSize(8);
  
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
    yPosition += 5;
  });
  
  let yPosRight = yPosition - 10;
  studentInfoRight.forEach(([label, value]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(label, rightCol, yPosRight);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    const truncatedValue = value.length > 30 ? value.substring(0, 27) + '...' : value;
    pdf.text(truncatedValue, rightCol + 15, yPosRight);
    yPosRight += 5;
  });

  yPosition += 3;

  // Compact Performance Section - Side by side layout
  const centerX = pageWidth / 2;
  const scoreBoxWidth = 50;
  const scoreBoxHeight = 40;
  const scoreBoxX = 15;
  
  // Score card
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 3, 3, 'F');
  
  // Border with grade color
  pdf.setDrawColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.setLineWidth(2);
  pdf.roundedRect(scoreBoxX, yPosition, scoreBoxWidth, scoreBoxHeight, 3, 3, 'S');
  
  // Large percentage score
  pdf.setTextColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${result.percentage.toFixed(0)}%`, scoreBoxX + scoreBoxWidth / 2, yPosition + 18, { align: 'center' });
  
  // Grade badge
  pdf.setFontSize(12);
  pdf.text(`Grade ${gradeInfo.grade}`, scoreBoxX + scoreBoxWidth / 2, yPosition + 28, { align: 'center' });
  
  // Description
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text(gradeInfo.description, scoreBoxX + scoreBoxWidth / 2, yPosition + 35, { align: 'center' });

  // Compact Statistics Grid - Next to score
  const stats = [
    { label: 'Total', value: result.totalQuestions, color: textGray },
    { label: 'Correct', value: result.correctAnswers, color: successColor },
    { label: 'Wrong', value: result.wrongAnswers, color: dangerColor },
    { label: 'Skipped', value: result.unanswered, color: warningColor }
  ];

  const boxWidth = 30;
  const boxHeight = 20;
  const startX = scoreBoxX + scoreBoxWidth + 5;

  stats.forEach((stat, index) => {
    const xPos = startX + (index % 2) * (boxWidth + 2);
    const yPos = yPosition + Math.floor(index / 2) * (boxHeight + 2);
    
    // Card background
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(xPos, yPos, boxWidth, boxHeight, 2, 2, 'F');
    
    // Colored top border
    pdf.setFillColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.roundedRect(xPos, yPos, boxWidth, 2, 1, 1, 'F');
    
    // Value
    pdf.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(stat.value.toString(), xPos + boxWidth / 2, yPos + 11, { align: 'center' });
    
    // Label
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
    pdf.text(stat.label, xPos + boxWidth / 2, yPos + 17, { align: 'center' });
  });

  // Time info next to stats
  const timeX = startX + 2 * (boxWidth + 2) + 5;
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
  pdf.text('TIME ANALYSIS', timeX, yPosition + 3);
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Duration: ${result.timeAllotted}min`, timeX, yPosition + 8);
  pdf.text(`Used: ${result.timeTaken}min`, timeX, yPosition + 13);
  pdf.text(`Avg: ${(result.timeTaken / result.totalQuestions).toFixed(1)}min/q`, timeX, yPosition + 18);

  yPosition += Math.max(scoreBoxHeight, boxHeight * 2 + 2) + 8;

  // Subject Breakdown - Compact table
  pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SUBJECT PERFORMANCE', 15, yPosition);
  
  // Decorative line
  pdf.setDrawColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.setLineWidth(1);
  pdf.line(15, yPosition + 2, 70, yPosition + 2);
  
  yPosition += 8;

  // Compact table header
  const colPositions = [15, 95, 120, 145, 170];
  
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.roundedRect(15, yPosition, pageWidth - 30, 7, 1, 1, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  
  const headers = ['Subject', 'Total', 'Correct', 'Wrong', 'Score'];
  headers.forEach((header, index) => {
    pdf.text(header, colPositions[index] + 2, yPosition + 5);
  });
  
  yPosition += 7;

  // Compact subject rows
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  
  Object.entries(result.subjectBreakdown).forEach((entry, index) => {
    const [subject, stats] = entry;
    const rowHeight = 6;
    
    // Alternating row colors
    if (index % 2 === 0) {
      pdf.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
      pdf.roundedRect(15, yPosition, pageWidth - 30, rowHeight, 0.5, 0.5, 'F');
    }
    
    pdf.setTextColor(eduraDark[0], eduraDark[1], eduraDark[2]);
    
    // Subject name
    const truncatedSubject = subject.length > 30 ? subject.substring(0, 27) + '...' : subject;
    pdf.setFont('helvetica', 'bold');
    pdf.text(truncatedSubject, colPositions[0] + 2, yPosition + 4);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(stats.total.toString(), colPositions[1] + 2, yPosition + 4);
    pdf.text(stats.correct.toString(), colPositions[2] + 2, yPosition + 4);
    pdf.text((stats.total - stats.correct).toString(), colPositions[3] + 2, yPosition + 4);
    
    // Percentage with color badge
    const percentage = stats.percentage;
    let badgeColor;
    if (percentage >= 70) badgeColor = successColor;
    else if (percentage >= 50) badgeColor = warningColor;
    else badgeColor = dangerColor;
    
    pdf.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
    pdf.roundedRect(colPositions[4] + 2, yPosition + 1, 22, 4.5, 1, 1, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${percentage.toFixed(0)}%`, colPositions[4] + 13, yPosition + 4, { align: 'center' });
    
    yPosition += rowHeight;
  });

  // Compact Footer
  const footerY = pageHeight - 10;
  
  // Footer background
  pdf.setFillColor(eduraDark[0], eduraDark[1], eduraDark[2]);
  pdf.rect(0, footerY - 3, pageWidth, 13, 'F');
  
  // Accent line
  pdf.setFillColor(eduraAccent[0], eduraAccent[1], eduraAccent[2]);
  pdf.rect(0, footerY - 3, pageWidth, 1.5, 'F');
  
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(255, 255, 255);
  pdf.text('© EDURA - Computer Based Testing Platform', 15, footerY + 3);
  
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(200, 200, 200);
  pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 15, footerY + 3, { align: 'right' });

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