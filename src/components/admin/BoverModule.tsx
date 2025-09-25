import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Loader2,
  Zap,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
}

interface BoverUpload {
  file: File | null;
  preview: any[];
  errors: string[];
  mapping: {
    question: number;
    optionA: number;
    optionB: number;
    optionC: number;
    optionD: number;
    optionE: number;
    correct: number;
    explanation: number;
    subject: number;
    difficulty: number;
    tags: number;
  };
  processing: boolean;
  processed: number;
  total: number;
}

interface BoverModuleProps {
  subjects: Subject[];
  onUploadComplete: () => void;
}

export default function BoverModule({ subjects, onUploadComplete }: BoverModuleProps) {
  const { toast } = useToast();
  const [boverUpload, setBoverUpload] = useState<BoverUpload>({
    file: null,
    preview: [],
    errors: [],
    mapping: {
      question: 0,
      optionA: 1,
      optionB: 2,
      optionC: 3,
      optionD: 4,
      optionE: 5,
      correct: 6,
      explanation: 7,
      subject: 8,
      difficulty: 9,
      tags: 10
    },
    processing: false,
    processed: 0,
    total: 0
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }

    setBoverUpload(prev => ({ ...prev, file, preview: [], errors: [] }));

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      const preview = rows.slice(0, 15); // Show first 15 rows for better preview
      
      setBoverUpload(prev => ({ ...prev, preview, total: rows.length - 1 }));
    };
    reader.readAsText(file);
  }, [toast]);

  const processBoverUpload = async () => {
    if (!boverUpload.file || !boverUpload.preview.length) return;

    try {
      setBoverUpload(prev => ({ ...prev, processing: true, processed: 0 }));
      const errors: string[] = [];
      const questionsToInsert: any[] = [];

      // Process in batches for better performance
      const batchSize = 50;
      const rows = boverUpload.preview.slice(1); // Skip header

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        batch.forEach((row, batchIndex) => {
          const rowIndex = i + batchIndex;
          if (row.length < 7) {
            errors.push(`Row ${rowIndex + 2}: Insufficient columns`);
            return;
          }

          // Enhanced validation and processing
          const question = {
            question_text: row[boverUpload.mapping.question]?.trim(),
            type: 'MCQ_SINGLE',
            options: [
              row[boverUpload.mapping.optionA]?.trim(),
              row[boverUpload.mapping.optionB]?.trim(),
              row[boverUpload.mapping.optionC]?.trim(),
              row[boverUpload.mapping.optionD]?.trim(),
              row[boverUpload.mapping.optionE]?.trim()
            ].filter(opt => opt && opt.length > 0),
            correct_answer: parseInt(row[boverUpload.mapping.correct]) || 0,
            explanation: row[boverUpload.mapping.explanation]?.trim() || '',
            difficulty_level: Math.max(1, Math.min(3, parseInt(row[boverUpload.mapping.difficulty]) || 1)),
            tags: row[boverUpload.mapping.tags]?.split(';').map(t => t.trim()).filter(t => t.length > 0) || [],
            subject_id: subjects.find(s => 
              s.name.toLowerCase() === row[boverUpload.mapping.subject]?.toLowerCase()
            )?.id,
            points: 1,
            is_active: true,
            created_by: null // Will be set by the system
          };

          // Enhanced validation
          if (!question.question_text || question.question_text.length < 10) {
            errors.push(`Row ${rowIndex + 2}: Question text too short or missing`);
            return;
          }

          if (question.options.length < 2) {
            errors.push(`Row ${rowIndex + 2}: At least 2 options required`);
            return;
          }

          if (question.correct_answer >= question.options.length) {
            errors.push(`Row ${rowIndex + 2}: Invalid correct answer index`);
            return;
          }

          if (!question.subject_id) {
            errors.push(`Row ${rowIndex + 2}: Invalid subject "${row[boverUpload.mapping.subject]}"`);
            return;
          }

          questionsToInsert.push(question);
        });

        // Update progress
        setBoverUpload(prev => ({ 
          ...prev, 
          processed: Math.min(i + batchSize, rows.length),
          errors 
        }));

        // Small delay to prevent overwhelming the UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (errors.length > 0) {
        toast({
          title: "Validation Errors Found",
          description: `${errors.length} errors found. Please fix them before uploading.`,
          variant: "destructive"
        });
        return;
      }

      if (questionsToInsert.length === 0) {
        toast({
          title: "No Valid Questions",
          description: "No valid questions found to upload",
          variant: "destructive"
        });
        return;
      }

      // Batch insert questions
      for (let i = 0; i < questionsToInsert.length; i += batchSize) {
        const batch = questionsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from('questions').insert(batch);

        if (error) {
          console.error('Batch insert error:', error);
          toast({
            title: "Upload Error",
            description: `Error uploading batch ${Math.floor(i / batchSize) + 1}: ${error.message}`,
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "🎉 Bover Upload Complete!",
        description: `Successfully uploaded ${questionsToInsert.length} questions with advanced processing`,
      });

      // Reset form
      setBoverUpload({
        file: null,
        preview: [],
        errors: [],
        mapping: {
          question: 0,
          optionA: 1,
          optionB: 2,
          optionC: 3,
          optionD: 4,
          optionE: 5,
          correct: 6,
          explanation: 7,
          subject: 8,
          difficulty: 9,
          tags: 10
        },
        processing: false,
        processed: 0,
        total: 0
      });

      onUploadComplete();
    } catch (error) {
      console.error('Bover upload error:', error);
      toast({
        title: "Upload Failed",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
    } finally {
      setBoverUpload(prev => ({ ...prev, processing: false }));
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Question,Option A,Option B,Option C,Option D,Option E,Correct Answer (0-4),Explanation,Subject,Difficulty (1-3),Tags (semicolon-separated)
"What is the capital of Nigeria?","Lagos","Abuja","Kano","Port Harcourt","Ibadan",1,"Abuja is the federal capital territory of Nigeria","Geography",1,"geography;nigeria;capital"
"Which of the following is a prime number?","4","6","7","8","9",2,"7 is only divisible by 1 and itself","Mathematics",2,"mathematics;prime;numbers"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bover_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Bover Advanced Import Module
          <Badge variant="outline" className="ml-2">Enhanced</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Advanced bulk question import with intelligent processing and validation
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bover-file" className="text-base font-medium">
              Select CSV File
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>
          
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Input
              id="bover-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Label htmlFor="bover-file" className="cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                {boverUpload.file ? boverUpload.file.name : 'Click to upload CSV file'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports advanced validation and batch processing
              </p>
            </Label>
          </div>
        </div>

        {/* Preview Section */}
        {boverUpload.preview.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Preview & Validation</h4>
              <Badge variant={boverUpload.errors.length > 0 ? "destructive" : "secondary"}>
                {boverUpload.preview.length - 1} questions detected
              </Badge>
            </div>
            
            <div className="bg-muted rounded-lg p-4 max-h-64 overflow-auto">
              <div className="text-xs font-mono space-y-1">
                {boverUpload.preview.slice(0, 10).map((row, index) => (
                  <div key={index} className={index === 0 ? "font-bold border-b pb-1 mb-1" : ""}>
                    {row.slice(0, 4).join(' | ')}...
                  </div>
                ))}
                {boverUpload.preview.length > 10 && (
                  <div className="text-muted-foreground">
                    ... and {boverUpload.preview.length - 10} more rows
                  </div>
                )}
              </div>
            </div>

            {/* Processing Progress */}
            {boverUpload.processing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing questions...</span>
                  <span>{boverUpload.processed} / {boverUpload.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(boverUpload.processed / boverUpload.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Errors Display */}
            {boverUpload.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">{boverUpload.errors.length} validation errors found:</p>
                    <ul className="text-xs space-y-0.5 max-h-32 overflow-auto">
                      {boverUpload.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {boverUpload.errors.length > 10 && (
                        <li>• ... and {boverUpload.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            <Button
              onClick={processBoverUpload}
              disabled={boverUpload.processing || boverUpload.errors.length > 0 || !boverUpload.file}
              className="w-full"
              size="lg"
            >
              {boverUpload.processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing with Bover...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Import with Bover Enhancement
                </>
              )}
            </Button>
          </div>
        )}

        {/* Sample Format */}
        {!boverUpload.file && (
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Bover Expected CSV Format:</p>
                <div className="text-xs font-mono bg-muted p-2 rounded">
                  Question, Option A, Option B, Option C, Option D, Option E, Correct Answer (0-4), Explanation, Subject, Difficulty (1-3), Tags
                </div>
                <p className="text-xs text-muted-foreground">
                  Enhanced with intelligent validation, batch processing, and advanced error handling
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}