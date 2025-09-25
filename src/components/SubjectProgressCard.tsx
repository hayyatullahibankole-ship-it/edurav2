import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Video, 
  FileText, 
  PlayCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import ScheduleTestModal from "./ScheduleTestModal";

interface SubjectProgressCardProps {
  subject: string;
  progress: number;
  focusArea?: string;
  recommendedAction?: string;
  studyResources?: Array<{
    title: string;
    type: 'video' | 'document' | 'test';
    url?: string;
  }>;
}

const SubjectProgressCard: React.FC<SubjectProgressCardProps> = ({
  subject,
  progress,
  focusArea,
  recommendedAction,
  studyResources = []
}) => {
  const getDefaultResources = (subjectName: string) => {
    const subjectLower = subjectName.toLowerCase();
    
    if (subjectLower.includes('mathematics') || subjectLower.includes('math')) {
      return [
        { title: "Video Tutorial: Quadratic Equations", type: 'video' as const },
        { title: "Practice Questions Set 1", type: 'document' as const }
      ];
    } else if (subjectLower.includes('physics')) {
      return [
        { title: "Physics Textbook Chapter 12", type: 'document' as const },
        { title: "Online Simulation Tool", type: 'video' as const }
      ];
    } else if (subjectLower.includes('chemistry')) {
      return [
        { title: "Chemical Bonding Video Series", type: 'video' as const },
        { title: "Periodic Table Study Guide", type: 'document' as const }
      ];
    } else if (subjectLower.includes('english')) {
      return [
        { title: "Grammar and Composition Guide", type: 'document' as const },
        { title: "Literature Analysis Videos", type: 'video' as const }
      ];
    }
    
    return [
      { title: `${subjectName} Study Guide`, type: 'document' as const },
      { title: `${subjectName} Video Tutorials`, type: 'video' as const }
    ];
  };

  const resources = studyResources.length > 0 ? studyResources : getDefaultResources(subject);
  
  const getDefaultFocusArea = (subjectName: string) => {
    const subjectLower = subjectName.toLowerCase();
    
    if (subjectLower.includes('mathematics') || subjectLower.includes('math')) {
      return "Quadratic Equations";
    } else if (subjectLower.includes('physics')) {
      return "Electromagnetic Induction";
    } else if (subjectLower.includes('chemistry')) {
      return "Chemical Bonding";
    } else if (subjectLower.includes('english')) {
      return "Essay Writing";
    }
    
    return "Core Concepts";
  };

  const getDefaultRecommendation = (subjectName: string) => {
    const subjectLower = subjectName.toLowerCase();
    
    if (subjectLower.includes('mathematics') || subjectLower.includes('math')) {
      return "Practice more word problems and formula applications";
    } else if (subjectLower.includes('physics')) {
      return "Review Faraday's law and Lenz's law concepts";
    } else if (subjectLower.includes('chemistry')) {
      return "Focus on ionic and covalent bonding mechanisms";
    } else if (subjectLower.includes('english')) {
      return "Improve paragraph structure and vocabulary";
    }
    
    return `Review fundamental concepts and practice more questions`;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'test':
        return <PlayCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleResourceClick = (resource: any) => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else {
      // Navigate to resources page with filter
      window.location.href = `/resources?subject=${encodeURIComponent(subject)}`;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{subject}</CardTitle>
            <CardDescription className="text-sm">
              Focus Area: {focusArea || getDefaultFocusArea(subject)}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {progress}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Recommended Action</h4>
          <p className="text-sm text-muted-foreground">
            {recommendedAction || getDefaultRecommendation(subject)}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-3">Study Resources</h4>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <button
                key={index}
                onClick={() => handleResourceClick(resource)}
                className="w-full flex items-center gap-2 p-2 text-left text-sm hover:bg-muted/50 rounded-md transition-colors group"
              >
                <div className="text-accent">
                  {getResourceIcon(resource.type)}
                </div>
                <span className="flex-1 group-hover:text-primary transition-colors">
                  {resource.title}
                </span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <ScheduleTestModal>
            <Button 
              className="w-full bg-accent hover:bg-accent/90 text-white"
              size="sm"
            >
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Studying {subject}
            </Button>
          </ScheduleTestModal>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectProgressCard;