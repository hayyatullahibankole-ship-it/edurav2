import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import CampusShell from "@/components/campus/CampusShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator, CalendarDays, ListTodo, Plus, Trash2, Loader2 } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const GRADES_5 = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 } as const;
const GRADES_4 = { A: 4, B: 3, C: 2, D: 1, E: 0.5, F: 0 } as const;
const TASK_KINDS = ["assignment", "test", "exam", "project", "submission"];

type Scale = "5" | "4";

const classForGpa = (gpa: number, scale: Scale) => {
  const pct = gpa / Number(scale);
  if (pct >= 0.9) return "First Class";
  if (pct >= 0.7) return "Second Class Upper";
  if (pct >= 0.5) return "Second Class Lower";
  if (pct >= 0.4) return "Third Class";
  if (pct > 0) return "Pass";
  return "—";
};

const CampusTools = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [scale, setScale] = useState<Scale>("5");

  const [slotOpen, setSlotOpen] = useState(false);
  const [slotForm, setSlotForm] = useState({
    title: "", day_of_week: "1", start_time: "08:00", end_time: "10:00", venue: "", lecturer: "",
  });
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", kind: "assignment", due_date: "", notes: "" });

  useEffect(() => {
    document.title = "Study tools | Edura Campus";
  }, []);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [c, s, t] = await Promise.all([
      supabase.from("campus_courses").select("*").eq("user_id", user.id).order("code"),
      supabase.from("campus_timetable").select("*").eq("user_id", user.id).order("day_of_week").order("start_time"),
      supabase.from("campus_tasks").select("*").eq("user_id", user.id).order("due_date", { ascending: true }),
    ]);
    setCourses(c.data ?? []);
    setSlots(s.data ?? []);
    setTasks(t.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user]);

  /* ---------------- CGPA ---------------- */
  const points = scale === "5" ? GRADES_5 : GRADES_4;

  const setGrade = async (courseId: string, grade: string) => {
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, grade } : c)));
    const { error } = await supabase.from("campus_courses").update({ grade }).eq("id", courseId);
    if (error) toast.error("Could not save grade");
  };

  const gpaFor = (list: any[]) => {
    const graded = list.filter((c) => c.grade && c.grade in points);
    const units = graded.reduce((s, c) => s + (c.units || 0), 0);
    if (!units) return { gpa: 0, units: 0, graded: graded.length };
    const total = graded.reduce((s, c) => s + (points as any)[c.grade] * (c.units || 0), 0);
    return { gpa: total / units, units, graded: graded.length };
  };

  const overall = useMemo(() => gpaFor(courses), [courses, scale]);
  const bySemester = useMemo(() => {
    const groups: Record<string, any[]> = {};
    courses.forEach((c) => {
      const key = `${c.session || "Current session"} · ${c.semester || "First"} semester`;
      (groups[key] ||= []).push(c);
    });
    return Object.entries(groups);
  }, [courses]);

  /* ---------------- Timetable ---------------- */
  const addSlot = async () => {
    if (!user || !slotForm.title.trim()) return toast.error("Give the class a title");
    setSaving(true);
    const { error } = await supabase.from("campus_timetable").insert({
      user_id: user.id,
      title: slotForm.title.trim(),
      day_of_week: Number(slotForm.day_of_week),
      start_time: slotForm.start_time,
      end_time: slotForm.end_time,
      venue: slotForm.venue.trim() || null,
      lecturer: slotForm.lecturer.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Class added");
    setSlotOpen(false);
    setSlotForm({ title: "", day_of_week: "1", start_time: "08:00", end_time: "10:00", venue: "", lecturer: "" });
    load();
  };

  const deleteSlot = async (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
    await supabase.from("campus_timetable").delete().eq("id", id);
  };

  /* ---------------- Tasks ---------------- */
  const addTask = async () => {
    if (!user || !taskForm.title.trim()) return toast.error("Give the task a title");
    setSaving(true);
    const { error } = await supabase.from("campus_tasks").insert({
      user_id: user.id,
      title: taskForm.title.trim(),
      kind: taskForm.kind,
      due_date: taskForm.due_date || null,
      notes: taskForm.notes.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Task added");
    setTaskOpen(false);
    setTaskForm({ title: "", kind: "assignment", due_date: "", notes: "" });
    load();
  };

  const toggleTask = async (task: any) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, is_done: !t.is_done } : t)));
    await supabase.from("campus_tasks").update({ is_done: !task.is_done }).eq("id", task.id);
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("campus_tasks").delete().eq("id", id);
  };

  const openTasks = tasks.filter((t) => !t.is_done);
  const doneTasks = tasks.filter((t) => t.is_done);

  return (
    <CampusShell
      title="Study tools"
      subtitle="CGPA, class timetable and deadlines — all from the courses you already added."
    >
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : (
        <Tabs defaultValue="cgpa" className="space-y-5">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="cgpa" className="gap-1.5"><Calculator className="h-4 w-4" /> CGPA</TabsTrigger>
            <TabsTrigger value="timetable" className="gap-1.5"><CalendarDays className="h-4 w-4" /> Timetable</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5"><ListTodo className="h-4 w-4" /> Deadlines</TabsTrigger>
          </TabsList>

          {/* CGPA */}
          <TabsContent value="cgpa" className="space-y-4">
            <Card>
              <CardContent className="p-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                  <p className="text-4xl font-bold tracking-tight">{overall.gpa.toFixed(2)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {overall.graded} graded course{overall.graded === 1 ? "" : "s"} · {overall.units} units ·{" "}
                    {classForGpa(overall.gpa, scale)}
                  </p>
                </div>
                <div className="w-36">
                  <Label className="text-xs">Grading scale</Label>
                  <Select value={scale} onValueChange={(v) => setScale(v as Scale)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5.0 point</SelectItem>
                      <SelectItem value="4">4.0 point</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {courses.length === 0 ? (
              <Card><CardContent className="p-6 text-sm text-muted-foreground">
                Add your courses in Academics first — grades and units flow into this calculator.
              </CardContent></Card>
            ) : (
              bySemester.map(([label, list]) => {
                const g = gpaFor(list);
                return (
                  <Card key={label}>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{label}</p>
                        <Badge variant="secondary">GPA {g.gpa.toFixed(2)} · {g.units} units</Badge>
                      </div>
                      <ul className="mt-4 space-y-2">
                        {list.map((c) => (
                          <li key={c.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{c.code}</p>
                              <p className="text-xs text-muted-foreground truncate">{c.title}</p>
                            </div>
                            <Badge variant="outline" className="text-[11px] shrink-0">{c.units}u</Badge>
                            <Select value={c.grade ?? ""} onValueChange={(v) => setGrade(c.id, v)}>
                              <SelectTrigger className="w-20 h-9 shrink-0"><SelectValue placeholder="—" /></SelectTrigger>
                              <SelectContent>
                                {Object.keys(points).map((g2) => (
                                  <SelectItem key={g2} value={g2}>{g2}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Timetable */}
          <TabsContent value="timetable" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add class</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add a class</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Course / title</Label>
                      <Input value={slotForm.title} onChange={(e) => setSlotForm({ ...slotForm, title: e.target.value })} placeholder="CSC 201 — Data Structures" />
                    </div>
                    <div>
                      <Label>Day</Label>
                      <Select value={slotForm.day_of_week} onValueChange={(v) => setSlotForm({ ...slotForm, day_of_week: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Starts</Label>
                        <Input type="time" value={slotForm.start_time} onChange={(e) => setSlotForm({ ...slotForm, start_time: e.target.value })} />
                      </div>
                      <div>
                        <Label>Ends</Label>
                        <Input type="time" value={slotForm.end_time} onChange={(e) => setSlotForm({ ...slotForm, end_time: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Venue</Label>
                        <Input value={slotForm.venue} onChange={(e) => setSlotForm({ ...slotForm, venue: e.target.value })} placeholder="LT1" />
                      </div>
                      <div>
                        <Label>Lecturer</Label>
                        <Input value={slotForm.lecturer} onChange={(e) => setSlotForm({ ...slotForm, lecturer: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addSlot} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save class
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {DAYS.map((day, index) => {
                const list = slots.filter((s) => s.day_of_week === index);
                if (index === 0 || index === 6) if (list.length === 0) return null;
                return (
                  <Card key={day}>
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold">{day}</p>
                      {list.length === 0 ? (
                        <p className="mt-3 text-xs text-muted-foreground">No classes.</p>
                      ) : (
                        <ul className="mt-3 space-y-2">
                          {list.map((s) => (
                            <li key={s.id} className="flex items-start gap-2 rounded-lg border p-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate">{s.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {String(s.start_time).slice(0, 5)} – {String(s.end_time).slice(0, 5)}
                                  {s.venue ? ` · ${s.venue}` : ""}
                                </p>
                                {s.lecturer && <p className="text-xs text-muted-foreground truncate">{s.lecturer}</p>}
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => deleteSlot(s.id)} aria-label="Delete class">
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Tasks */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add deadline</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>New deadline</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Title</Label>
                      <Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="GST 201 assignment" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Type</Label>
                        <Select value={taskForm.kind} onValueChange={(v) => setTaskForm({ ...taskForm, kind: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TASK_KINDS.map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Due date</Label>
                        <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label>Notes</Label>
                      <Input value={taskForm.notes} onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addTask} disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold">Open ({openTasks.length})</p>
                {openTasks.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">Nothing pending. Add your next submission.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {openTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 rounded-lg border px-3 py-2">
                        <Checkbox checked={false} onCheckedChange={() => toggleTask(t)} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{t.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {t.kind}{t.due_date ? ` · due ${new Date(t.due_date).toLocaleDateString()}` : ""}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)} aria-label="Delete task">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {doneTasks.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm font-semibold text-muted-foreground">Done ({doneTasks.length})</p>
                  <ul className="mt-3 space-y-2">
                    {doneTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 rounded-lg border px-3 py-2 opacity-70">
                        <Checkbox checked onCheckedChange={() => toggleTask(t)} />
                        <p className="flex-1 text-sm line-through truncate">{t.title}</p>
                        <Button variant="ghost" size="icon" onClick={() => deleteTask(t.id)} aria-label="Delete task">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </CampusShell>
  );
};

export default CampusTools;
