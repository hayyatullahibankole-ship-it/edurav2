import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReviewFiltersProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  correctCount: number;
  incorrectCount: number;
}

export const ReviewFilters = ({ 
  activeTab, 
  onTabChange, 
  correctCount, 
  incorrectCount 
}: ReviewFiltersProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All Questions</TabsTrigger>
        <TabsTrigger value="correct" className="text-green-600">
          Correct ({correctCount})
        </TabsTrigger>
        <TabsTrigger value="incorrect" className="text-red-600">
          Incorrect ({incorrectCount})
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
