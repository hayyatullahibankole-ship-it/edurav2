import { Badge } from '@/components/ui/badge';

interface AnswerOptionProps {
  option: string;
  optIndex: number;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  totalOptions: number;
}

export const AnswerOption = ({ 
  option, 
  optIndex, 
  userAnswer, 
  correctAnswer, 
  isCorrect,
  totalOptions
}: AnswerOptionProps) => {
  const formatOption = (opt: string, index: number) => {
    return `${String.fromCharCode(65 + index)}. ${opt}`;
  };

  // Parse user answer to get index
  const getUserAnswerIndex = (): number => {
    if (typeof userAnswer === 'object' && userAnswer !== null) {
      const obj: any = userAnswer;
      const numCandidates = [obj.index, obj.idx, obj.answerIndex, obj.selectedIndex, obj.value];
      for (const c of numCandidates) {
        if (typeof c === 'number' || (typeof c === 'string' && /^\d+$/.test(c))) {
          const n = typeof c === 'string' ? parseInt(c) : c;
          if (n >= 0 && n < totalOptions) return n;
          if (n >= 1 && n <= totalOptions) return n - 1;
        }
      }
      const textCandidates = [obj.letter, obj.choice, obj.value, obj.text, obj.label, obj.option];
      const normalize = (s: string) => s.replace(/^[A-Za-z][\)\.:-]?\s*/, '').trim().toLowerCase();
      for (const t of textCandidates) {
        if (typeof t === 'string') {
          const s = t.trim();
          if (s.length === 1 && /[A-Za-z]/.test(s)) {
            return s.toUpperCase().charCodeAt(0) - 65;
          } else if (/^[A-Za-z][\)\.:-]?/.test(s)) {
            return s.charAt(0).toUpperCase().charCodeAt(0) - 65;
          } else if (/^\d+$/.test(s)) {
            const n = parseInt(s);
            if (n >= 0 && n < totalOptions) return n;
            if (n >= 1 && n <= totalOptions) return n - 1;
          } else if (normalize(s) === normalize(String(option))) {
            return optIndex;
          }
        }
      }
    }
    if (typeof userAnswer === 'number') {
      if (userAnswer >= 0 && userAnswer < totalOptions) return userAnswer;
      if (userAnswer >= 1 && userAnswer <= totalOptions) return userAnswer - 1;
      return -1;
    } else if (typeof userAnswer === 'string') {
      const userStr = userAnswer.trim();
      if (userStr.length === 1 && /[A-Za-z]/.test(userStr)) {
        return userStr.toUpperCase().charCodeAt(0) - 65;
      } else if (/^[A-Za-z][\)\.:-]?/.test(userStr)) {
        return userStr.charAt(0).toUpperCase().charCodeAt(0) - 65;
      } else if (!isNaN(parseInt(userStr))) {
        const num = parseInt(userStr);
        if (num >= 0 && num < totalOptions) return num;
        if (num >= 1 && num <= totalOptions) return num - 1;
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
    if (typeof correctAnswer === 'object' && correctAnswer !== null) {
      const obj: any = correctAnswer;
      const numCandidates = [obj.index, obj.idx, obj.answerIndex, obj.selectedIndex, obj.value];
      for (const c of numCandidates) {
        if (typeof c === 'number' || (typeof c === 'string' && /^\d+$/.test(c))) {
          const n = typeof c === 'string' ? parseInt(c) : c;
          if (n >= 0 && n < totalOptions) return n;
          if (n >= 1 && n <= totalOptions) return n - 1;
        }
      }
      const textCandidates = [obj.letter, obj.choice, obj.value, obj.text, obj.label, obj.option];
      const normalize = (s: string) => s.replace(/^[A-Za-z][\)\.:-]?\s*/, '').trim().toLowerCase();
      for (const t of textCandidates) {
        if (typeof t === 'string') {
          const s = t.trim();
          if (s.length === 1 && /[A-Za-z]/.test(s)) {
            return s.toUpperCase().charCodeAt(0) - 65;
          } else if (/^[A-Za-z][\)\.:-]?/.test(s)) {
            return s.charAt(0).toUpperCase().charCodeAt(0) - 65;
          } else if (/^\d+$/.test(s)) {
            const n = parseInt(s);
            if (n >= 0 && n < totalOptions) return n;
            if (n >= 1 && n <= totalOptions) return n - 1;
          } else if (normalize(s) === normalize(String(option))) {
            return optIndex;
          }
        }
      }
    }
    if (typeof correctAnswer === 'number') {
      if (correctAnswer >= 0 && correctAnswer < totalOptions) return correctAnswer;
      if (correctAnswer >= 1 && correctAnswer <= totalOptions) return correctAnswer - 1;
      return -1;
    } else if (typeof correctAnswer === 'string') {
      const correctStr = correctAnswer.trim();
      if (correctStr.length === 1 && /[A-Za-z]/.test(correctStr)) {
        return correctStr.toUpperCase().charCodeAt(0) - 65;
      } else if (/^[A-Za-z][\)\.:-]?/.test(correctStr)) {
        return correctStr.charAt(0).toUpperCase().charCodeAt(0) - 65;
      } else if (!isNaN(parseInt(correctStr))) {
        const num = parseInt(correctStr);
        if (num >= 0 && num < totalOptions) return num;
        if (num >= 1 && num <= totalOptions) return num - 1;
      } else {
        // Fallback: match by option text
        const normalize = (s: string) => s.replace(/^[A-Za-z][\)\.:-]?\s*/, '').trim().toLowerCase();
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
