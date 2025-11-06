import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Video, 
  FileText, 
  PlayCircle,
  ExternalLink,
  TrendingUp,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import ScheduleTestModal from "./ScheduleTestModal";
import { cn } from '@/lib/utils';

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
  const navigate = useNavigate();
  
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
      navigate(`/resources?subject=${encodeURIComponent(subject)}`);
    }
  };

  // Determine color and gradient based on percentage
  const getProgressStyles = (pct: number) => {
    if (pct >= 70) return {
      color: 'text-success',
      gradient: 'from-success to-success-glow',
      bg: 'bg-success/10',
      badge: 'bg-success/20 text-success border-success/30'
    };
    if (pct >= 50) return {
      color: 'text-warning',
      gradient: 'from-warning to-warning',
      bg: 'bg-warning/10',
      badge: 'bg-warning/20 text-warning border-warning/30'
    };
    return {
      color: 'text-destructive',
      gradient: 'from-destructive to-destructive',
      bg: 'bg-destructive/10',
      badge: 'bg-destructive/20 text-destructive border-destructive/30'
    };
  };

  const styles = getProgressStyles(progress);

  return (
    <Card className="h-full hover:shadow-2xl transition-all hover-lift border-0 bg-gradient-to-br from-card to-muted/30 group relative overflow-hidden">
      {/* Animated background accent */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity",
        styles.bg
      )} />
      
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", styles.gradient)} />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform",
            styles.gradient
          )}>
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {subject}
              {progress >= 70 && (
                <TrendingUp className="h-4 w-4 text-success animate-bounce" />
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              Focus: {focusArea || getDefaultFocusArea(subject)}
            </CardDescription>
          </div>
          <Badge className={cn("text-xs font-bold", styles.badge)}>
            {progress}%
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Progress
            </span>
            <span className={cn("text-sm font-bold", styles.color)}>{progress}%</span>
          </div>
          <Progress value={progress} className={cn("h-2.5", styles.bg)} />
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
            <span>0%</span>
            <span className="font-medium">Target: 70%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <h4 className="text-sm font-semibold mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Recommended Action
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {recommendedAction || getDefaultRecommendation(subject)}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2.5">Study Resources</h4>
          <div className="space-y-1.5">
            {resources.map((resource, index) => (
              <button
                key={index}
                onClick={() => handleResourceClick(resource)}
                className="w-full flex items-center gap-3 p-2.5 text-left text-sm hover:bg-muted rounded-lg transition-all group/item border border-transparent hover:border-border"
              >
                <div className={cn("p-1.5 rounded-md", styles.bg)}>
                  {getResourceIcon(resource.type)}
                </div>
                <span className="flex-1 group-hover/item:text-primary transition-colors font-medium">
                  {resource.title}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <ScheduleTestModal>
            <Button 
              className={cn(
                "w-full bg-gradient-to-r shadow-lg hover:shadow-xl transition-all group-hover:scale-105",
                styles.gradient
              )}
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

// Add missing import
import { Sparkles } from 'lucide-react';

export default SubjectProgressCard;
