import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Award,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  conversionRate: number;
}

interface Referral {
  id: string;
  referrer_name: string;
  referrer_email: string;
  referred_name: string;
  referred_email: string;
  referral_code: string;
  status: string;
  reward_points: number;
  created_at: string;
  converted_at: string | null;
}

export default function ReferralManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    pendingReferrals: 0,
    totalRewards: 0,
    conversionRate: 0
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);

      // Fetch referrals with user details
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          id,
          referral_code,
          status,
          reward_points,
          created_at,
          converted_at,
          referrer:referrer_id(first_name, last_name, email),
          referred:referred_user_id(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Transform data
      const transformedReferrals = referralsData?.map((ref: any) => ({
        id: ref.id,
        referrer_name: `${ref.referrer?.first_name || ''} ${ref.referrer?.last_name || ''}`.trim() || 'Unknown',
        referrer_email: ref.referrer?.email || '',
        referred_name: `${ref.referred?.first_name || ''} ${ref.referred?.last_name || ''}`.trim() || 'Unknown',
        referred_email: ref.referred?.email || '',
        referral_code: ref.referral_code,
        status: ref.status,
        reward_points: ref.reward_points || 0,
        created_at: ref.created_at,
        converted_at: ref.converted_at
      })) || [];

      setReferrals(transformedReferrals);

      // Calculate stats
      const totalReferrals = transformedReferrals.length;
      const activeReferrals = transformedReferrals.filter((r: any) => r.status === 'active').length;
      const pendingReferrals = transformedReferrals.filter((r: any) => r.status === 'pending').length;
      const totalRewards = transformedReferrals.reduce((sum: number, r: any) => sum + (r.reward_points || 0), 0);
      const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;

      setStats({
        totalReferrals,
        activeReferrals,
        pendingReferrals,
        totalRewards,
        conversionRate
      });

    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(ref =>
    ref.referrer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referred_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referrer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referred_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'expired':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.activeReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.pendingReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRewards}</div>
            <p className="text-xs text-muted-foreground">Points distributed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Program Benefits</CardTitle>
          <CardDescription>How the referral system benefits Edura and students</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Benefits for Edura
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Organic Growth:</strong> Cost-effective user acquisition through word-of-mouth</li>
                <li>• <strong>Trust Building:</strong> New users referred by friends have higher trust and engagement</li>
                <li>• <strong>Higher Retention:</strong> Referred users typically have 25-40% better retention rates</li>
                <li>• <strong>Community Building:</strong> Creates a network effect and stronger user community</li>
                <li>• <strong>Marketing ROI:</strong> Lower customer acquisition cost compared to paid ads</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 flex items-center">
                <Gift className="w-5 h-5 mr-2 text-success" />
                Benefits for Students
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• <strong>Welcome Bonus:</strong> 25 points for signing up with a referral code</li>
                <li>• <strong>Referrer Rewards:</strong> 50 points when a friend signs up</li>
                <li>• <strong>Premium Perks:</strong> 100 extra points + 7 days premium when referred friend subscribes</li>
                <li>• <strong>Unlimited Referrals:</strong> No limit on how many friends you can refer</li>
                <li>• <strong>Study Together:</strong> Build a community of motivated peers</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Referral Activity</CardTitle>
              <CardDescription>Monitor all referral transactions</CardDescription>
            </div>
            <Button onClick={fetchReferralData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, email, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredReferrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'No referrals found matching your search' : 'No referrals yet'}
              </div>
            ) : (
              filteredReferrals.map((referral) => (
                <div key={referral.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{referral.referrer_name}</p>
                        <span className="text-muted-foreground">→</span>
                        <p className="font-medium">{referral.referred_name}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{referral.referrer_email}</span>
                        <span>→</span>
                        <span>{referral.referred_email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Badge variant="outline" className="font-mono">{referral.referral_code}</Badge>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{formatDate(referral.created_at)}</span>
                        {referral.converted_at && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-success text-xs">Converted {formatDate(referral.converted_at)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{referral.reward_points} pts</p>
                      </div>
                      {getStatusBadge(referral.status)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
