import { Badge } from '@/components/ui/badge';

interface AnswerOptionProps {
  option: string;
  optIndex: number;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
}

export const AnswerOption = ({ 
  option, 
  optIndex, 
  userAnswer, 
  correctAnswer, 
  isCorrect 
}: AnswerOptionProps) => {
  const formatOption = (opt: string, index: number) => {
    return `${String.fromCharCode(65 + index)}. ${opt}`;
  };

  // Parse user answer to get index
  const getUserAnswerIndex = (): number => {
    if (typeof userAnswer === 'number') {
      return userAnswer;
    } else if (typeof userAnswer === 'string') {
      const userStr = userAnswer.trim();
      if (userStr.length === 1 && /[A-Za-z]/.test(userStr)) {
        return userStr.toUpperCase().charCodeAt(0) - 65;
      } else if (userStr.match(/^[A-Za-z]\)/)) {
        return userStr.charAt(0).toUpperCase().charCodeAt(0) - 65;
      } else if (!isNaN(parseInt(userStr))) {
        return parseInt(userStr);
      } else {
        // Fallback: match by option text
        const normalize = (s: string) => s.replace(/^[A-Za-z]\)\s*/, '').trim().toLowerCase();
        const ua = normalize(userStr);
        const optNorm = normalize(String(option));
        if (ua === optNorm || ua === String(option).trim().toLowerCase()) {
          return optIndex;
        }
      }
    }
    return -1;
  };

  // Parse correct answer to get index
  const getCorrectAnswerIndex = (): number => {
    if (typeof correctAnswer === 'number') {
      return correctAnswer;
    } else if (typeof correctAnswer === 'string') {
      const correctStr = correctAnswer.trim();
      if (correctStr.length === 1 && /[A-Za-z]/.test(correctStr)) {
        return correctStr.toUpperCase().charCodeAt(0) - 65;
      } else if (correctStr.match(/^[A-Za-z]\)/)) {
        return correctStr.charAt(0).toUpperCase().charCodeAt(0) - 65;
      } else if (!isNaN(parseInt(correctStr))) {
        return parseInt(correctStr);
      } else {
        // Fallback: match by option text
        const normalize = (s: string) => s.replace(/^[A-Za-z]\)\s*/, '').trim().toLowerCase();
        const ca = normalize(correctStr);
        const optNorm = normalize(String(option));
        if (ca === optNorm || ca === String(option).trim().toLowerCase()) {
          return optIndex;
        }
      }
    }
    return -1;
  };

  const userAnswerIndex = getUserAnswerIndex();
  const correctAnswerIndex = getCorrectAnswerIndex();

  const isUserAnswer = userAnswerIndex === optIndex;
  const isCorrectAnswer = correctAnswerIndex === optIndex;
  
  // Use the validated is_correct field from database
  const isValidatedCorrect = isUserAnswer && isCorrect;
  const isValidatedWrong = isUserAnswer && !isCorrect;
  
  let bgColor = 'bg-muted';
  let borderColor = 'border-muted';
  let textColor = '';
  
  if (isValidatedCorrect) {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    textColor = 'text-green-800';
  } else if (isCorrectAnswer) {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
    textColor = 'text-green-700';
  } else if (isValidatedWrong) {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
    textColor = 'text-red-800';
  }
  
  return (
    <div 
      className={`p-3 rounded border ${bgColor} ${borderColor} ${textColor}`}
    >
      <div className="flex items-center justify-between">
        <span>{formatOption(option, optIndex)}</span>
        <div className="flex gap-2">
          {isCorrectAnswer && (
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              ✓ Correct Answer
            </Badge>
          )}
          {isUserAnswer && (
            <Badge variant={isCorrect ? "default" : "destructive"}>
              Your Answer
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
