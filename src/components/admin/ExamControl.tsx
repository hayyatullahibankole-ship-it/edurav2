import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Plus, 
  Calendar,
  Clock,
  Users,
  Settings,
  Play,
  Pause,
  Eye,
  Edit,
  Trash2,
  Copy,
  FileText,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ScheduleTestModal from '@/components/ScheduleTestModal';
import { Target, CheckCircle } from 'lucide-react';

export default function ExamControl() {
  const { toast } = useToast();
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [newExam, setNewExam] = useState({
    title: '',
    description: '',
    type: 'PRACTICE',
    duration_minutes: 120,
    total_questions: 40,
    passing_score: 50,
    instructions: '',
    is_published: false
  });

  useEffect(() => {
    fetchExamsData();
  }, []);

  const fetchExamsData = async () => {
    try {
      setLoading(true);
      
      const [examsResp, subjectsResp] = await Promise.all([
        supabase.from('exams').select('*').order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').eq('is_active', true)
      ]);

      setExams(examsResp.data || []);
      setSubjects(subjectsResp.data || []);
      
    } catch (error) {
      console.error('Error fetching exams data:', error);
      toast({
        title: "Error",
        description: "Failed to load exams data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('exams')
        .insert({
          ...newExam,
          type: newExam.type as 'JAMB' | 'WAEC' | 'CUSTOM'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Exam created successfully"
      });

      setIsCreateModalOpen(false);
      setNewExam({
        title: '',
        description: '',
        type: 'PRACTICE',
        duration_minutes: 120,
        total_questions: 40,
        passing_score: 50,
        instructions: '',
        is_published: false
      });
      fetchExamsData();
      
    } catch (error) {
      console.error('Error creating exam:', error);
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExamStatus = async (examId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_published: !currentStatus })
        .eq('id', examId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Exam ${!currentStatus ? 'published' : 'unpublished'} successfully`
      });

      fetchExamsData();
      
    } catch (error) {
      console.error('Error toggling exam status:', error);
      toast({
        title: "Error",
        description: "Failed to update exam status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Exam Control Center</h2>
          <p className="text-slate-400">Create, manage, and monitor examinations</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Examination</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  value={newExam.title}
                  onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                  placeholder="JAMB Mathematics Mock Exam"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExam.description}
                  onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                  placeholder="Comprehensive mathematics practice exam covering all JAMB topics..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Exam Type</Label>
                  <Select value={newExam.type} onValueChange={(value) => setNewExam({...newExam, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRACTICE">Practice Test</SelectItem>
                      <SelectItem value="MOCK">Mock Exam</SelectItem>
                      <SelectItem value="OFFICIAL">Official Exam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newExam.duration_minutes}
                    onChange={(e) => setNewExam({...newExam, duration_minutes: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="questions">Total Questions</Label>
                  <Input
                    id="questions"
                    type="number"
                    value={newExam.total_questions}
                    onChange={(e) => setNewExam({...newExam, total_questions: parseInt(e.target.value)})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="passing">Passing Score (%)</Label>
                  <Input
                    id="passing"
                    type="number"
                    value={newExam.passing_score}
                    onChange={(e) => setNewExam({...newExam, passing_score: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Exam Instructions</Label>
                <Textarea
                  id="instructions"
                  value={newExam.instructions}
                  onChange={(e) => setNewExam({...newExam, instructions: e.target.value})}
                  placeholder="1. Read all questions carefully\n2. Select the best answer\n3. Manage your time effectively..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={newExam.is_published}
                  onChange={(e) => setNewExam({...newExam, is_published: e.target.checked})}
                  className="rounded border-slate-600"
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateExam} disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Exam'}
                </Button>
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={loading}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Exam Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Exams</p>
                <p className="text-2xl font-bold text-blue-400">{exams.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Published</p>
                <p className="text-2xl font-bold text-green-400">
                  {exams.filter((exam: any) => exam.is_published).length}
                </p>
              </div>
              <Play className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Drafts</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {exams.filter((exam: any) => !exam.is_published).length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Sessions</p>
                <p className="text-2xl font-bold text-purple-400">12</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exams Management */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="all" className="text-white">All Exams</TabsTrigger>
          <TabsTrigger value="published" className="text-white">Published</TabsTrigger>
          <TabsTrigger value="drafts" className="text-white">Drafts</TabsTrigger>
          <TabsTrigger value="analytics" className="text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {exams.map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${exam.is_published ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white">{exam.title}</h3>
                          <Badge variant={exam.type === 'OFFICIAL' ? 'destructive' : 'secondary'}>
                            {exam.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {exam.duration_minutes}min
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {exam.total_questions} questions
                          </span>
                          <span>{new Date(exam.created_at).toLocaleDateString()}</span>
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
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={exam.is_published ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleExamStatus(exam.id, exam.is_published)}
                      >
                        {exam.is_published ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Publish
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {exams.length === 0 && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No exams found</p>
                    <p className="text-sm text-slate-500 mt-2">Create your first exam to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="published" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {exams.filter((exam: any) => exam.is_published).map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white">{exam.title}</h3>
                          <Badge variant="default" className="bg-green-600">LIVE</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {exam.duration_minutes}min
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {exam.total_questions} questions
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <ScheduleTestModal>
                        <Button variant="outline" size="sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          Schedule
                        </Button>
                      </ScheduleTestModal>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => toggleExamStatus(exam.id, exam.is_published)}
                      >
                        <Pause className="w-3 h-3 mr-1" />
                        Unpublish
                      </Button>
                    </div>
                  </div>
                ))}
                
                {exams.filter((exam: any) => exam.is_published).length === 0 && (
                  <div className="text-center py-8">
                    <Play className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No published exams</p>
                    <p className="text-sm text-slate-500 mt-2">Publish an exam to make it available to students</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drafts" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {exams.filter((exam: any) => !exam.is_published).map((exam: any) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white">{exam.title}</h3>
                          <Badge variant="secondary" className="bg-yellow-600">DRAFT</Badge>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-slate-400">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {exam.duration_minutes}min
                          </span>
                          <span className="flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {exam.total_questions} questions
                          </span>
                          <span>Created: {new Date(exam.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => toggleExamStatus(exam.id, exam.is_published)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Publish
                      </Button>
                    </div>
                  </div>
                ))}
                
                {exams.filter((exam: any) => !exam.is_published).length === 0 && (
                  <div className="text-center py-8">
                    <Edit className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No draft exams</p>
                    <p className="text-sm text-slate-500 mt-2">All exams are published</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Exam Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Total Attempts</span>
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-blue-400">1,247</p>
                  <p className="text-xs text-slate-400 mt-1">+12% from last week</p>
                </div>
                
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Average Score</span>
                    <Target className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-green-400">73.5%</p>
                  <p className="text-xs text-slate-400 mt-1">Platform average</p>
                </div>
                
                <div className="p-4 bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">Completion Rate</span>
                    <CheckCircle className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-purple-400">89.2%</p>
                  <p className="text-xs text-slate-400 mt-1">Students finishing exams</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-white font-medium mb-4">Most Popular Exams</h4>
                <div className="space-y-3">
                  {exams.slice(0, 5).map((exam: any, index: number) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 bg-slate-700 rounded border border-slate-600">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{exam.title}</p>
                          <p className="text-xs text-slate-400">{exam.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-400 font-bold">{Math.floor(Math.random() * 200) + 50}</p>
                        <p className="text-xs text-slate-400">attempts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}