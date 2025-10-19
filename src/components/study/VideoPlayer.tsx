import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  lessonId: string;
  videoUrl: string;
  videoPlatform?: 'youtube' | 'vimeo' | 'direct';
  duration?: number;
}

export const VideoPlayer = ({ lessonId, videoUrl, videoPlatform = 'youtube', duration }: VideoPlayerProps) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);

  useEffect(() => {
    if (userProfile?.id) {
      loadProgress();
    }
  }, [userProfile, lessonId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying && videoRef.current) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        setWatchedSeconds(currentTime);
        setProgress((currentTime / (duration || videoRef.current.duration)) * 100);
        
        // Save progress every 10 seconds
        if (currentTime % 10 === 0) {
          saveProgress(currentTime);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const loadProgress = async () => {
    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('user_id', userProfile?.id)
        .maybeSingle();

      if (error) throw error;

      if (data && videoRef.current) {
        videoRef.current.currentTime = data.watched_duration_seconds;
        setWatchedSeconds(data.watched_duration_seconds);
        setProgress(data.completed_percentage);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  const saveProgress = async (currentSeconds: number) => {
    if (!userProfile?.id || !duration) return;

    try {
      const totalDuration = duration * 60; // Convert minutes to seconds
      const percentage = (currentSeconds / totalDuration) * 100;

      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: userProfile.id,
          lesson_id: lessonId,
          watched_duration_seconds: currentSeconds,
          total_duration_seconds: totalDuration,
          completed_percentage: Math.min(percentage, 100),
          last_watched_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const skipSeconds = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const getEmbedUrl = () => {
    if (videoPlatform === 'youtube') {
      const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=))([\w-]+)/)?.[1];
      return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;
    } else if (videoPlatform === 'vimeo') {
      const videoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return videoUrl;
  };

  if (videoPlatform === 'youtube' || videoPlatform === 'vimeo') {
    return (
      <Card className="overflow-hidden">
        <div className="relative pt-[56.25%]">
          <iframe
            src={getEmbedUrl()}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {progress > 0 && (
          <div className="p-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full"
          onEnded={() => {
            setIsPlaying(false);
            saveProgress(watchedSeconds);
          }}
        />
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipSeconds(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipSeconds(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            
            <div className="flex-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};
