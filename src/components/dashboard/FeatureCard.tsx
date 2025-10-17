import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  gradient?: string;
  badge?: string;
}

export const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  href,
  gradient = "from-primary to-secondary",
  badge
}: FeatureCardProps) => {
  return (
    <Link to={href}>
      <Card className="relative overflow-hidden group hover:shadow-2xl transition-all h-full border-0 bg-gradient-to-br from-card to-muted/30 hover-lift hover:scale-105">
        {/* Animated gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-all duration-300",
          gradient
        )} />
        
        {/* Top accent bar */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-50 group-hover:opacity-100 transition-opacity",
          gradient
        )} />
        
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-4 rounded-xl bg-gradient-to-br shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
              gradient
            )}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs font-semibold animate-pulse">
                {badge}
              </Badge>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
          <div className="flex items-center text-primary text-sm font-semibold group-hover:translate-x-2 transition-transform">
            Explore <ArrowRight className="ml-1 h-4 w-4" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
