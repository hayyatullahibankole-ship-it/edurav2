import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  CheckCircle, 
  Loader2,
  Sparkles,
  Copy,
  FileText,
  Download,
  ExternalLink
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
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Debug logging
  console.log('SimpleBulkUpload component loaded');
  console.log('Subjects prop:', subjects);

  if (!subjects) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-400">Loading subjects...</p>
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-400">No subjects available. Please create subjects first.</p>
      </div>
    );
  }

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

  const parseCSVFile = (csvContent: string): any[] => {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    const questions = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      if (values.length < 6) continue; // Skip invalid rows
      
      const questionObj: any = {
        question_text: '',
        options: [],
        correct_answer: null,
        explanation: ''
      };
      
      // Map CSV columns to question properties
      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        if (header.includes('question')) {
          questionObj.question_text = value;
        } else if (header.includes('option') || header.includes('choice')) {
          if (header.includes('a') || header.includes('1')) questionObj.options[0] = value;
          else if (header.includes('b') || header.includes('2')) questionObj.options[1] = value;
          else if (header.includes('c') || header.includes('3')) questionObj.options[2] = value;
          else if (header.includes('d') || header.includes('4')) questionObj.options[3] = value;
        } else if (header.includes('answer') || header.includes('correct')) {
          // Handle both letter (A,B,C,D) and number (0,1,2,3) formats
          const answerValue = value.toUpperCase();
          if (['A', 'B', 'C', 'D'].includes(answerValue)) {
            questionObj.correct_answer = answerValue;
          } else if (['0', '1', '2', '3'].includes(answerValue)) {
            questionObj.correct_answer = ['A', 'B', 'C', 'D'][parseInt(answerValue)];
          }
        } else if (header.includes('explanation') || header.includes('solution')) {
          questionObj.explanation = value;
        }
      });
      
      // Validate question has minimum required fields
      if (questionObj.question_text && questionObj.options.filter(o => o).length >= 4 && questionObj.correct_answer) {
        questions.push(questionObj);
      }
    }
    
    return questions;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
      return;
    }
    
    setUploadFile(file);
  };

  const handleUpload = async () => {
    if ((!questionsText.trim() && !uploadFile) || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please provide questions (text or file) and select a subject",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResults(null);

    try {
      let questions: any[] = [];
      
      if (uploadFile) {
        // Handle CSV file upload
        const fileContent = await uploadFile.text();
        questions = parseCSVFile(fileContent);
      } else {
        // Handle text upload
        questions = parseQuestionsText(questionsText);
      }
      
      if (questions.length === 0) {
        throw new Error("No valid questions found in the input");
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
    setUploadFile(null);
    setUploadResults(null);
    // Reset file input
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const copyWAECTemplate = () => {
    const waecTemplate = `1. Find the value of x in the equation 3x + 7 = 22
A) 5
B) 4
C) 6
D) 3
Answer: A
Explanation: 3x = 22 - 7 = 15, therefore x = 15/3 = 5

2. Which of the following gases turns moist red litmus paper blue?
A) Sulphur dioxide
B) Ammonia
C) Hydrogen chloride
D) Carbon dioxide
Answer: B
Explanation: Ammonia (NH₃) is basic and turns red litmus paper blue. It dissolves in water to form ammonium hydroxide.

3. The system of government practiced in Nigeria is
A) Unitary
B) Federal
C) Confederate
D) Parliamentary
Answer: B
Explanation: Nigeria operates a federal system of government where power is shared between the federal government and the 36 states.

4. In photosynthesis, the raw materials required are
A) Water and carbon dioxide
B) Water and oxygen
C) Oxygen and carbon dioxide
D) Glucose and water
Answer: A
Explanation: Plants use water (H₂O) and carbon dioxide (CO₂) as raw materials in the presence of chlorophyll and sunlight to produce glucose.`;

    navigator.clipboard.writeText(waecTemplate).then(() => {
      toast({
        title: "WAEC Template Copied!",
        description: "Authentic WAEC-style question template copied to clipboard",
      });
    });
  };

  const copyJAMBTemplate = () => {
    const jambTemplate = `1. If log₁₀ 2 = 0.3010, find the value of log₁₀ 20
A) 0.6020
B) 1.3010
C) 0.9030
D) 2.3010
Answer: B
Explanation: log₁₀ 20 = log₁₀(2 × 10) = log₁₀ 2 + log₁₀ 10 = 0.3010 + 1 = 1.3010

2. A projectile is fired at an angle of 30° to the horizontal with an initial velocity of 40 m/s. Calculate the maximum height reached. [g = 10 m/s²]
A) 20 m
B) 40 m
C) 60 m
D) 80 m
Answer: A
Explanation: Maximum height = (u²sin²θ)/(2g) = (40² × sin²30°)/(2 × 10) = (1600 × 0.25)/20 = 20 m

3. Which of the following compounds exhibits both ionic and covalent bonding?
A) NaCl
B) NH₄Cl
C) MgO
D) CO₂
Answer: B
Explanation: NH₄Cl contains ionic bonding between NH₄⁺ and Cl⁻ ions, and covalent bonding within the NH₄⁺ ion.

4. The economic system where the means of production are privately owned is called
A) Socialism
B) Capitalism
C) Mixed economy
D) Command economy
Answer: B
Explanation: Capitalism is an economic system characterized by private ownership of the means of production and operation for profit.`;

    navigator.clipboard.writeText(jambTemplate).then(() => {
      toast({
        title: "JAMB Template Copied!",
        description: "Authentic JAMB-style question template copied to clipboard",
      });
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-accent" />
          WAEC/JAMB Question Import
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Templates and Sources */}
        <div className="space-y-4">
          <Alert className="border-blue-600/20 bg-blue-950/20">
            <FileText className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              <div className="space-y-3">
                <p className="font-medium">Authentic WAEC/JAMB Question Templates</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyWAECTemplate}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    WAEC Format
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyJAMBTemplate}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    JAMB Format
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          <Alert className="border-yellow-600/20 bg-yellow-950/20">
            <ExternalLink className="h-4 w-4" />
            <AlertDescription className="text-slate-300">
              <div className="space-y-2">
                <p className="font-medium">Sources for Authentic Past Questions:</p>
                <ul className="text-sm space-y-1">
                  <li>• <strong>WAEC:</strong> Official WAEC website (waec.org.ng) - Past Question Papers</li>
                  <li>• <strong>JAMB:</strong> Official JAMB website (jamb.gov.ng) - Past Questions & Answers</li>
                  <li>• <strong>Libraries:</strong> University/School libraries with archived question papers</li>
                  <li>• <strong>Educational Publishers:</strong> Macmillan, Longman, Evans past question books</li>
                  <li>• <strong>Online Platforms:</strong> MySchool, Prepclass, Edudelight past questions</li>
                </ul>
                <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs">
                  <strong>⚠️ Important:</strong> Always verify questions are from official sources. 
                  Ensure you have proper licensing for commercial use of past questions.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* Upload Method Tabs */}
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="text" className="text-white">Text Format</TabsTrigger>
            <TabsTrigger value="csv" className="text-white">CSV File</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4">
            <div>
              <Label className="text-white">CSV File Upload</Label>
              <div className="mt-2">
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isUploading}
                />
              </div>
              {uploadFile && (
                <div className="mt-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-slate-300">
                    File selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
              <div className="text-xs text-slate-400 mt-2">
                <p><strong>CSV Format:</strong> Question,OptionA,OptionB,OptionC,OptionD,CorrectAnswer,Explanation</p>
                <p>Correct answer can be A/B/C/D or 0/1/2/3</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
            disabled={(!questionsText.trim() && !uploadFile) || !selectedSubject || isUploading}
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
        <div className="text-xs text-slate-400 space-y-2">
          <div>
            <p><strong>Supported Text Formats:</strong></p>
            <p>• Standard WAEC/JAMB format with numbered questions</p>
            <p>• Options labeled as A), B), C), D) or A., B., C., D.</p>
            <p>• Answer specified as "Answer: A" or "Correct: A"</p>
            <p>• Optional explanations as "Explanation: [detailed solution]"</p>
            <p>• Leave blank lines between questions for better parsing</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}