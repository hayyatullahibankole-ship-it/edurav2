import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  code: string | null;
  course_category: string | null;
  default_question_count: number | null;
  description: string | null;
  is_active: boolean | null;
  created_at: string | null;
}

export default function SubjectManager() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    course_category: 'science' as 'science' | 'art' | 'management',
    default_question_count: 40,
    description: '',
    is_active: true,
  });

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');
    if (!error) setSubjects(data || []);
    setLoading(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '', course_category: 'science', default_question_count: 40, description: '', is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({
      name: s.name,
      code: s.code || '',
      course_category: (s.course_category as 'science' | 'art' | 'management') || 'science',
      default_question_count: s.default_question_count || 40,
      description: s.description || '',
      is_active: s.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Subject name is required', variant: 'destructive' });
      return;
    }

    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || null,
      course_category: form.course_category,
      default_question_count: form.default_question_count,
      description: form.description.trim() || null,
      is_active: form.is_active,
    };

    if (editing) {
      const { error } = await supabase.from('subjects').update(payload).eq('id', editing.id);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Updated', description: `${form.name} updated successfully` });
    } else {
      const { error } = await supabase.from('subjects').insert(payload);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }
      toast({ title: 'Created', description: `${form.name} added successfully` });
    }

    setDialogOpen(false);
    fetchSubjects();
  };

  const toggleActive = async (s: Subject) => {
    const { error } = await supabase.from('subjects').update({ is_active: !s.is_active }).eq('id', s.id);
    if (!error) fetchSubjects();
  };

  const handleDelete = async (s: Subject) => {
    if (!confirm(`Delete "${s.name}"? This may affect exams using this subject.`)) return;
    const { error } = await supabase.from('subjects').delete().eq('id', s.id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted', description: `${s.name} removed` });
      fetchSubjects();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Subject Management
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject Name *</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Islamic Studies" />
                </div>
                <div>
                  <Label>Code</Label>
                  <Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. ISS" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select value={form.course_category} onValueChange={(v: 'science' | 'art' | 'management') => setForm(f => ({ ...f, course_category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="art">Art</SelectItem>
                      <SelectItem value="management">Management/Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Question Count</Label>
                  <Input type="number" value={form.default_question_count} onChange={e => setForm(f => ({ ...f, default_question_count: parseInt(e.target.value) || 40 }))} />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                  <Label>Active</Label>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editing ? 'Update Subject' : 'Create Subject'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Code</TableHead>
                  <TableHead className="text-slate-300">Category</TableHead>
                  <TableHead className="text-slate-300">Questions</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map(s => (
                  <TableRow key={s.id} className="border-slate-700">
                    <TableCell className="text-white font-medium">{s.name}</TableCell>
                    <TableCell className="text-slate-300">{s.code || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-slate-300 border-slate-600 capitalize">
                        {s.course_category || 'general'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{s.default_question_count || 40}</TableCell>
                    <TableCell>
                      <Switch checked={s.is_active ?? true} onCheckedChange={() => toggleActive(s)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(s)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {subjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                      No subjects found. Add your first subject above.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
