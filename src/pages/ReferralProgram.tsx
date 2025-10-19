import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Users, Gift, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const ReferralProgram = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRewards: 0,
    pendingRewards: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile?.id) {
      fetchReferralData();
    }
  }, [userProfile]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      const [codeRes, referralsRes, rewardsRes] = await Promise.all([
        supabase
          .from('referral_codes')
          .select('*')
          .eq('user_id', userProfile?.id)
          .single(),

        supabase
          .from('referrals')
          .select(`
            *,
            referred_user:users!referrals_referred_user_id_fkey(first_name, last_name, email)
          `)
          .eq('referrer_id', userProfile?.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('referral_rewards')
          .select('*')
          .eq('user_id', userProfile?.id)
          .order('created_at', { ascending: false }),
      ]);

      if (codeRes.data) {
        setReferralCode(codeRes.data.code);
      }

      if (referralsRes.data) {
        setReferrals(referralsRes.data);
        
        const active = referralsRes.data.filter(r => r.status === 'active').length;
        setStats(prev => ({
          ...prev,
          totalReferrals: referralsRes.data.length,
          activeReferrals: active,
        }));
      }

      if (rewardsRes.data) {
        setRewards(rewardsRes.data);
        
        const total = rewardsRes.data
          .filter(r => r.claimed)
          .reduce((sum, r) => sum + r.reward_value, 0);
        
        const pending = rewardsRes.data
          .filter(r => !r.claimed)
          .reduce((sum, r) => sum + r.reward_value, 0);

        setStats(prev => ({
          ...prev,
          totalRewards: total,
          pendingRewards: pending,
        }));
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied!',
      description: 'Referral link copied to clipboard.',
    });
  };

  const shareReferral = async () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    const text = `Join Edura CBT and ace your exams! Use my referral code: ${referralCode}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Edura CBT',
          text,
          url: link,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyReferralLink();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'default',
      active: 'secondary',
      completed: 'outline',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">
            Invite friends and earn rewards for every successful referral!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">{stats.totalReferrals}</p>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-success" />
              <p className="text-3xl font-bold">{stats.activeReferrals}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-warning" />
              <p className="text-3xl font-bold">{stats.totalRewards}</p>
              <p className="text-sm text-muted-foreground">Points Earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-info" />
              <p className="text-3xl font-bold">{stats.pendingRewards}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to invite friends</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={`${window.location.origin}/auth?ref=${referralCode}`}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyReferralLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={shareReferral} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="font-semibold mb-2">How it works:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>Share your unique referral link with friends</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>They sign up using your link</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  <span>You both earn rewards when they subscribe!</span>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Referrals List */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals ({referrals.length})</CardTitle>
              <CardDescription>People who joined using your link</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Loading...</p>
              ) : referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No referrals yet</p>
                  <p className="text-sm mt-2">Start sharing your link!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {referrals.map((referral) => (
                    <div key={referral.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">
                          {referral.referred_user?.first_name || 'User'} {referral.referred_user?.last_name || ''}
                        </p>
                        {getStatusBadge(referral.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>Joined: {new Date(referral.created_at).toLocaleDateString()}</p>
                        {referral.reward_points > 0 && (
                          <p className="text-success">+{referral.reward_points} points</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardTitle>Rewards ({rewards.length})</CardTitle>
              <CardDescription>Your referral rewards</CardDescription>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No rewards yet</p>
                  <p className="text-sm mt-2">Refer friends to earn rewards!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-warning" />
                          <p className="font-medium">{reward.reward_type}</p>
                        </div>
                        {reward.claimed ? (
                          <Badge variant="secondary">Claimed</Badge>
                        ) : (
                          <Badge>Pending</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{reward.description}</p>
                      <p className="text-lg font-bold text-primary">+{reward.reward_value} points</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferralProgram;
