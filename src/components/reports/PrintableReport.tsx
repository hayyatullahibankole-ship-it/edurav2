import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  userName: string;
  totalTests: number;
  averageScore: number;
  totalHours: number;
  rank: number;
  totalStudents: number;
  subjectBreakdown: { subject: string; score: number }[];
  recentTests: any[];
  generatedAt: string;
}

export const PrintableReport = ({ data }: { data: ReportData }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      toast({
        title: 'Generating PDF...',
        description: 'Please wait while we create your report.',
      });

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Edura-Performance-Report-${Date.now()}.pdf`);

      toast({
        title: 'PDF Downloaded!',
        description: 'Your performance report has been downloaded.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex gap-2 mb-4 print:hidden">
        <Button onClick={handleDownloadPDF}>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      <div 
        ref={reportRef}
        className="bg-white p-8 rounded-lg shadow-lg print:shadow-none"
        style={{ minHeight: '297mm' }}
      >
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-primary pb-6">
          <h1 className="text-4xl font-bold text-primary mb-2">Edura CBT</h1>
          <h2 className="text-2xl font-semibold mb-1">Performance Report</h2>
          <p className="text-muted-foreground">Generated on {new Date(data.generatedAt).toLocaleDateString()}</p>
        </div>

        {/* Student Info */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-primary">Student Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{data.userName}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded">
              <p className="text-sm text-muted-foreground">Report Date</p>
              <p className="text-lg font-semibold">{new Date(data.generatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Overall Performance */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-primary">Overall Performance</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-primary/10 rounded text-center">
              <p className="text-3xl font-bold text-primary">{data.totalTests}</p>
              <p className="text-sm text-muted-foreground">Tests Taken</p>
            </div>
            <div className="p-4 bg-success/10 rounded text-center">
              <p className="text-3xl font-bold text-success">{data.averageScore}%</p>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>
            <div className="p-4 bg-info/10 rounded text-center">
              <p className="text-3xl font-bold text-info">{data.totalHours}h</p>
              <p className="text-sm text-muted-foreground">Study Hours</p>
            </div>
            <div className="p-4 bg-warning/10 rounded text-center">
              <p className="text-3xl font-bold text-warning">#{data.rank}</p>
              <p className="text-sm text-muted-foreground">Your Rank</p>
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-primary">Subject Performance</h3>
          <div className="space-y-3">
            {data.subjectBreakdown.map((subject, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium">{subject.subject}</div>
                <div className="flex-1">
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary flex items-center justify-end pr-2"
                      style={{ width: `${subject.score}%` }}
                    >
                      <span className="text-white text-xs font-bold">{subject.score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tests */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-3 text-primary">Recent Test Results</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left py-2">Test</th>
                <th className="text-center py-2">Score</th>
                <th className="text-center py-2">Date</th>
                <th className="text-center py-2">Duration</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTests.map((test, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{test.subject}</td>
                  <td className="text-center font-semibold">{test.score}%</td>
                  <td className="text-center text-sm text-muted-foreground">{test.date}</td>
                  <td className="text-center text-sm text-muted-foreground">{test.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>This report is generated by Edura CBT Platform</p>
          <p>For more information, visit www.edura.app</p>
        </div>
      </div>
    </div>
  );
};
