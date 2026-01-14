import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Newspaper, RefreshCw, Rss, CheckCircle, AlertCircle } from 'lucide-react';

const NEWS_SOURCES = [
  { name: 'MySchool.ng', category: 'Education News', status: 'active' },
  { name: 'Nigerian Scholars', category: 'Scholarships', status: 'active' },
  { name: 'DailyPost Education', category: 'University News', status: 'active' },
];

export const NewsAggregator = () => {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    created: number;
    message: string;
  } | null>(null);

  const handleFetchNews = async () => {
    setIsFetching(true);
    setLastResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-education-news');
      
      if (error) throw error;
      
      setLastResult(data);
      
      if (data.success) {
        toast({
          title: 'News Fetched Successfully',
          description: data.message,
        });
      } else {
        toast({
          title: 'Fetch Failed',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch education news',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Education News Aggregator
        </CardTitle>
        <CardDescription>
          Automatically fetch Nigerian education news from RSS feeds and publish to your blog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* News Sources */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active News Sources</h4>
          <div className="flex flex-wrap gap-2">
            {NEWS_SOURCES.map((source) => (
              <Badge key={source.name} variant="secondary" className="flex items-center gap-1">
                <Rss className="h-3 w-3" />
                {source.name}
                <span className="text-xs opacity-70">({source.category})</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Fetch Button */}
        <Button 
          onClick={handleFetchNews} 
          disabled={isFetching}
          className="w-full"
        >
          {isFetching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching News...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Fetch Latest News Now
            </>
          )}
        </Button>

        {/* Last Result */}
        {lastResult && (
          <div className={`p-4 rounded-lg ${lastResult.success ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}`}>
            <div className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className={lastResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                {lastResult.message}
              </span>
            </div>
            {lastResult.created > 0 && (
              <p className="mt-2 text-sm text-muted-foreground">
                {lastResult.created} new articles published to your blog
              </p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• News is fetched from Nigerian education RSS feeds</p>
          <p>• Duplicate articles are automatically filtered</p>
          <p>• Articles are auto-published with source attribution</p>
          <p>• Categories: JAMB/Admissions, Scholarships, University News</p>
        </div>
      </CardContent>
    </Card>
  );
};
