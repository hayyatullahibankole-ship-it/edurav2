import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Save, ArrowLeft, Users, BookOpen, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  class?: string;
}

interface SubjectItem {
  id: string;
  name: string;
}

const GRADE_MAP = [
  { min: 75, max: 100, grade: 'A1', remark: 'Excellent' },
  { min: 70, max: 74, grade: 'B2', remark: 'Very Good' },
  { min: 65, max: 69, grade: 'B3', remark: 'Good' },
  { min: 60, max: 64, grade: 'C4', remark: 'Credit' },
  { min: 55, max: 59, grade: 'C5', remark: 'Credit' },
  { min: 50, max: 54, grade: 'C6', remark: 'Credit' },
  { min: 45, max: 49, grade: 'D7', remark: 'Pass' },
  { min: 40, max: 44, grade: 'E8', remark: 'Pass' },
  { min: 0, max: 39, grade: 'F9', remark: 'Fail' },
];

function getGradeRemark(score: number) {
  const entry = GRADE_MAP.find(g => score >= g.min && score <= g.max);
  return entry || { grade: 'F9', remark: 'Fail' };
}

export default function MockResultsManager() {
  const { toast } = useToast();
  const [published, setPublished] = useState(false);
  const [settingsId, setSettingsId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Tab 1 state
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});

  // Tab 2 state
  const [selectedSubject, setSelectedSubject] = useState<SubjectItem | null>(null);
  const [searchSubjectStudent, setSearchSubjectStudent] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [subjectScores, setSubjectScores] = useState<Record<string, string>>({});
  const [showScoreEntry, setShowScoreEntry] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, subjectsRes, settingsRes] = await Promise.all([
        supabase.rpc('get_users_masked'),
        supabase.from('subjects').select('id, name').eq('is_active', true).order('name'),
        supabase.from('waec_result_settings').select('*').limit(1).single(),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data as any);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (settingsRes.data) {
        setPublished((settingsRes.data as any).result_published);
        setSettingsId((settingsRes.data as any).id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePublish = async () => {
    const newVal = !published;
    const { error } = await supabase
      .from('waec_result_settings')
      .update({ result_published: newVal } as any)
      .eq('id', settingsId);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setPublished(newVal);
      toast({ title: newVal ? 'Results Published' : 'Results Unpublished', description: newVal ? 'Students can now view their results' : 'Results hidden from students' });
    }
  };

  // ===== TAB 1: Enter by Student =====
  const filteredStudents = students.filter(s => {
    const q = searchStudent.toLowerCase();
    return (
      (s.first_name || '').toLowerCase().includes(q) ||
      (s.last_name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    setSelectedSubjects([]);
    setScores({});
    // Load existing results for this student
    const { data } = await supabase
      .from('waec_mock_results')
      .select('subject, score')
      .eq('user_id', student.id)
      .eq('exam_year', '2026 MOCK');
    if (data) {
      const existing: Record<string, string> = {};
      const existingSubjects: string[] = [];
      (data as any[]).forEach(r => {
        existing[r.subject] = String(r.score);
        existingSubjects.push(r.subject);
      });
      setScores(existing);
      setSelectedSubjects(existingSubjects);
    }
  };

  const toggleSubjectSelection = (subjectName: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectName) ? prev.filter(s => s !== subjectName) : [...prev, subjectName]
    );
  };

  const handleSaveStudentResults = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      const rows = selectedSubjects.map(subject => {
        const score = parseInt(scores[subject] || '0');
        const { grade, remark } = getGradeRemark(score);
        return {
          user_id: selectedStudent.id,
          subject,
          score,
          grade,
          remark,
          exam_year: '2026 MOCK',
          school_name: 'AL-BARI COLLEGE',
        };
      });

      const { error } = await supabase.from('waec_mock_results').upsert(rows as any, { onConflict: 'user_id,subject,exam_year' });
      if (error) throw error;
      toast({ title: 'Success', description: `Results saved for ${selectedStudent.first_name} ${selectedStudent.last_name}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // ===== TAB 2: Enter by Subject =====
  const filteredSubjectStudents = students.filter(s => {
    const q = searchSubjectStudent.toLowerCase();
    return (
      (s.first_name || '').toLowerCase().includes(q) ||
      (s.last_name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const handleSelectSubjectForEntry = async (subject: SubjectItem) => {
    setSelectedSubject(subject);
    setSelectedStudentIds([]);
    setSubjectScores({});
    setShowScoreEntry(false);
  };

  const toggleStudentForSubject = (id: string) => {
    setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleProceedToScores = async () => {
    // Load existing scores for these students + subject
    const { data } = await supabase
      .from('waec_mock_results')
      .select('user_id, score')
      .eq('subject', selectedSubject!.name)
      .eq('exam_year', '2026 MOCK')
      .in('user_id', selectedStudentIds);
    const existing: Record<string, string> = {};
    (data as any[] || []).forEach(r => { existing[r.user_id] = String(r.score); });
    setSubjectScores(existing);
    setShowScoreEntry(true);
  };

  const handleSaveSubjectResults = async () => {
    if (!selectedSubject) return;
    setSaving(true);
    try {
      const rows = selectedStudentIds.map(userId => {
        const score = parseInt(subjectScores[userId] || '0');
        const { grade, remark } = getGradeRemark(score);
        return {
          user_id: userId,
          subject: selectedSubject.name,
          score,
          grade,
          remark,
          exam_year: '2026 MOCK',
          school_name: 'AL-BARI COLLEGE',
        };
      });

      const { error } = await supabase.from('waec_mock_results').upsert(rows as any, { onConflict: 'user_id,subject,exam_year' });
      if (error) throw error;
      toast({ title: 'Success', description: `${selectedSubject.name} results saved for ${rows.length} students` });
      setShowScoreEntry(false);
      setSelectedStudentIds([]);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Publish Control */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Mock Results Management</span>
            <div className="flex items-center gap-3">
              <Label className="text-slate-300 text-sm">Publish Results</Label>
              <Switch checked={published} onCheckedChange={togglePublish} />
              <Badge className={published ? 'bg-green-600' : 'bg-red-600'}>{published ? 'Published' : 'Unpublished'}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="by-student" className="space-y-4">
        <TabsList className="bg-slate-800 border border-slate-700">
          <TabsTrigger value="by-student" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" /> Enter by Student
          </TabsTrigger>
          <TabsTrigger value="by-subject" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">
            <BookOpen className="w-4 h-4 mr-2" /> Enter by Subject
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: BY STUDENT */}
        <TabsContent value="by-student">
          {!selectedStudent ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Select a Student</CardTitle>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchStudent}
                    onChange={e => setSearchStudent(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map(s => (
                        <TableRow key={s.id} className="border-slate-700 hover:bg-slate-700/50 cursor-pointer" onClick={() => handleSelectStudent(s)}>
                          <TableCell className="text-white">{s.first_name} {s.last_name}</TableCell>
                          <TableCell className="text-slate-300">{s.email}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">Enter Results</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <CardTitle className="text-white">{selectedStudent.first_name} {selectedStudent.last_name}</CardTitle>
                    <p className="text-sm text-slate-400">{selectedStudent.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Subject selection */}
                <div>
                  <Label className="text-slate-300 mb-2 block">Select Subjects Attempted</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {subjects.map(sub => (
                      <label key={sub.id} className="flex items-center gap-2 p-2 rounded bg-slate-700 cursor-pointer hover:bg-slate-600">
                        <Checkbox
                          checked={selectedSubjects.includes(sub.name)}
                          onCheckedChange={() => toggleSubjectSelection(sub.name)}
                        />
                        <span className="text-sm text-white">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Score inputs */}
                {selectedSubjects.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-slate-300">Enter Scores</Label>
                    {selectedSubjects.map(subject => (
                      <div key={subject} className="flex items-center gap-4 bg-slate-700 p-3 rounded">
                        <span className="text-white flex-1 text-sm">{subject}</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={scores[subject] || ''}
                          onChange={e => setScores(prev => ({ ...prev, [subject]: e.target.value }))}
                          className="w-24 bg-slate-600 border-slate-500 text-white text-center"
                          placeholder="0-100"
                        />
                        <Badge className="w-12 text-center justify-center" variant="outline">
                          {scores[subject] ? getGradeRemark(parseInt(scores[subject]) || 0).grade : '—'}
                        </Badge>
                      </div>
                    ))}
                    <Button onClick={handleSaveStudentResults} disabled={saving} className="w-full">
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Results
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: BY SUBJECT */}
        <TabsContent value="by-subject">
          {!selectedSubject ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Select a Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {subjects.map(sub => (
                    <Button key={sub.id} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-auto py-3" onClick={() => handleSelectSubjectForEntry(sub)}>
                      <BookOpen className="w-4 h-4 mr-2" /> {sub.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : !showScoreEntry ? (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedSubject(null)} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <CardTitle className="text-white">{selectedSubject.name} — Select Students</CardTitle>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchSubjectStudent}
                    onChange={e => setSearchSubjectStudent(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400 w-10">
                          <Checkbox
                            checked={selectedStudentIds.length === filteredSubjectStudents.length && filteredSubjectStudents.length > 0}
                            onCheckedChange={(checked) => {
                              setSelectedStudentIds(checked ? filteredSubjectStudents.map(s => s.id) : []);
                            }}
                          />
                        </TableHead>
                        <TableHead className="text-slate-400">Name</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjectStudents.map(s => (
                        <TableRow key={s.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedStudentIds.includes(s.id)}
                              onCheckedChange={() => toggleStudentForSubject(s.id)}
                            />
                          </TableCell>
                          <TableCell className="text-white">{s.first_name} {s.last_name}</TableCell>
                          <TableCell className="text-slate-300">{s.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                {selectedStudentIds.length > 0 && (
                  <Button className="w-full mt-4" onClick={handleProceedToScores}>
                    Enter Scores for {selectedStudentIds.length} Students
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setShowScoreEntry(false)} className="text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <CardTitle className="text-white">{selectedSubject.name} — Enter Scores</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-[400px]">
                  {selectedStudentIds.map(id => {
                    const student = students.find(s => s.id === id);
                    if (!student) return null;
                    return (
                      <div key={id} className="flex items-center gap-4 bg-slate-700 p-3 rounded mb-2">
                        <span className="text-white flex-1 text-sm">{student.first_name} {student.last_name}</span>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={subjectScores[id] || ''}
                          onChange={e => setSubjectScores(prev => ({ ...prev, [id]: e.target.value }))}
                          className="w-24 bg-slate-600 border-slate-500 text-white text-center"
                          placeholder="0-100"
                        />
                        <Badge className="w-12 text-center justify-center" variant="outline">
                          {subjectScores[id] ? getGradeRemark(parseInt(subjectScores[id]) || 0).grade : '—'}
                        </Badge>
                      </div>
                    );
                  })}
                </ScrollArea>
                <Button onClick={handleSaveSubjectResults} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save All Scores
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
