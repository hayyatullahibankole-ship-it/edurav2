import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Trash2, Edit, KeyRound, Users, ArrowLeft, Copy } from "lucide-react";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export default function EbooksManager() {
  const { toast } = useToast();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", slug: "", author: "AKBOY", description: "", cover_url: "", is_published: false });

  const fetchBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("ebooks").select("*").order("created_at", { ascending: false });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setBooks(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBooks(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, slug: form.slug || slugify(form.title) };
    const { error } = editing
      ? await supabase.from("ebooks").update(payload).eq("id", editing.id)
      : await supabase.from("ebooks").insert([payload]);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Book updated" : "Book created" });
    setDialogOpen(false);
    setEditing(null);
    setForm({ title: "", slug: "", author: "AKBOY", description: "", cover_url: "", is_published: false });
    fetchBooks();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this book and all its chapters?")) return;
    const { error } = await supabase.from("ebooks").delete().eq("id", id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Book deleted" });
    if (selected?.id === id) setSelected(null);
    fetchBooks();
  };

  if (selected) return <BookDetail book={selected} onBack={() => { setSelected(null); fetchBooks(); }} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Ebooks</h2>
          <p className="text-sm text-muted-foreground">Publish read-only books and control who can read them.</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ title: "", slug: "", author: "AKBOY", description: "", cover_url: "", is_published: false }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Book
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : books.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">
          <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-50" />
          No books yet.
        </Card>
      ) : (
        <div className="grid gap-3">
          {books.map((b) => (
            <Card key={b.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                {b.cover_url && <img src={b.cover_url} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{b.title}</p>
                  <Badge variant={b.is_published ? "default" : "secondary"}>{b.is_published ? "Published" : "Draft"}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">/{b.slug} · by {b.author}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelected(b)}>Manage</Button>
                <Button size="sm" variant="outline" onClick={() => { setEditing(b); setForm({ title: b.title, slug: b.slug, author: b.author, description: b.description || "", cover_url: b.cover_url || "", is_published: b.is_published }); setDialogOpen(true); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Book" : "New Book"}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-3">
            <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div><Label>URL slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="auto-generated" /></div>
            <div><Label>Author</Label><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div><Label>Cover image URL</Label><Input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4" />
              Published (visible in library)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookDetail({ book, onBack }: { book: any; onBack: () => void }) {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<any[]>([]);
  const [codes, setCodes] = useState<any[]>([]);
  const [readers, setReaders] = useState<any[]>([]);
  const [chOpen, setChOpen] = useState(false);
  const [chEdit, setChEdit] = useState<any>(null);
  const [chForm, setChForm] = useState({ chapter_number: 1, title: "", content: "", is_preview: false });
  const [codeForm, setCodeForm] = useState({ code: "", max_uses: 1 });

  const load = async () => {
    const [c, k, a] = await Promise.all([
      supabase.from("ebook_chapters").select("*").eq("ebook_id", book.id).order("chapter_number"),
      supabase.from("ebook_access_codes").select("*").eq("ebook_id", book.id).order("created_at", { ascending: false }),
      supabase.from("ebook_access").select("*").eq("ebook_id", book.id).order("created_at", { ascending: false }),
    ]);
    setChapters(c.data || []);
    setCodes(k.data || []);
    setReaders(a.data || []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [book.id]);

  const saveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...chForm, ebook_id: book.id };
    const { error } = chEdit
      ? await supabase.from("ebook_chapters").update(payload).eq("id", chEdit.id)
      : await supabase.from("ebook_chapters").insert([payload]);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: chEdit ? "Chapter updated" : "Chapter added" });
    setChOpen(false); setChEdit(null);
    load();
  };

  const deleteChapter = async (id: string) => {
    if (!confirm("Delete this chapter?")) return;
    await supabase.from("ebook_chapters").delete().eq("id", id);
    load();
  };

  const createCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = (codeForm.code || Math.random().toString(36).slice(2, 8)).toUpperCase();
    const { error } = await supabase.from("ebook_access_codes").insert([{ ebook_id: book.id, code, max_uses: codeForm.max_uses }]);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Access code created", description: code });
    setCodeForm({ code: "", max_uses: 1 });
    load();
  };

  const revoke = async (id: string) => {
    await supabase.from("ebook_access").delete().eq("id", id);
    toast({ title: "Access revoked" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
        <h2 className="text-xl font-semibold">{book.title}</h2>
      </div>

      {/* Chapters */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center gap-2"><BookOpen className="w-4 h-4" /> Chapters ({chapters.length})</h3>
          <Button size="sm" onClick={() => { setChEdit(null); setChForm({ chapter_number: chapters.length + 1, title: "", content: "", is_preview: false }); setChOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add chapter
          </Button>
        </div>
        <div className="divide-y">
          {chapters.map((c) => (
            <div key={c.id} className="py-2 flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-8">{c.chapter_number}</span>
              <span className="flex-1 text-sm truncate">{c.title}</span>
              {c.is_preview && <Badge variant="secondary">Free preview</Badge>}
              <Button size="sm" variant="outline" onClick={() => { setChEdit(c); setChForm({ chapter_number: c.chapter_number, title: c.title, content: c.content, is_preview: c.is_preview }); setChOpen(true); }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteChapter(c.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
          {chapters.length === 0 && <p className="text-sm text-muted-foreground py-3">No chapters yet.</p>}
        </div>
      </Card>

      {/* Access codes */}
      <Card className="p-5 space-y-4">
        <h3 className="font-medium flex items-center gap-2"><KeyRound className="w-4 h-4" /> Access codes</h3>
        <form onSubmit={createCode} className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Custom code (optional)" value={codeForm.code} onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })} />
          <Input type="number" min={1} className="sm:w-32" value={codeForm.max_uses} onChange={(e) => setCodeForm({ ...codeForm, max_uses: parseInt(e.target.value) || 1 })} />
          <Button type="submit">Generate</Button>
        </form>
        <div className="divide-y">
          {codes.map((k) => (
            <div key={k.id} className="py-2 flex items-center gap-3 text-sm">
              <code className="font-mono font-semibold">{k.code}</code>
              <span className="text-muted-foreground">{k.used_count}/{k.max_uses} used</span>
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(k.code); toast({ title: "Copied" }); }}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="destructive" className="ml-auto" onClick={async () => { await supabase.from("ebook_access_codes").delete().eq("id", k.id); load(); }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {codes.length === 0 && <p className="text-sm text-muted-foreground py-3">No codes yet.</p>}
        </div>
      </Card>

      {/* Readers */}
      <Card className="p-5 space-y-3">
        <h3 className="font-medium flex items-center gap-2"><Users className="w-4 h-4" /> Readers with access ({readers.length})</h3>
        <div className="divide-y">
          {readers.map((r) => (
            <div key={r.id} className="py-2 flex items-center gap-3 text-sm">
              <code className="font-mono text-xs truncate">{r.user_id}</code>
              <Badge variant="secondary">{r.source}</Badge>
              <Button size="sm" variant="destructive" className="ml-auto" onClick={() => revoke(r.id)}>Revoke</Button>
            </div>
          ))}
          {readers.length === 0 && <p className="text-sm text-muted-foreground py-2">Nobody has access yet.</p>}
        </div>
      </Card>

      <Dialog open={chOpen} onOpenChange={setChOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{chEdit ? "Edit Chapter" : "Add Chapter"}</DialogTitle></DialogHeader>
          <form onSubmit={saveChapter} className="space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div><Label>No.</Label><Input type="number" min={1} value={chForm.chapter_number} onChange={(e) => setChForm({ ...chForm, chapter_number: parseInt(e.target.value) || 1 })} /></div>
              <div className="col-span-3"><Label>Title *</Label><Input value={chForm.title} onChange={(e) => setChForm({ ...chForm, title: e.target.value })} required /></div>
            </div>
            <div><Label>Content *</Label><Textarea rows={16} value={chForm.content} onChange={(e) => setChForm({ ...chForm, content: e.target.value })} required /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={chForm.is_preview} onChange={(e) => setChForm({ ...chForm, is_preview: e.target.checked })} className="w-4 h-4" />
              Free preview (readable without access)
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setChOpen(false)}>Cancel</Button>
              <Button type="submit">{chEdit ? "Update" : "Add"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
