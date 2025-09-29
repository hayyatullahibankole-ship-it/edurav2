/**
 * JAMB Scoring Algorithm (Current 2024/2025 Format)
 * - Correct answer: +4 points
 * - Wrong answer: 0 points (NO negative marking)
 * - No answer: 0 points
 * Final score capped at 400 (maximum possible)
 */
export function calculateJAMBScore(
  correctAnswers: number, 
  wrongAnswers: number, 
  totalQuestions: number = 180
): number {
  if (correctAnswers < 0 || wrongAnswers < 0 || correctAnswers + wrongAnswers > totalQuestions) {
    throw new Error('Invalid answer counts');
  }
  
  // JAMB uses NO negative marking - only correct answers count
  const rawScore = correctAnswers * 4;
  
  // Direct scoring - no scaling needed since max is already 400 for 100 questions
  return Math.max(0, Math.min(400, rawScore));
}

/**
 * WAEC Scoring Algorithm
 * Returns raw score and percentage per subject
 */
export function calculateWAECScore(correctAnswers: number, totalQuestions: number) {
  if (correctAnswers < 0 || correctAnswers > totalQuestions) {
    throw new Error('Invalid score parameters');
  }
  
  const rawScore = correctAnswers;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100; // Round to 2 decimal places
  
  return {
    rawScore,
    percentage,
    grade: getWAECGrade(percentage)
  };
}

/**
 * Get WAEC grade based on percentage
 */
function getWAECGrade(percentage: number): string {
  if (percentage >= 85) return 'A1';
  if (percentage >= 75) return 'B2';
  if (percentage >= 65) return 'B3';
  if (percentage >= 55) return 'C4';
  if (percentage >= 50) return 'C5';
  if (percentage >= 45) return 'C6';
  if (percentage >= 40) return 'D7';
  if (percentage >= 35) return 'E8';
  return 'F9';
}

/**
 * Calculate overall exam result
 */
export function calculateExamResult(
  answers: Array<{ questionId: string; answer: any; isCorrect: boolean; timeSpent: number }>,
  examType: 'JAMB' | 'WAEC' | 'CUSTOM',
  subjectBreakdown?: Record<string, { total: number; correct: number }>
) {
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const wrongAnswers = answers.filter(a => !a.isCorrect && a.answer !== null).length;
  const unanswered = answers.filter(a => a.answer === null).length;
  const totalTimeSpent = Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / 60); // Convert to minutes

  let result = {
    rawScore: correctAnswers,
    totalQuestions,
    correctAnswers,
    wrongAnswers,
    unanswered,
    percentage: Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100,
    timeSpentMinutes: totalTimeSpent,
    subjectBreakdown: subjectBreakdown || {}
  };

  if (examType === 'JAMB') {
    return {
      ...result,
      scaledScore: calculateJAMBScore(correctAnswers, wrongAnswers, totalQuestions),
      examType: 'JAMB'
    };
  } else if (examType === 'WAEC') {
    return {
      ...result,
      examType: 'WAEC',
      grading: subjectBreakdown ? Object.entries(subjectBreakdown).map(([subject, data]) => ({
        subject,
        ...calculateWAECScore(data.correct, data.total)
      })) : []
    };
  }

  return {
    ...result,
    examType: 'CUSTOM'
  };
}

/**
 * Generate performance analytics
 */
export function generatePerformanceAnalytics(results: any[]) {
  if (results.length === 0) return null;

  const totalAttempts = results.length;
  const averageScore = results.reduce((sum, r) => sum + (r.scaledScore || r.percentage), 0) / totalAttempts;
  const bestScore = Math.max(...results.map(r => r.scaledScore || r.percentage));
  const recentTrend = results.slice(-5); // Last 5 attempts
  
  // Calculate improvement trend
  const improvement = recentTrend.length > 1 
    ? recentTrend[recentTrend.length - 1].percentage - recentTrend[0].percentage 
    : 0;

  return {
    totalAttempts,
    averageScore: Math.round(averageScore * 100) / 100,
    bestScore,
    improvement: Math.round(improvement * 100) / 100,
    trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
  };
}

/**
 * Calculate percentile rank
 */
export function calculatePercentileRank(userScore: number, allScores: number[]): number {
  if (allScores.length === 0) return 0;
  
  const sortedScores = allScores.sort((a, b) => a - b);
  const belowCount = sortedScores.filter(score => score < userScore).length;
  const percentile = Math.round((belowCount / sortedScores.length) * 100);
  
  return percentile;
}