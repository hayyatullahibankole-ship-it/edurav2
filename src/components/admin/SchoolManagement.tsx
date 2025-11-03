import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  School, 
  Plus, 
  Users, 
  CreditCard, 
  Search,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';

interface School {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  max_students: number;
  created_at: string;
}

interface SchoolSubscription {
  id: string;
  school_id: string;
  status: string;
  start_date: string;
  end_date: string | null;
  student_seats: number;
  used_seats: number;
  subscription_plans: {
    name: string;
    price: number;
    currency: string;
  };
}

export default function SchoolManagement() {
  const { toast } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [schoolSubscriptions, setSchoolSubscriptions] = useState<Record<string, SchoolSubscription>>({});

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      
      // Fetch schools
      const schoolsResp = await supabase
        .from('schools')
        .select('*')
        .order('created_at', { ascending: false });

      if (schoolsResp.error) throw schoolsResp.error;
      
      setSchools(schoolsResp.data || []);

      // Fetch subscriptions with plan details
      const subscriptionsResp = await supabase
        .from('school_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            price,
            currency
          )
        `)
        .eq('status', 'ACTIVE');

      // Index subscriptions by school_id
      const subsMap: Record<string, SchoolSubscription> = {};
      if (subscriptionsResp.data) {
        subscriptionsResp.data.forEach((sub: any) => {
          subsMap[sub.school_id] = sub;
        });
      }
      setSchoolSubscriptions(subsMap);

    } catch (error) {
      console.error('Error fetching schools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schools',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSchoolStatus = async (schoolId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('schools')
        .update({ is_active: !currentStatus })
        .eq('id', schoolId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `School ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });

      fetchSchools();
    } catch (error) {
      console.error('Error updating school:', error);
      toast({
        title: 'Error',
        description: 'Failed to update school status',
        variant: 'destructive'
      });
    }
  };

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">School Management</h2>
          <p className="text-slate-400">Manage schools and institutional subscriptions</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add School
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Schools</p>
                <p className="text-2xl font-bold text-blue-400">{schools.length}</p>
              </div>
              <School className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Schools</p>
                <p className="text-2xl font-bold text-green-400">
                  {schools.filter(s => s.is_active).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">With Subscriptions</p>
                <p className="text-2xl font-bold text-purple-400">
                  {Object.keys(schoolSubscriptions).length}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Students</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {Object.values(schoolSubscriptions).reduce((sum, sub) => sum + sub.used_seats, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schools List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Loading schools...</div>
          ) : filteredSchools.length === 0 ? (
            <div className="text-center py-8">
              <School className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No schools found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSchools.map((school) => {
                const subscription = schoolSubscriptions[school.id];
                return (
                  <div
                    key={school.id}
                    className="flex items-start justify-between p-4 bg-slate-700 rounded-lg border border-slate-600"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-white">{school.name}</h3>
                        <Badge className={school.is_active ? 'bg-green-600' : 'bg-red-600'}>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {subscription && (
                          <Badge className="bg-purple-600">Subscribed</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-300">
                        <div>
                          <span className="text-slate-400">Email:</span> {school.email}
                        </div>
                        <div>
                          <span className="text-slate-400">Slug:</span> {school.slug}
                        </div>
                        <div>
                          <span className="text-slate-400">Location:</span>{' '}
                          {school.city ? `${school.city}, ${school.state}` : 'N/A'}
                        </div>
                        {subscription && (
                          <div>
                            <span className="text-slate-400">Students:</span>{' '}
                            {subscription.used_seats} / {subscription.student_seats}
                          </div>
                        )}
                      </div>
                      {subscription && (
                        <div className="mt-2 text-sm text-slate-300">
                          <span className="text-slate-400">Plan:</span> {subscription.subscription_plans.name} - 
                          Valid until {new Date(subscription.end_date || '').toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSchool(school)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSchoolStatus(school.id, school.is_active)}
                      >
                        {school.is_active ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}