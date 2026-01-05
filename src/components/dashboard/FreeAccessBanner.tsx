import { format, differenceInDays } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FreeAccessBannerProps {
  expiryDate: string | Date;
  isExpired?: boolean;
}

export function FreeAccessBanner({ expiryDate, isExpired = false }: FreeAccessBannerProps) {
  const navigate = useNavigate();
  const expiry = new Date(expiryDate);
  const daysLeft = differenceInDays(expiry, new Date());

  if (isExpired) {
    return (
      <Card className="border-destructive/30 bg-gradient-to-r from-destructive/10 to-background">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                Your complimentary access has ended.
              </p>
              <p className="text-sm text-muted-foreground">
                Subscribe now to continue practicing with Edura and maintain your progress.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/payment')} className="shrink-0">
            Subscribe Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isExpiringSoon = daysLeft <= 3;

  return (
    <Card className={`border-primary/20 ${isExpiringSoon ? 'bg-gradient-to-r from-amber-500/10 to-background' : 'bg-gradient-to-r from-primary/10 to-background'}`}>
      <CardContent className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${isExpiringSoon ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
            {isExpiringSoon ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : (
              <Sparkles className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {isExpiringSoon 
                ? `Only ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left of complimentary access!`
                : 'You have complimentary access to Edura!'
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Practice, track your progress, and prepare for WAEC & JAMB. 
              <span className="ml-1">
                Expires on {format(expiry, 'MMMM d, yyyy')}.
              </span>
            </p>
          </div>
        </div>
        <Button 
          variant={isExpiringSoon ? 'default' : 'outline'} 
          onClick={() => navigate('/payment')} 
          className="shrink-0"
        >
          {isExpiringSoon ? 'Subscribe Now' : 'View Plans'}
        </Button>
      </CardContent>
    </Card>
  );
}
