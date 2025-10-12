import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

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
      <Card className="group hover-lift cursor-pointer border-2 border-transparent hover:border-primary/50 transition-all duration-300 overflow-hidden h-full">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
        <CardContent className="p-6 relative">
          <div className={`mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300 group-hover:scale-110`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            {badge && (
              <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
