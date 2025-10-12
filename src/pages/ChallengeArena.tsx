import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, Clock, Target, Award, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { formatDistanceToNow } from 'date-fns';

interface Challenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  question_count: number;
  duration_minutes: number;
  difficulty_level: number;
  points_reward: number;
  start_date: string;
  end_date: string;
}

interface LeaderboardEntry {
  user_id: string;
  users: {
    first_name: string;
    last_name: string;
  };
  score: number;
  time_taken_seconds: number;
  points_earned: number;
  completed_at: string;
}

export default function ChallengeArena() {
  const navigate = useNavigate();
  const { isEnterprise, loading: subLoading } = useSubscription();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('daily');

  useEffect(() => {
    if (!subLoading && !isEnterprise) {
      toast.error('Challenge Arena is available for Pro subscribers only');
      navigate('/payment');
      return;
    }

    if (isEnterprise) {
      fetchChallenges();
      fetchLeaderboard();
    }
  }, [isEnterprise, subLoading, selectedTab, navigate]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .eq('challenge_type', selectedTab)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      toast.error('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_attempts')
        .select(`
          *,
          users (first_name, last_name)
        `)
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  if (subLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isEnterprise) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">🏆 Challenge Arena</h1>
          <p className="text-muted-foreground">Compete, improve, and climb the leaderboard</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#--</div>
              <p className="text-xs text-muted-foreground">Complete challenges to rank</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Earn points by competing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Unlock badges</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="special">Special</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Active Challenges</h2>
                
                {challenges.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Target className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No active {selectedTab} challenges</p>
                    </CardContent>
                  </Card>
                ) : (
                  challenges.map((challenge) => (
                    <Card key={challenge.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle>{challenge.title}</CardTitle>
                            <CardDescription className="mt-2">
                              {challenge.description}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {challenge.points_reward} pts
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {challenge.question_count} questions
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {challenge.duration_minutes} min
                          </div>
                          <span>Difficulty: {challenge.difficulty_level}/5</span>
                        </div>
                        <Button 
                          className="w-full"
                          onClick={() => navigate(`/challenge/${challenge.id}`)}
                        >
                          Start Challenge
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">🏆 Leaderboard</h2>
                <Card>
                  <CardContent className="pt-6">
                    {leaderboard.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                        <p>No rankings yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {leaderboard.map((entry, index) => (
                          <div 
                            key={entry.user_id}
                            className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                index === 0 ? 'bg-yellow-500 text-white' :
                                index === 1 ? 'bg-gray-400 text-white' :
                                index === 2 ? 'bg-orange-600 text-white' :
                                'bg-muted'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {entry.users?.first_name} {entry.users?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(entry.completed_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{entry.score} pts</p>
                              <p className="text-xs text-muted-foreground">
                                {Math.floor(entry.time_taken_seconds / 60)}:{(entry.time_taken_seconds % 60).toString().padStart(2, '0')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
