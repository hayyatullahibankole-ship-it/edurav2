import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Download,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
}

interface SimpleBulkUploadProps {
  subjects: Subject[];
  onUploadComplete: () => void;
}

export default function SimpleBulkUpload({ subjects, onUploadComplete }: SimpleBulkUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    setUploadResults(null);
  };

  const processCSVFile = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const data = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map(cell => cell.trim().replace(/"/g, ''));
      
      if (row.length >= 7) { // Minimum required columns
        data.push({
          question_text: row[0],
          option_a: row[1],
          option_b: row[2],
          option_c: row[3],
          option_d: row[4],
          option_e: row[5] || null,
          correct_answer: row[6]?.toUpperCase(),
          explanation: row[7] || null
        });
      }
    }
    
    return data;
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select both a file and a subject",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      const fileText = await selectedFile.text();
      const questions = processCSVFile(fileText);
      
      if (questions.length === 0) {
        throw new Error("No valid questions found in the CSV file");
      }

      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Process questions in batches
      const batchSize = 10;
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);
        
        for (const questionData of batch) {
          try {
            // Create options array
            const options = [
              questionData.option_a,
              questionData.option_b,
              questionData.option_c,
              questionData.option_d
            ];
            
            if (questionData.option_e) {
              options.push(questionData.option_e);
            }

            // Validate correct answer
            const correctIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(questionData.correct_answer);
            if (correctIndex === -1 || correctIndex >= options.length) {
              throw new Error(`Invalid correct answer: ${questionData.correct_answer}`);
            }

            const { error } = await supabase
              .from('questions')
              .insert({
                question_text: questionData.question_text,
                type: 'MCQ_SINGLE',
                options: options,
                correct_answer: correctIndex,
                explanation: questionData.explanation,
                subject_id: selectedSubject,
                difficulty_level: 1,
                points: 1,
                is_active: true
              });

            if (error) throw error;
            successCount++;
          } catch (error: any) {
            failedCount++;
            errors.push(`Row ${i + failedCount + successCount}: ${error.message}`);
          }
        }
        
        // Update progress
        setUploadProgress((i + batchSize) / questions.length * 100);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      }

      setUploadResults({
        success: successCount,
        failed: failedCount,
        errors: errors.slice(0, 10) // Show first 10 errors only
      });

      if (successCount > 0) {
        toast({
          title: "Upload Complete!",
          description: `Successfully imported ${successCount} questions`,
        });
        onUploadComplete();
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setSelectedSubject('');
    setUploadResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const templateContent = `Question,Option A,Option B,Option C,Option D,Option E,Correct Answer,Explanation
"What is the capital of Nigeria?","Lagos","Abuja","Port Harcourt","Kano","","B","Abuja is the federal capital territory of Nigeria"
"Which planet is closest to the sun?","Earth","Venus","Mercury","Mars","","C","Mercury is the closest planet to the sun"`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-accent" />
          Simple Bulk Question Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download */}
        <Alert className="border-blue-600/20 bg-blue-950/20">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            <div className="flex items-center justify-between">
              <span>Download our CSV template to get started</span>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* File Upload */}
        <div className="space-y-4">
          <div>
            <Label className="text-white">CSV File</Label>
            <div className="mt-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="bg-slate-700 border-slate-600 text-white file:bg-slate-600 file:text-white file:border-0"
                disabled={isUploading}
              />
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-300">{selectedFile.name}</span>
                <Badge variant="secondary">{selectedFile.size} bytes</Badge>
              </div>
            )}
          </div>

          {/* Subject Selection */}
          <div>
            <Label className="text-white">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isUploading}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              <span className="text-sm text-slate-300">Uploading questions...</span>
            </div>
            <Progress value={uploadProgress} className="bg-slate-700" />
          </div>
        )}

        {/* Upload Results */}
        {uploadResults && (
          <Alert className={uploadResults.success > 0 ? "border-green-600/20 bg-green-950/20" : "border-red-600/20 bg-red-950/20"}>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Badge variant="default" className="bg-green-600">
                    {uploadResults.success} Successful
                  </Badge>
                  {uploadResults.failed > 0 && (
                    <Badge variant="destructive">
                      {uploadResults.failed} Failed
                    </Badge>
                  )}
                </div>
                {uploadResults.errors.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm">View Errors</summary>
                    <div className="mt-1 text-xs space-y-1">
                      {uploadResults.errors.map((error, index) => (
                        <div key={index} className="text-red-300">{error}</div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedSubject || isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Questions
              </>
            )}
          </Button>
          <Button variant="outline" onClick={resetUpload} disabled={isUploading}>
            Reset
          </Button>
        </div>

        {/* Format Instructions */}
        <div className="text-xs text-slate-400 space-y-1">
          <p><strong>CSV Format:</strong></p>
          <p>• Columns: Question, Option A, Option B, Option C, Option D, Option E (optional), Correct Answer, Explanation (optional)</p>
          <p>• Correct Answer should be A, B, C, D, or E</p>
          <p>• Use quotes for text containing commas</p>
        </div>
      </CardContent>
    </Card>
  );
}