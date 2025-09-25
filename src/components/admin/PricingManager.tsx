import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Users, 
  Calendar,
  TrendingUp,
  Package,
  Settings,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  currency: string;
  description: string;
  features: any;
  resource_access_level: string;
  max_attempts: number;
  is_active: boolean;
  created_at: string;
}

const PricingManager = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration_days: '',
    currency: 'NGN',
    description: '',
    features: '',
    resource_access_level: 'basic',
    max_attempts: '',
    is_active: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const features = formData.features.split('\n').filter(f => f.trim());
      
      const planData = {
        name: formData.name,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        currency: formData.currency,
        description: formData.description,
        features: features,
        resource_access_level: formData.resource_access_level,
        max_attempts: formData.max_attempts ? parseInt(formData.max_attempts) : null,
        is_active: formData.is_active
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', editingPlan.id);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Subscription plan updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('subscription_plans')
          .insert([planData]);
        
        if (error) throw error;
        toast({
          title: "Success",
          description: "Subscription plan created successfully",
        });
      }

      fetchPlans();
      setIsCreateModalOpen(false);
      setEditingPlan(null);
      resetForm();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast({
        title: "Error",
        description: "Failed to save subscription plan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      duration_days: plan.duration_days.toString(),
      currency: plan.currency,
      description: plan.description || '',
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
      resource_access_level: plan.resource_access_level,
      max_attempts: plan.max_attempts?.toString() || '',
      is_active: plan.is_active
    });
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subscription plan deleted successfully",
      });
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscription plan",
        variant: "destructive",
      });
    }
  };

  const togglePlanStatus = async (planId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ is_active: !isActive })
        .eq('id', planId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Plan ${!isActive ? 'activated' : 'deactivated'} successfully`,
      });
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan status:', error);
      toast({
        title: "Error",
        description: "Failed to update plan status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      duration_days: '',
      currency: 'NGN',
      description: '',
      features: '',
      resource_access_level: 'basic',
      max_attempts: '',
      is_active: true
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pricing Management</h2>
          <p className="text-slate-400">Manage subscription plans and pricing</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => window.open('/pricing', '_blank')}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Public Pricing
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
              </DialogTitle>
              <DialogDescription>
                Configure the subscription plan details and features
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white">Plan Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Premium Plan"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="text-white">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration" className="text-white">Duration (Days)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_days}
                    onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                    placeholder="30"
                    required
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="currency" className="text-white">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="access_level" className="text-white">Access Level</Label>
                  <Select value={formData.resource_access_level} onValueChange={(value) => setFormData({...formData, resource_access_level: value})}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="max_attempts" className="text-white">Max Attempts (Optional)</Label>
                <Input
                  id="max_attempts"
                  type="number"
                  value={formData.max_attempts}
                  onChange={(e) => setFormData({...formData, max_attempts: e.target.value})}
                  placeholder="Leave empty for unlimited"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Plan description"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="features" className="text-white">Features (one per line)</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => setFormData({...formData, features: e.target.value})}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  rows={4}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active" className="text-white">Active Plan</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingPlan(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Plans Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Plans</p>
                <p className="text-3xl font-bold text-blue-400">{plans.length}</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Plans</p>
                <p className="text-3xl font-bold text-green-400">{plans.filter(p => p.is_active).length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Free Plans</p>
                <p className="text-3xl font-bold text-yellow-400">{plans.filter(p => p.price === 0).length}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg. Price</p>
                <p className="text-3xl font-bold text-purple-400">
                  ₦{plans.length > 0 ? Math.round(plans.reduce((sum, p) => sum + p.price, 0) / plans.length) : 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">{plan.name}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {plan.resource_access_level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-primary">
                      {formatCurrency(plan.price, plan.currency)}
                    </span>
                    <span className="text-sm text-slate-400">
                      /{plan.duration_days} days
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-300">{plan.description}</p>
                  
                  {Array.isArray(plan.features) && plan.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-white mb-2">Features:</p>
                      <ul className="text-sm text-slate-300 space-y-1">
                        {plan.features.slice(0, 3).map((feature: string, index: number) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-slate-400">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {plan.max_attempts && (
                    <div className="flex items-center text-sm text-slate-400">
                      <Calendar className="w-4 h-4 mr-2" />
                      Max {plan.max_attempts} attempts
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(plan)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={plan.is_active ? "secondary" : "default"}
                      onClick={() => togglePlanStatus(plan.id, plan.is_active)}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      {plan.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No subscription plans found</h3>
              <p className="text-slate-500 mb-4">Create your first subscription plan to get started</p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingManager;