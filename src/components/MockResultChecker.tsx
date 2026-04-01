import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Printer, AlertCircle, GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MockResult {
  subject: string;
  score: number;
  grade: string;
  remark: string;
}

const GRADE_MAP = [
  { min: 75, max: 100, grade: 'A1', remark: 'Excellent' },
  { min: 70, max: 74, grade: 'B2', remark: 'Very Good' },
  { min: 65, max: 69, grade: 'B3', remark: 'Good' },
  { min: 60, max: 64, grade: 'C4', remark: 'Credit' },
  { min: 55, max: 59, grade: 'C5', remark: 'Credit' },
  { min: 50, max: 54, grade: 'C6', remark: 'Credit' },
  { min: 45, max: 49, grade: 'D7', remark: 'Pass' },
  { min: 40, max: 44, grade: 'E8', remark: 'Pass' },
  { min: 0, max: 39, grade: 'F9', remark: 'Fail' },
];

function getOverallGrade(avg: number) {
  return GRADE_MAP.find(g => avg >= g.min && avg <= g.max) || { grade: 'F9', remark: 'Fail' };
}

export default function MockResultChecker() {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [published, setPublished] = useState(false);
  const [results, setResults] = useState<MockResult[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAndLoad();
  }, [userProfile]);

  const checkAndLoad = async () => {
    if (!userProfile?.id) return;
    setLoading(true);
    try {
      // Check publish status
      const { data: settings } = await supabase
        .from('waec_result_settings')
        .select('result_published')
        .limit(1)
        .single();

      const isPublished = (settings as any)?.result_published || false;
      setPublished(isPublished);

      if (!isPublished) {
        setLoading(false);
        return;
      }

      // Fetch results
      const { data, error } = await supabase
        .from('waec_mock_results')
        .select('subject, score, grade, remark')
        .eq('user_id', userProfile.id)
        .eq('exam_year', '2026 MOCK')
        .order('subject');

      if (error) throw error;
      setResults((data as any[]) || []);
      setStudentName(`${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim());
      setStudentEmail(userProfile.email || user?.email || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const avgScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
  const overall = getOverallGrade(avgScore);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>Mock Examination Result</title>
      <style>
        body { font-family: 'Times New Roman', serif; padding: 40px; color: #000; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; margin: 0; text-transform: uppercase; }
        .header h2 { font-size: 18px; margin: 5px 0; color: #333; }
        .info { margin: 20px 0; }
        .info p { margin: 4px 0; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #333; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #1a1a2e; color: white; }
        .summary { margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 15px; }
        .grade-badge { font-weight: bold; }
        @media print { body { padding: 20px; } }
      </style></head><body>
      <div class="header">
        <h1>AL-BARI COLLEGE</h1>
        <h2>2026 MOCK EXAMINATION RESULT</h2>
      </div>
      <div class="info">
        <p><strong>Candidate Name:</strong> ${studentName}</p>
        <p><strong>Candidate Email:</strong> ${studentEmail}</p>
        <p><strong>School:</strong> AL-BARI COLLEGE</p>
      </div>
      <table>
        <thead><tr><th>S/N</th><th>Subject</th><th>Score</th><th>Grade</th><th>Remark</th></tr></thead>
        <tbody>
          ${results.map((r, i) => `<tr><td>${i + 1}</td><td>${r.subject}</td><td>${r.score}</td><td class="grade-badge">${r.grade}</td><td>${r.remark}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="summary">
        <p><strong>Total Score:</strong> ${totalScore}</p>
        <p><strong>Average Score:</strong> ${avgScore}%</p>
        <p><strong>Overall Grade:</strong> ${overall.grade} (${overall.remark})</p>
      </div>
      <div class="footer">
        <p>Powered by EDURA CBT — "Excellence Through Digital Assessment"</p>
      </div>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('AL-BARI COLLEGE', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text('2026 MOCK EXAMINATION RESULT', 105, 30, { align: 'center' });
      
      // Line
      doc.setDrawColor(26, 26, 46);
      doc.setLineWidth(0.5);
      doc.line(20, 35, 190, 35);
      
      // Student info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Candidate Name: ${studentName}`, 20, 45);
      doc.text(`Candidate Email: ${studentEmail}`, 20, 52);
      doc.text(`School: AL-BARI COLLEGE`, 20, 59);
      
      // Table
      autoTable(doc, {
        startY: 68,
        head: [['S/N', 'Subject', 'Score', 'Grade', 'Remark']],
        body: results.map((r, i) => [i + 1, r.subject, r.score, r.grade, r.remark]),
        theme: 'grid',
        headStyles: { fillColor: [26, 26, 46], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
      });
      
      const finalY = (doc as any).lastAutoTable?.finalY || 120;
      doc.setFontSize(11);
      doc.text(`Total Score: ${totalScore}`, 20, finalY + 12);
      doc.text(`Average Score: ${avgScore}%`, 20, finalY + 20);
      doc.text(`Overall Grade: ${overall.grade} (${overall.remark})`, 20, finalY + 28);
      
      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('Powered by EDURA CBT — "Excellence Through Digital Assessment"', 105, 285, { align: 'center' });
      
      doc.save(`Mock_Result_${studentName.replace(/\s+/g, '_')}.pdf`);
      toast({ title: 'Downloaded', description: 'Result PDF downloaded successfully' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!published) {
    return (
      <Card className="border-amber-200/50 bg-amber-50/50">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-bold mb-2">Results Not Yet Released</h3>
          <p className="text-muted-foreground max-w-md">
            Mock examination results have not yet been released. Please check back later or contact your school administration.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-12 text-center">
          <GraduationCap className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-bold mb-2">No Results Found</h3>
          <p className="text-muted-foreground">No mock examination results found for your account.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" ref={printRef}>
      {/* WAEC-Style Header */}
      <Card className="border-2 border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] p-6 text-center text-white">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide uppercase">AL-BARI COLLEGE</h1>
          <h2 className="text-lg md:text-xl mt-1 opacity-90">2026 MOCK EXAMINATION RESULT</h2>
        </div>
        <CardContent className="p-6 space-y-1 bg-muted/30">
          <p className="text-sm"><span className="font-semibold">Candidate Name:</span> {studentName}</p>
          <p className="text-sm"><span className="font-semibold">Candidate Email:</span> {studentEmail}</p>
          <p className="text-sm"><span className="font-semibold">School:</span> AL-BARI COLLEGE</p>
        </CardContent>
      </Card>

      {/* Grade Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Result Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map(r => (
                <TableRow key={r.subject}>
                  <TableCell className="font-medium">{r.subject}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={r.grade === 'F9' ? 'destructive' : 'default'} className="font-bold">
                      {r.grade}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detailed Report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detailed Report</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S/N</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead>Remark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r, i) => (
                <TableRow key={r.subject}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.subject}</TableCell>
                  <TableCell className="text-center font-bold">{r.score}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={r.grade === 'F9' ? 'destructive' : 'default'}>{r.grade}</Badge>
                  </TableCell>
                  <TableCell>{r.remark}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="font-semibold">Total Score: <span className="text-primary">{totalScore}</span></p>
            <p className="font-semibold">Average Score: <span className="text-primary">{avgScore}%</span></p>
            <p className="font-semibold">Overall Grade: 
              <Badge className="ml-2" variant={overall.grade === 'F9' ? 'destructive' : 'default'}>
                {overall.grade} ({overall.remark})
              </Badge>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="w-4 h-4" /> Download Result (PDF)
        </Button>
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="w-4 h-4" /> Print Result
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground border-t pt-4">
        <p>Powered by <span className="font-semibold">EDURA CBT</span></p>
        <p className="italic">"Excellence Through Digital Assessment"</p>
      </div>
    </div>
  );
}
