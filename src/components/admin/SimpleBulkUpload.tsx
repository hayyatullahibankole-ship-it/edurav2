import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  CheckCircle, 
  Loader2,
  Sparkles,
  Copy
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
  const [questionsText, setQuestionsText] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const parseQuestionsText = (text: string): any[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const questions = [];
    
    let currentQuestion = null;
    
    for (let line of lines) {
      line = line.trim();
      
      // Check if this line starts a new question (contains a question mark or starts with a number)
      if (line.match(/^\d+[.)]\s*/) || line.includes('?') || (!currentQuestion && line.length > 10)) {
        // Save previous question if exists
        if (currentQuestion && currentQuestion.question_text && currentQuestion.options.length >= 4) {
          questions.push(currentQuestion);
        }
        
        // Start new question
        currentQuestion = {
          question_text: line.replace(/^\d+[.)]\s*/, '').trim(),
          options: [],
          correct_answer: null,
          explanation: null
        };
      } else if (line.match(/^[A-E][.)]\s*/)) {
        // This is an option
        if (currentQuestion) {
          const optionText = line.replace(/^[A-E][.)]\s*/, '').trim();
          currentQuestion.options.push(optionText);
        }
      } else if (line.toLowerCase().includes('answer:') || line.toLowerCase().includes('correct:')) {
        // This is the correct answer
        if (currentQuestion) {
          const match = line.match(/[A-E]/i);
          if (match) {
            currentQuestion.correct_answer = match[0].toUpperCase();
          }
        }
      } else if (line.toLowerCase().includes('explanation:')) {
        // This is an explanation
        if (currentQuestion) {
          currentQuestion.explanation = line.replace(/explanation:\s*/i, '').trim();
        }
      } else if (currentQuestion && line.length > 0) {
        // Continuation of question text or explanation
        if (currentQuestion.options.length === 0) {
          currentQuestion.question_text += ' ' + line;
        } else if (!currentQuestion.correct_answer) {
          // Could be part of last option
          if (currentQuestion.options.length > 0) {
            currentQuestion.options[currentQuestion.options.length - 1] += ' ' + line;
          }
        }
      }
    }
    
    // Add the last question
    if (currentQuestion && currentQuestion.question_text && currentQuestion.options.length >= 4) {
      questions.push(currentQuestion);
    }
    
    return questions;
  };

  const handleUpload = async () => {
    if (!questionsText.trim() || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please enter questions text and select a subject",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      const questions = parseQuestionsText(questionsText);
      
      if (questions.length === 0) {
        throw new Error("No valid questions found in the text");
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
            // Validate correct answer
            const correctIndex = ['A', 'B', 'C', 'D', 'E'].indexOf(questionData.correct_answer);
            if (correctIndex === -1 || correctIndex >= questionData.options.length) {
              throw new Error(`Invalid correct answer: ${questionData.correct_answer} for question starting with: ${questionData.question_text.substring(0, 50)}...`);
            }

            const { error } = await supabase
              .from('questions')
              .insert({
                question_text: questionData.question_text,
                type: 'MCQ_SINGLE',
                options: questionData.options,
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
    setQuestionsText('');
    setSelectedSubject('');
    setUploadResults(null);
  };

  const copyTemplate = () => {
    const templateContent = `1. What is the capital of Nigeria?
A) Lagos
B) Abuja
C) Port Harcourt
D) Kano
Answer: B
Explanation: Abuja is the federal capital territory of Nigeria

2. Which planet is closest to the sun?
A) Earth
B) Venus
C) Mercury
D) Mars
Answer: C
Explanation: Mercury is the closest planet to the sun in our solar system

3. What is the chemical symbol for water?
A) H2O
B) CO2
C) NaCl
D) O2
Answer: A
Explanation: Water is composed of two hydrogen atoms and one oxygen atom`;

    navigator.clipboard.writeText(templateContent).then(() => {
      toast({
        title: "Template Copied!",
        description: "Question template has been copied to your clipboard",
      });
    });
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
        {/* Template Example */}
        <Alert className="border-blue-600/20 bg-blue-950/20">
          <Copy className="h-4 w-4" />
          <AlertDescription className="text-slate-300">
            <div className="flex items-center justify-between">
              <span>Copy our question format template to get started</span>
              <Button
                variant="outline"
                size="sm"
                onClick={copyTemplate}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Template
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Questions Text Input */}
        <div className="space-y-4">
          <div>
            <Label className="text-white">Questions Text</Label>
            <div className="mt-2">
              <Textarea
                value={questionsText}
                onChange={(e) => setQuestionsText(e.target.value)}
                placeholder="Paste your questions here in the format shown in the template..."
                className="bg-slate-700 border-slate-600 text-white min-h-[200px]"
                disabled={isUploading}
              />
            </div>
            {questionsText && (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-300">
                  {questionsText.split('\n').filter(line => line.match(/^\d+[.)]\s*/) || line.includes('?')).length} questions detected
                </span>
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
            disabled={!questionsText.trim() || !selectedSubject || isUploading}
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
          <p><strong>Text Format:</strong></p>
          <p>• Start each question with a number: "1. Question text?"</p>
          <p>• List options as: "A) Option text", "B) Option text", etc.</p>
          <p>• Specify answer as: "Answer: A" or "Correct: A"</p>
          <p>• Add explanation as: "Explanation: Your explanation text"</p>
          <p>• Leave blank lines between questions for better parsing</p>
        </div>
      </CardContent>
    </Card>
  );
}