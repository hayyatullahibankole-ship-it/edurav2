import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calculator as CalculatorIcon, X } from 'lucide-react';

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return secondValue !== 0 ? firstValue / secondValue : 0;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const buttonClass = "h-12 text-lg font-medium transition-colors";
  const numberButtonClass = `${buttonClass} bg-muted hover:bg-muted/80`;
  const operatorButtonClass = `${buttonClass} bg-primary text-primary-foreground hover:bg-primary/90`;
  const clearButtonClass = `${buttonClass} bg-destructive text-destructive-foreground hover:bg-destructive/90`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <CalculatorIcon className="h-5 w-5" />
            Calculator
          </DialogTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Display */}
              <div className="bg-muted p-4 rounded-lg text-right">
                <div className="text-2xl font-mono font-bold min-h-[2rem] flex items-center justify-end">
                  {display}
                </div>
              </div>

              {/* Buttons Grid */}
              <div className="grid grid-cols-4 gap-2">
                {/* Row 1 */}
                <Button 
                  className={clearButtonClass} 
                  onClick={clear}
                >
                  C
                </Button>
                <Button 
                  className={operatorButtonClass} 
                  onClick={() => setDisplay(display.slice(0, -1) || '0')}
                >
                  ⌫
                </Button>
                <Button 
                  className={operatorButtonClass} 
                  onClick={() => performOperation('÷')}
                >
                  ÷
                </Button>
                <Button 
                  className={operatorButtonClass} 
                  onClick={() => performOperation('×')}
                >
                  ×
                </Button>

                {/* Row 2 */}
                <Button className={numberButtonClass} onClick={() => inputNumber('7')}>7</Button>
                <Button className={numberButtonClass} onClick={() => inputNumber('8')}>8</Button>
                <Button className={numberButtonClass} onClick={() => inputNumber('9')}>9</Button>
                <Button 
                  className={operatorButtonClass} 
                  onClick={() => performOperation('-')}
                >
                  -
                </Button>

                {/* Row 3 */}
                <Button className={numberButtonClass} onClick={() => inputNumber('4')}>4</Button>
                <Button className={numberButtonClass} onClick={() => inputNumber('5')}>5</Button>
                <Button className={numberButtonClass} onClick={() => inputNumber('6')}>6</Button>
                <Button 
                  className={operatorButtonClass} 
                  onClick={() => performOperation('+')}
                >
                  +
                </Button>

                {/* Row 4 */}
                <Button className={numberButtonClass} onClick={() => inputNumber('1')}>1</Button>
                <Button className={numberButtonClass} onClick={() => inputNumber('2')}>2</Button>
                <Button className={numberButtonClass} onClick={() => inputNumber('3')}>3</Button>
                <Button 
                  className={`${operatorButtonClass} row-span-2`} 
                  onClick={handleEquals}
                >
                  =
                </Button>

                {/* Row 5 */}
                <Button 
                  className={`${numberButtonClass} col-span-2`} 
                  onClick={() => inputNumber('0')}
                >
                  0
                </Button>
                <Button className={numberButtonClass} onClick={inputDecimal}>.</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}