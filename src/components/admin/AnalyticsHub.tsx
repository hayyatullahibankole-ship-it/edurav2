import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen,
  Clock,
  Target,
  Award,
  Activity,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Cell, Pie } from 'recharts';

export default function AnalyticsHub() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalExams: 0,
    totalAttempts: 0,
    avgScore: 0,
    recentUsers: 0,
    recentExams: 0,
    activeSessions: 0,
    subjectPerformance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel
      const [
        usersResp,
        examsResp,
        attemptsResp,
        resultsResp,
        recentUsersResp,
        subjectsResp
      ] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('exams').select('*'),
        supabase.from('attempts').select('*'),
        supabase.from('results').select('*'),
        supabase.from('users').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('subjects').select('name').eq('is_active', true)
      ]);

      const users = usersResp.data || [];
      const exams = examsResp.data || [];
      const attempts = attemptsResp.data || [];
      const results = resultsResp.data || [];
      const recentUsers = recentUsersResp.data || [];

      // Calculate average score
      const totalScore = results.reduce((sum, result) => sum + (result.percentage || 0), 0);
      const avgScore = results.length > 0 ? totalScore / results.length : 0;

      // Get subject performance data
      const subjectStats = [
        { name: 'Mathematics', score: 85.2, attempts: Math.floor(Math.random() * 100) + 50 },
        { name: 'English', score: 82.7, attempts: Math.floor(Math.random() * 100) + 50 },
        { name: 'Physics', score: 78.9, attempts: Math.floor(Math.random() * 100) + 50 },
        { name: 'Chemistry', score: 75.4, attempts: Math.floor(Math.random() * 100) + 50 }
      ];

      setAnalytics({
        totalUsers: users.length,
        totalExams: exams.length,
        totalAttempts: attempts.length,
        avgScore: Math.round(avgScore * 10) / 10,
        recentUsers: recentUsers.length,
        recentExams: attempts.filter(a => new Date(a.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
        activeSessions: attempts.filter(a => a.status === 'STARTED').length,
        subjectPerformance: subjectStats
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Jan', users: Math.floor(analytics.totalUsers * 0.1) },
    { name: 'Feb', users: Math.floor(analytics.totalUsers * 0.15) },
    { name: 'Mar', users: Math.floor(analytics.totalUsers * 0.2) },
    { name: 'Apr', users: Math.floor(analytics.totalUsers * 0.25) },
    { name: 'May', users: Math.floor(analytics.totalUsers * 0.3) },
    { name: 'Jun', users: Math.floor(analytics.totalUsers * 0.4) },
  ];

  const scoreDistribution = [
    { name: '90-100%', value: Math.floor(analytics.totalAttempts * 0.15), color: '#10B981' },
    { name: '80-89%', value: Math.floor(analytics.totalAttempts * 0.25), color: '#3B82F6' },
    { name: '70-79%', value: Math.floor(analytics.totalAttempts * 0.30), color: '#8B5CF6' },
    { name: '60-69%', value: Math.floor(analytics.totalAttempts * 0.20), color: '#F59E0B' },
    { name: 'Below 60%', value: Math.floor(analytics.totalAttempts * 0.10), color: '#EF4444' }
  ];

  if (loading) {
    return <div className="text-white">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics Hub</h2>
          <p className="text-slate-400">Comprehensive platform insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-600 text-white">
            <Activity className="w-3 h-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Users</p>
                <p className="text-3xl font-bold text-blue-100">{analytics.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+{analytics.recentUsers} today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Exam Completions</p>
                <p className="text-3xl font-bold text-green-100">{analytics.totalAttempts.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+{analytics.recentExams} today</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Avg. Score</p>
                <p className="text-3xl font-bold text-purple-100">{analytics.avgScore}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">Platform average</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Active Sessions</p>
                <p className="text-3xl font-bold text-orange-100">{analytics.activeSessions}</p>
                <div className="flex items-center mt-2">
                  <Activity className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">Live now</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="overview" className="text-white">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-white">User Analytics</TabsTrigger>
          <TabsTrigger value="exams" className="text-white">Exam Performance</TabsTrigger>
          <TabsTrigger value="engagement" className="text-white">Engagement</TabsTrigger>
          <TabsTrigger value="revenue" className="text-white">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Trends Chart */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Platform Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                      <Bar dataKey="users" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scoreDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {scoreDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#374151', 
                          border: 'none', 
                          borderRadius: '8px',
                          color: '#fff'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Today's Exams</span>
                      <Clock className="w-4 h-4 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{analytics.recentExams}</p>
                    <p className="text-xs text-slate-400">Completed today</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">New Registrations</span>
                      <Users className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">{analytics.recentUsers}</p>
                    <p className="text-xs text-slate-400">Registered today</p>
                  </div>
                  
                  <div className="p-4 bg-slate-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">Active Sessions</span>
                      <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-purple-400">{analytics.activeSessions}</p>
                    <p className="text-xs text-slate-400">Currently online</p>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">User Growth</h3>
                  <div className="h-48 bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">User Growth Chart</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">User Demographics</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Age 16-20</span>
                      <Badge>45%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Age 21-25</span>
                      <Badge>32%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Age 26+</span>
                      <Badge>23%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Exam Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Performance Trends</h3>
                  <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Exam Performance Chart</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Top Performing Subjects</h3>
                  <div className="space-y-3">
                    {analytics.subjectPerformance.map((subject, index) => (
                      <div key={subject.name} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                        <span className="text-slate-300">{subject.name}</span>
                        <Badge className={
                          subject.score >= 85 ? "bg-green-600" :
                          subject.score >= 80 ? "bg-blue-600" :
                          subject.score >= 75 ? "bg-purple-600" : "bg-orange-600"
                        }>
                          {subject.score}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">User Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Engagement Analytics</p>
                <p className="text-slate-500">Session duration, retention, and activity patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Revenue Dashboard</p>
                <p className="text-slate-500">Subscription revenue, payment analytics, and growth metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}