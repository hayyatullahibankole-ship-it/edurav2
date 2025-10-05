import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

interface DbQuestion {
  id: string;
  question_text: string;
  options: any;
  correct_answer: any;
}

function toLetter(idx: number | null | undefined) {
  if (typeof idx === 'number' && idx >= 0 && idx <= 25) return String.fromCharCode(65 + idx);
  return '';
}

function quoteCSV(v: string) {
  const s = (v ?? '').replace(/"/g, '""');
  return `"${s}"`;
}

export default function AnswerCSVManager() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<{ total?: number; updated?: number } | null>(null);

  const handleExportTemplate = () => {
    const header = 'id,correct_answer_letter\n';
    const blob = new Blob([header], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answers_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportQuestions = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('id,question_text,options,correct_answer')
        .eq('is_active', true)
        .limit(5000);

      if (error) throw error;
      const questions = (data || []) as DbQuestion[];

      const header = [
        'id',
        'question_text_preview',
        'option_a',
        'option_b',
        'option_c',
        'option_d',
        'current_correct_letter',
        'correct_answer_letter',
      ].join(',');

      const rows = questions.map((q) => {
        const opts = Array.isArray(q.options) ? q.options : [];
        const a = opts[0] ?? '';
        const b = opts[1] ?? '';
        const c = opts[2] ?? '';
        const d = opts[3] ?? '';
        const preview = (q.question_text || '').toString().slice(0, 120);
        const curr = typeof q.correct_answer === 'number' ? toLetter(q.correct_answer) : '';
        return [
          quoteCSV(q.id),
          quoteCSV(preview),
          quoteCSV(String(a)),
          quoteCSV(String(b)),
          quoteCSV(String(c)),
          quoteCSV(String(d)),
          quoteCSV(curr),
          quoteCSV(''),
        ].join(',');
      });

      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'questions_for_answer_update.csv';
      a.click();
      URL.revokeObjectURL(url);
      setStats({ total: questions.length, updated: 0 });
      toast({ title: 'Export ready', description: `Exported ${questions.length} questions` });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Export failed', description: e.message || 'Unable to export', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const parseCSVSimple = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [] as Array<Record<string, string>>;
    const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: Array<Record<string, string>> = [];
    for (let i = 1; i < lines.length; i++) {
      const raw = lines[i];
      // Very simple CSV splitter that respects quotes for our simple two-column template
      const cols: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let k = 0; k < raw.length; k++) {
        const ch = raw[k];
        if (ch === '"') {
          if (inQuotes && raw[k + 1] === '"') {
            cur += '"';
            k++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          cols.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      cols.push(cur);
      const obj: Record<string, string> = {};
      header.forEach((h, idx) => (obj[h] = (cols[idx] ?? '').trim().replace(/^"|"$/g, '')));
      rows.push(obj);
    }
    return rows;
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCSVSimple(text);
      // Expect at least id and correct_answer_letter columns
      const hasId = rows.length > 0 && Object.prototype.hasOwnProperty.call(rows[0], 'id');
      const hasLetter = rows.length > 0 && Object.prototype.hasOwnProperty.call(rows[0], 'correct_answer_letter');
      if (!hasId || !hasLetter) {
        throw new Error('CSV must have columns: id, correct_answer_letter');
      }

      let updated = 0;
      for (const r of rows) {
        const id = (r['id'] || '').trim();
        const letterRaw = (r['correct_answer_letter'] || '').trim().toUpperCase();
        if (!id || !/^[A-Z]$/.test(letterRaw)) continue;
        const idx = letterRaw.charCodeAt(0) - 65; // A -> 0
        const { error } = await supabase.from('questions').update({ correct_answer: idx }).eq('id', id);
        if (!error) updated++;
      }

      setStats({ updated });
      toast({ title: 'Import complete', description: `Updated ${updated} questions` });
      if (fileRef.current) fileRef.current.value = '';
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Import failed', description: e.message || 'Unable to import', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Answer Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Use this to fix answers without original files:
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>Export questions to CSV, share with a helper to fill Correct Answer Letter.</li>
              <li>Only two columns are required on import: id, correct_answer_letter.</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExportTemplate} variant="secondary">
            <FileText className="h-4 w-4 mr-2" />
            Download Empty Template
          </Button>
          <Button onClick={handleExportQuestions} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {exporting ? 'Preparing…' : 'Export Questions CSV'}
          </Button>
          <div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {importing ? 'Importing…' : 'Import Corrected CSV'}
            </Button>
          </div>
        </div>

        {stats && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Updated: {stats.updated ?? 0}</span>
            {typeof stats.total === 'number' && (
              <Badge variant="outline" className="ml-2">Total exported: {stats.total}</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
