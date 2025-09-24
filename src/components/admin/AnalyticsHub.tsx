import React from 'react';
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
  PieChart,
  Calendar
} from 'lucide-react';

export default function AnalyticsHub() {
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
                <p className="text-3xl font-bold text-blue-100">2,847</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+12.5%</span>
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
                <p className="text-3xl font-bold text-green-100">1,924</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+8.3%</span>
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
                <p className="text-3xl font-bold text-purple-100">78.4%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+2.1%</span>
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
                <p className="text-sm text-orange-300">Success Rate</p>
                <p className="text-3xl font-bold text-orange-100">92.1%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">+5.2%</span>
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
                <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Interactive Chart Area</p>
                    <p className="text-sm text-slate-500">Usage trends visualization</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-slate-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Performance Distribution</p>
                    <p className="text-sm text-slate-500">Score range analytics</p>
                  </div>
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
                  <p className="text-2xl font-bold text-blue-400">127</p>
                  <p className="text-xs text-slate-400">+23 from yesterday</p>
                </div>
                
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">New Registrations</span>
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-400">34</p>
                  <p className="text-xs text-slate-400">+15 from yesterday</p>
                </div>
                
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Active Sessions</span>
                    <Activity className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-400">23</p>
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
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Mathematics</span>
                      <Badge className="bg-green-600">85.2%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">English</span>
                      <Badge className="bg-blue-600">82.7%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Physics</span>
                      <Badge className="bg-purple-600">78.9%</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded">
                      <span className="text-slate-300">Chemistry</span>
                      <Badge className="bg-orange-600">75.4%</Badge>
                    </div>
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