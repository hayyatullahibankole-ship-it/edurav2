import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Users, BookOpen, Plus, Download, Printer, Loader2, CheckCircle2, Trophy, TrendingUp, TrendingDown } from "lucide-react";

const AVAILABLE_SUBJECTS = [
  { id: "f01354df-283f-4069-a750-dba247a6bf97", name: "English Language", locked: true, questions: 60 },
  { id: "d9bbd411-3623-4553-937c-cfe55a7ac82b", name: "Mathematics", questions: 40 },
  { id: "d165bc08-818b-403d-bd31-f2c1965a2bfb", name: "Physics", questions: 40 },
  { id: "76f33a39-4903-4336-84da-17d082f99498", name: "Chemistry", questions: 40 },
  { id: "ce4023fd-9a2c-4065-9b83-8b5734f895a0", name: "Biology", questions: 40 },
  { id: "ed819500-1ca7-4067-832b-13161a598a07", name: "Economics", questions: 40 },
  { id: "2ec36942-176e-4fad-b451-c84c25ad30ec", name: "Government", questions: 40 },
  { id: "be93668a-3fe1-4410-8062-6a1fcc8fd9d1", name: "Literature in English", questions: 40 },
  { id: "2035b922-b680-40a7-8fc1-d7cd945d303b", name: "Commerce", questions: 40 },
  { id: "f76a7b84-7c85-4d81-8aa9-fc406668a965", name: "Accounting", questions: 40 },
  { id: "d482c961-afec-4078-919b-d52dee4b91d3", name: "Geography", questions: 40 },
];

interface Props {
  schoolId: string;
}

