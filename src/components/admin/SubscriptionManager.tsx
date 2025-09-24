import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Plus, 
  Users,
  DollarSign,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionManager() {
  const { toast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: 0,
    duration_days: 30,
    currency: 'NGN',
    features: [],
    max_attempts: null,
    resource_access_level: 'basic',
    is_active: true
  });

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      const [subscriptionsResp, plansResp] = await Promise.all([
        supabase.from('subscriptions').select(`
          *,
          users!inner(first_name, last_name, email),
          subscription_plans!inner(name, price, currency)
        `).order('created_at', { ascending: false }),
        supabase.from('subscription_plans').select('*').order('created_at', { ascending: false })
      ]);

      setSubscriptions(subscriptionsResp.data || []);
      setPlans(plansResp.data || []);
      
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('subscription_plans')
        .insert(newPlan);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription plan created successfully"
      });

      setIsCreatePlanModalOpen(false);
      setNewPlan({
        name: '',
        description: '',
        price: 0,
        duration_days: 30,
        currency: 'NGN',
        features: [],
        max_attempts: null,
        resource_access_level: 'basic',
        is_active: true
      });
      fetchSubscriptionData();
      
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create subscription plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSubscriptionStatus = async (subscriptionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE';
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Subscription ${newStatus.toLowerCase()} successfully`
      });

      fetchSubscriptionData();
      
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Error",
        description: "Failed to update subscription status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-600 text-white">Active</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-red-600 text-white">Expired</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-600 text-white">Cancelled</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-yellow-600 text-white">Suspended</Badge>;
      default:
        return <Badge className="bg-blue-600 text-white">Trial</Badge>;
    }
  };

  const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'ACTIVE').length;
  const totalRevenue = subscriptions.reduce((total: number, sub: any) => {
    return total + (sub.subscription_plans?.price || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Subscription Manager</h2>
          <p className="text-slate-400">Manage subscription plans and user subscriptions</p>
        </div>
        
        <Dialog open={isCreatePlanModalOpen} onOpenChange={setIsCreatePlanModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planName">Plan Name</Label>
                  <Input
                    id="planName"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="Premium Plan"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPlan.price}
                    onChange={(e) => setNewPlan({...newPlan, price: parseFloat(e.target.value)})}
                    placeholder="2500"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                  placeholder="Full access to all features"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newPlan.duration_days}
                    onChange={(e) => setNewPlan({...newPlan, duration_days: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newPlan.currency} onValueChange={(value) => setNewPlan({...newPlan, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxAttempts">Max Attempts</Label>
                  <Input
                    id="maxAttempts"
                    type="number"
                    value={newPlan.max_attempts || ''}
                    onChange={(e) => setNewPlan({...newPlan, max_attempts: e.target.value ? parseInt(e.target.value) : null})}
                    placeholder="Unlimited"
                  />
                </div>
                
                <div>
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select value={newPlan.resource_access_level} onValueChange={(value) => setNewPlan({...newPlan, resource_access_level: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreatePlan} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Plan'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreatePlanModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subscription Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Subscriptions</p>
                <p className="text-2xl font-bold text-green-400">{activeSubscriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-400">₦{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Plans</p>
                <p className="text-2xl font-bold text-purple-400">{plans.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Conversion Rate</p>
                <p className="text-2xl font-bold text-orange-400">65%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Management */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="subscriptions" className="text-white">Active Subscriptions</TabsTrigger>
          <TabsTrigger value="plans" className="text-white">Subscription Plans</TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">Revenue Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {subscriptions.map((subscription: any) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white">
                            {subscription.users?.first_name} {subscription.users?.last_name}
                          </h3>
                          {getStatusBadge(subscription.status)}
                        </div>
                        <p className="text-sm text-slate-400">{subscription.users?.email}</p>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                          <span>{subscription.subscription_plans?.name}</span>
                          <span>₦{subscription.subscription_plans?.price?.toLocaleString()}</span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'No end date'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSubscriptionStatus(subscription.id, subscription.status)}
                        disabled={loading}
                      >
                        {subscription.status === 'ACTIVE' ? (
                          <Ban className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {subscriptions.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No subscriptions found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan: any) => (
                  <Card key={plan.id} className="bg-slate-700 border-slate-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{plan.name}</CardTitle>
                        <Badge className={plan.is_active ? "bg-green-600" : "bg-gray-600"}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-3xl font-bold text-blue-400">
                            ₦{plan.price?.toLocaleString()}
                          </p>
                          <p className="text-sm text-slate-400">per {plan.duration_days} days</p>
                        </div>
                        
                        <p className="text-sm text-slate-300">{plan.description}</p>
                        
                        <div className="text-xs text-slate-400 space-y-1">
                          <div>Max Attempts: {plan.max_attempts || 'Unlimited'}</div>
                          <div>Access Level: {plan.resource_access_level}</div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Revenue analytics dashboard</p>
                <p className="text-sm text-slate-500 mt-2">Charts and insights will be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}