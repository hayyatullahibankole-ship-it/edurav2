import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Sword, Trophy, Award, Plus, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function ChallengeManager() {
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChallengeDialogOpen, setIsChallengeDialogOpen] = useState(false);
  const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    challenge_type: 'daily' as 'daily' | 'weekly' | 'special',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    question_count: 20,
    duration_minutes: 30,
    difficulty_level: 2,
    points_reward: 100,
    subject_ids: [] as string[],
    is_active: true
  });

  const [achievementForm, setAchievementForm] = useState({
    name: '',
    description: '',
    category: 'milestone',
    badge_icon: '🏆',
    badge_color: 'gold',
    points_value: 50,
    criteria: {} as any,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [challengesRes, achievementsRes, attemptsRes, subjectsRes] = await Promise.all([
        supabase.from('challenges').select('*, challenge_attempts(count)').order('start_date', { ascending: false }),
        supabase.from('achievements').select('*').order('created_at', { ascending: false }),
        supabase
          .from('challenge_attempts')
          .select('*, users(first_name, last_name, email), challenges(title)')
          .order('score', { ascending: false })
          .limit(20),
        supabase.from('subjects').select('*').eq('is_active', true)
      ]);

      if (challengesRes.error) throw challengesRes.error;
      if (achievementsRes.error) throw achievementsRes.error;
      if (attemptsRes.error) throw attemptsRes.error;
      if (subjectsRes.error) throw subjectsRes.error;

      setChallenges(challengesRes.data || []);
      setAchievements(achievementsRes.data || []);
      setLeaderboard(attemptsRes.data || []);
      setSubjects(subjectsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load challenge data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    try {
      const { error } = await supabase.from('challenges').insert([{
        ...challengeForm,
        subject_ids: JSON.stringify(challengeForm.subject_ids)
      }]);
      if (error) throw error;

      toast({ title: 'Success', description: 'Challenge created successfully' });
      setIsChallengeDialogOpen(false);
      resetChallengeForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create challenge',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateChallenge = async () => {
    try {
      const { error } = await supabase
        .from('challenges')
        .update({
          ...challengeForm,
          subject_ids: JSON.stringify(challengeForm.subject_ids)
        })
        .eq('id', selectedChallenge.id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Challenge updated successfully' });
      setIsChallengeDialogOpen(false);
      setSelectedChallenge(null);
      resetChallengeForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update challenge',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    try {
      const { error } = await supabase.from('challenges').delete().eq('id', challengeId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Challenge deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete challenge',
        variant: 'destructive'
      });
    }
  };

  const handleCreateAchievement = async () => {
    try {
      const { error } = await supabase.from('achievements').insert([achievementForm]);
      if (error) throw error;

      toast({ title: 'Success', description: 'Achievement created successfully' });
      setIsAchievementDialogOpen(false);
      resetAchievementForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create achievement',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateAchievement = async () => {
    try {
      const { error } = await supabase
        .from('achievements')
        .update(achievementForm)
        .eq('id', selectedAchievement.id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Achievement updated successfully' });
      setIsAchievementDialogOpen(false);
      setSelectedAchievement(null);
      resetAchievementForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update achievement',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAchievement = async (achievementId: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const { error } = await supabase.from('achievements').delete().eq('id', achievementId);
      if (error) throw error;

      toast({ title: 'Success', description: 'Achievement deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete achievement',
        variant: 'destructive'
      });
    }
  };

  const resetChallengeForm = () => {
    setChallengeForm({
      title: '',
      description: '',
      challenge_type: 'daily',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      question_count: 20,
      duration_minutes: 30,
      difficulty_level: 2,
      points_reward: 100,
      subject_ids: [],
      is_active: true
    });
  };

  const resetAchievementForm = () => {
    setAchievementForm({
      name: '',
      description: '',
      category: 'milestone',
      badge_icon: '🏆',
      badge_color: 'gold',
      points_value: 50,
      criteria: {},
      is_active: true
    });
  };

  const editChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setChallengeForm({
      title: challenge.title,
      description: challenge.description || '',
      challenge_type: challenge.challenge_type,
      start_date: challenge.start_date.split('T')[0],
      end_date: challenge.end_date.split('T')[0],
      question_count: challenge.question_count,
      duration_minutes: challenge.duration_minutes,
      difficulty_level: challenge.difficulty_level,
      points_reward: challenge.points_reward,
      subject_ids: typeof challenge.subject_ids === 'string' ? JSON.parse(challenge.subject_ids) : challenge.subject_ids || [],
      is_active: challenge.is_active
    });
    setIsChallengeDialogOpen(true);
  };

  const editAchievement = (achievement: any) => {
    setSelectedAchievement(achievement);
    setAchievementForm({
      name: achievement.name,
      description: achievement.description || '',
      category: achievement.category || 'performance',
      badge_icon: achievement.badge_icon || '🏆',
      badge_color: achievement.badge_color || 'gold',
      points_value: achievement.points_value,
      criteria: achievement.criteria || {},
      is_active: achievement.is_active
    });
    setIsAchievementDialogOpen(true);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Challenge Arena Management</h2>
          <p className="text-muted-foreground">Manage challenges, achievements, and leaderboards</p>
        </div>
      </div>

      <Tabs defaultValue="challenges" className="space-y-4">
        <TabsList>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{challenges.length} challenges total</p>
            <Dialog open={isChallengeDialogOpen} onOpenChange={setIsChallengeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedChallenge(null); resetChallengeForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{selectedChallenge ? 'Edit Challenge' : 'Create New Challenge'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={challengeForm.title}
                      onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
                      placeholder="Challenge title"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={challengeForm.description}
                      onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
                      placeholder="Challenge description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Challenge Type</Label>
                      <Select value={challengeForm.challenge_type} onValueChange={(v: any) => setChallengeForm({ ...challengeForm, challenge_type: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="special">Special</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Difficulty Level (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={challengeForm.difficulty_level}
                        onChange={(e) => setChallengeForm({ ...challengeForm, difficulty_level: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={challengeForm.start_date}
                        onChange={(e) => setChallengeForm({ ...challengeForm, start_date: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={challengeForm.end_date}
                        onChange={(e) => setChallengeForm({ ...challengeForm, end_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Questions</Label>
                      <Input
                        type="number"
                        value={challengeForm.question_count}
                        onChange={(e) => setChallengeForm({ ...challengeForm, question_count: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Duration (mins)</Label>
                      <Input
                        type="number"
                        value={challengeForm.duration_minutes}
                        onChange={(e) => setChallengeForm({ ...challengeForm, duration_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Points Reward</Label>
                      <Input
                        type="number"
                        value={challengeForm.points_reward}
                        onChange={(e) => setChallengeForm({ ...challengeForm, points_reward: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={challengeForm.is_active}
                      onCheckedChange={(checked) => setChallengeForm({ ...challengeForm, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsChallengeDialogOpen(false)}>Cancel</Button>
                  <Button onClick={selectedChallenge ? handleUpdateChallenge : handleCreateChallenge}>
                    {selectedChallenge ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Sword className="w-5 h-5" />
                        {challenge.title}
                        {!challenge.is_active && <Badge variant="secondary">Inactive</Badge>}
                        <Badge variant="outline">{challenge.challenge_type}</Badge>
                      </CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{challenge.question_count} questions</Badge>
                        <Badge variant="outline">{challenge.duration_minutes} mins</Badge>
                        <Badge variant="outline">{challenge.points_reward} points</Badge>
                        <Badge variant="outline">Level {challenge.difficulty_level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(challenge.start_date).toLocaleDateString()} - {new Date(challenge.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => editChallenge(challenge)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteChallenge(challenge.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{achievements.length} achievements total</p>
            <Dialog open={isAchievementDialogOpen} onOpenChange={setIsAchievementDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setSelectedAchievement(null); resetAchievementForm(); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Achievement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{selectedAchievement ? 'Edit Achievement' : 'Create New Achievement'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={achievementForm.name}
                      onChange={(e) => setAchievementForm({ ...achievementForm, name: e.target.value })}
                      placeholder="Achievement name"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={achievementForm.description}
                      onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                      placeholder="Achievement description"
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={achievementForm.category}
                      onValueChange={(value) => setAchievementForm({ ...achievementForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="speed">Speed</SelectItem>
                        <SelectItem value="accuracy">Accuracy</SelectItem>
                        <SelectItem value="consistency">Consistency</SelectItem>
                        <SelectItem value="subject">Subject Mastery</SelectItem>
                        <SelectItem value="milestone">Milestone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Badge Icon (Emoji)</Label>
                      <Input
                        value={achievementForm.badge_icon}
                        onChange={(e) => setAchievementForm({ ...achievementForm, badge_icon: e.target.value })}
                        placeholder="🏆"
                      />
                    </div>
                    <div>
                      <Label>Badge Color</Label>
                      <Input
                        value={achievementForm.badge_color}
                        onChange={(e) => setAchievementForm({ ...achievementForm, badge_color: e.target.value })}
                        placeholder="gold"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Points Value</Label>
                    <Input
                      type="number"
                      value={achievementForm.points_value}
                      onChange={(e) => setAchievementForm({ ...achievementForm, points_value: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={achievementForm.is_active}
                      onCheckedChange={(checked) => setAchievementForm({ ...achievementForm, is_active: checked })}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAchievementDialogOpen(false)}>Cancel</Button>
                  <Button onClick={selectedAchievement ? handleUpdateAchievement : handleCreateAchievement}>
                    {selectedAchievement ? 'Update' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.badge_icon}</div>
                      <div>
                        <CardTitle className="text-base">{achievement.name}</CardTitle>
                        <CardDescription className="text-xs">{achievement.description}</CardDescription>
                        <Badge variant="outline" className="mt-1">{achievement.points_value} points</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => editAchievement(achievement)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAchievement(achievement.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Top {leaderboard.length} performers</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Challenge Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">#{index + 1}</div>
                      <div>
                        <p className="font-medium">
                          {entry.users?.first_name} {entry.users?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{entry.challenges?.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{entry.score}%</p>
                      <p className="text-xs text-muted-foreground">{entry.points_earned} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