export default function SchoolMockManager({ schoolId }: Props) {
  const [students, setStudents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegDialog, setShowRegDialog] = useState(false);
  const [tab, setTab] = useState<'register' | 'list' | 'results'>('list');

  // Registration form
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [regMode, setRegMode] = useState("virtual");
  const [regBatch, setRegBatch] = useState("");
  const [studentSubjects, setStudentSubjects] = useState<Record<string, string[]>>({});
  const [registering, setRegistering] = useState(false);

  useEffect(() => { loadData(); }, [schoolId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [studentsRes, regsRes, resultsRes, batchRes] = await Promise.all([
        supabase.from("school_students").select("id, full_name, class_level, user_id").eq("school_id", schoolId),
        supabase.from("mock_registrations" as any).select("*").eq("school_id", schoolId).order("created_at", { ascending: false }),
        supabase.from("mock_results" as any).select("*"),
        supabase.from("mock_batches" as any).select("*").eq("is_active", true),
      ]);

      if (studentsRes.error) console.error('Error loading students:', studentsRes.error);
      if (regsRes.error) console.error('Error loading registrations:', regsRes.error);
      if (resultsRes.error) console.error('Error loading results:', resultsRes.error);
      if (batchRes.error) console.error('Error loading batches:', batchRes.error);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (regsRes.data) setRegistrations(regsRes.data as any[]);
      if (batchRes.data) setBatches(batchRes.data as any[]);

      // Get results for school registrations
      if (regsRes.data && resultsRes.data) {
        const schoolRegIds = (regsRes.data as any[]).map(r => r.id);
        const schoolResults = (resultsRes.data as any[]).filter(r => schoolRegIds.includes(r.registration_id));
        setResults(schoolResults);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleSubject = (studentId: string, subjectId: string) => {
    setStudentSubjects(prev => {
      const current = prev[studentId] || [];
      const subject = AVAILABLE_SUBJECTS.find(s => s.id === subjectId);
      if (subject?.locked) return prev;
      
      const updated = current.includes(subjectId)
        ? current.filter(id => id !== subjectId)
        : current.length < 3 ? [...current, subjectId] : current;
      return { ...prev, [studentId]: updated };
    });
  };

  const registerStudents = async () => {
    if (selectedStudents.length === 0) { toast.error("Select at least one student"); return; }
    
    // Validate subjects
    for (const studentId of selectedStudents) {
      if ((studentSubjects[studentId] || []).length !== 3) {
        const student = students.find(s => s.id === studentId);
        toast.error(`Select 3 subjects for ${student?.full_name}`);
        return;
      }
    }

    setRegistering(true);
    try {
      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        if (!student) continue;

        const { data: regNum } = await supabase.rpc("generate_mock_reg_number" as any);
        
        const english = AVAILABLE_SUBJECTS.find(s => s.locked)!;
        const otherSubjects = (studentSubjects[studentId] || []).map(id => AVAILABLE_SUBJECTS.find(s => s.id === id)!);
        const subjects = [english, ...otherSubjects].map(s => ({ id: s.id, name: s.name, questions: s.questions }));

        await supabase.from("mock_registrations" as any).insert({
          registration_number: regNum,
          full_name: student.full_name,
          phone: "school",
          mode: regMode,
          subjects,
          batch_id: regBatch || null,
          school_id: schoolId,
          school_student_id: studentId,
          user_id: student.user_id,
          payment_status: "waived",
        } as any);
      }

      toast.success(`${selectedStudents.length} students registered successfully!`);
      setSelectedStudents([]);
      setStudentSubjects({});
      setShowRegDialog(false);
      setTab('list');
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRegistering(false);
    }
  };

  const exportResults = () => {
    const csv = [
      ["Name", "Reg Number", "Total Score", "Max Score", ...["English", "Subject 2", "Subject 3", "Subject 4"]],
      ...results.map(r => {
        const reg = registrations.find(reg => reg.id === r.registration_id);
        const scores = (r.subject_scores || []).map((s: any) => `${s.subject_name}: ${s.converted_score}`);
        return [reg?.full_name || "", r.registration_number, r.total_score, r.max_score, ...scores];
      })
    ].map(r => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school_mock_results_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Results exported");
  };

  const registeredStudentIds = new Set(registrations.map(r => r.school_student_id));

  if (loading) return <div className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Mock Exam Section</h2>
          <p className="text-sm text-muted-foreground">Register students for AKBOY JAMB Mock Exam</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setTab('list')}>
            <Users className="w-4 h-4 mr-1" /> Mock Students
          </Button>
          <Button variant={tab === 'register' ? 'default' : 'outline'} size="sm" onClick={() => setTab('register')}>
            <Plus className="w-4 h-4 mr-1" /> Register
          </Button>
          <Button variant={tab === 'results' ? 'default' : 'outline'} size="sm" onClick={() => setTab('results')}>
            <Trophy className="w-4 h-4 mr-1" /> Results
          </Button>
        </div>
      </div>

      {/* Register Tab */}
      {tab === 'register' && (
        <Card>
          <CardHeader>
            <CardTitle>Register Students for Mock Exam</CardTitle>
            <CardDescription>Select students and choose subjects (English + 3 others each)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mode</Label>
                <Select value={regMode} onValueChange={setRegMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="physical">Physical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {batches.length > 0 && (
                <div>
                  <Label>Batch</Label>
                  <Select value={regBatch} onValueChange={setRegBatch}>
                    <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">No batch</SelectItem>
                      {batches.map(b => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Select</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subjects (select 3)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(student => {
                    const alreadyRegistered = registeredStudentIds.has(student.id);
                    const isSelected = selectedStudents.includes(student.id);
                    return (
                      <TableRow key={student.id} className={alreadyRegistered ? 'opacity-50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleStudent(student.id)}
                            disabled={alreadyRegistered}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.class_level || '-'}</TableCell>
                        <TableCell>
                          {isSelected ? (
                            <div className="flex flex-wrap gap-1">
                              {AVAILABLE_SUBJECTS.filter(s => !s.locked).map(subject => (
                                <button
                                  key={subject.id}
                                  onClick={() => toggleSubject(student.id, subject.id)}
                                  className={`text-[10px] px-2 py-0.5 rounded border ${
                                    (studentSubjects[student.id] || []).includes(subject.id)
                                      ? 'bg-orange-100 border-orange-400 text-orange-700'
                                      : 'border-border hover:border-orange-300'
                                  }`}
                                >
                                  {subject.name.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Select student first</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {alreadyRegistered ? (
                            <Badge variant="secondary" className="text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Registered</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Not registered</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={registerStudents}
              disabled={registering || selectedStudents.length === 0}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              {registering ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</> :
                `Register ${selectedStudents.length} Student${selectedStudents.length !== 1 ? 's' : ''}`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List Tab */}
      {tab === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Registered Mock Students</CardTitle>
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" /> Print Admit Slips
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No students registered yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Reg Number</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Exam Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map(reg => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.full_name}</TableCell>
                      <TableCell className="font-mono text-xs">{reg.registration_number}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{reg.mode}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(reg.subjects || []).map((s: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">{s.name}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={reg.exam_status === 'submitted' ? 'default' : 'outline'} className="text-xs capitalize">
                          {reg.exam_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Tab */}
      {tab === 'results' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mock Exam Results</CardTitle>
              {results.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportResults}>
                  <Download className="w-4 h-4 mr-1" /> Export Results
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No results available yet</p>
            ) : (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <Card><CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{results.length}</p>
                    <p className="text-xs text-muted-foreground">Total Results</p>
                  </CardContent></Card>
                  <Card><CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{Math.round(results.reduce((s, r) => s + r.total_score, 0) / results.length)}</p>
                    <p className="text-xs text-muted-foreground">Average Score /400</p>
                  </CardContent></Card>
                  <Card><CardContent className="pt-4 text-center">
                    <p className="text-2xl font-bold">{Math.max(...results.map(r => r.total_score))}</p>
                    <p className="text-xs text-muted-foreground">Highest Score /400</p>
                  </CardContent></Card>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Subject Scores</TableHead>
                      <TableHead>Strengths</TableHead>
                      <TableHead>Weaknesses</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map(r => {
                      const reg = registrations.find(reg => reg.id === r.registration_id);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{reg?.full_name || r.registration_number}</TableCell>
                          <TableCell className="font-bold">{r.total_score}/400</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(r.subject_scores || []).map((s: any, i: number) => (
                                <Badge key={i} variant="outline" className="text-[10px]">
                                  {s.subject_name?.split(' ')[0]}: {s.converted_score}/100
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(r.strengths || []).map((s: string, i: number) => (
                                <Badge key={i} className="text-[10px] bg-green-100 text-green-700">{s.split(' ')[0]}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(r.weaknesses || []).map((s: string, i: number) => (
                                <Badge key={i} className="text-[10px] bg-red-100 text-red-700">{s.split(' ')[0]}</Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
