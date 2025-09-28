import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, Shield, Zap, Users } from 'lucide-react';

interface CBTOptimizerProps {
  examData: any;
  questions: any[];
  onOptimize?: () => void;
}

export default function CBTOptimizer({ examData, questions, onOptimize }: CBTOptimizerProps) {
  
  // Analyze current exam state
  const analysisResults = {
    questionCount: questions.length,
    hasQuestions: questions.length > 0,
    hasSubjects: examData?.selected_subjects?.length > 0,
    isConfigured: examData?.proctoring_data && 
                 examData.proctoring_data.title && 
                 examData.proctoring_data.duration_minutes,
    estimatedDuration: examData?.proctoring_data?.duration_minutes || 90,
    antiCheatEnabled: true, // Always enabled for security
    recommendations: []
  };

  // Generate recommendations
  const recommendations = [];

  if (!analysisResults.hasQuestions) {
    recommendations.push({
      type: 'error',
      title: 'No Questions Available',
      description: 'This exam has no questions. Please add questions before starting.',
      priority: 'high'
    });
  } else if (analysisResults.questionCount < 10) {
    recommendations.push({
      type: 'warning',
      title: 'Insufficient Questions',
      description: `Only ${analysisResults.questionCount} questions available. Consider adding more for a comprehensive test.`,
      priority: 'medium'
    });
  }

  if (!analysisResults.hasSubjects) {
    recommendations.push({
      type: 'error',
      title: 'No Subjects Selected',
      description: 'Please select at least one subject for this exam.',
      priority: 'high'
    });
  }

  if (analysisResults.estimatedDuration > 120) {
    recommendations.push({
      type: 'info',
      title: 'Long Exam Duration',
      description: 'This is a long exam. Consider adding breaks or splitting into sections.',
      priority: 'low'
    });
  }

  if (analysisResults.questionCount > 0 && analysisResults.hasSubjects) {
    recommendations.push({
      type: 'success',
      title: 'Exam Ready',
      description: 'Your exam is properly configured and ready for students.',
      priority: 'low'
    });
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const canProceed = analysisResults.hasQuestions && analysisResults.hasSubjects;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Questions</p>
                <p className="text-2xl font-bold">{analysisResults.questionCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-2xl font-bold">{analysisResults.estimatedDuration}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Security</p>
                <p className="text-2xl font-bold">✓</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-lg font-bold text-green-500">
                  {canProceed ? 'Ready' : 'Setup Required'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Exam Analysis & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.length > 0 ? (
            recommendations.map((rec, index) => (
              <Alert key={index} className={
                rec.type === 'error' ? 'border-red-200 bg-red-50' :
                rec.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                rec.type === 'success' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
              }>
                {getIcon(rec.type)}
                <AlertDescription>
                  <strong>{rec.title}:</strong> {rec.description}
                </AlertDescription>
              </Alert>
            ))
          ) : (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription>
                <strong>All Systems Ready:</strong> Your CBT exam is optimized and ready for deployment.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Optimization Features */}
      <Card>
        <CardHeader>
          <CardTitle>CBT Optimization Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                Security Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Anti-cheat monitoring enabled</li>
                <li>• Browser lock mode active</li>
                <li>• Screen capture prevention</li>
                <li>• Time tracking & analytics</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Performance Features  
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Optimized question loading</li>
                <li>• Auto-save functionality</li>
                <li>• Network resilience</li>
                <li>• Mobile responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      {onOptimize && (
        <div className="flex justify-center">
          <Button 
            onClick={onOptimize}
            disabled={!canProceed}
            size="lg"
            className="px-8"
          >
            {canProceed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Proceed with Optimized Exam
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Fix Issues Before Proceeding
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}