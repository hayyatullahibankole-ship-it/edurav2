import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

// Simple CSV parser for demo
function parseCSV(csv: string) {
  const [header, ...rows] = csv.trim().split('\n').map(row => row.split(','));
  return rows.map(row => Object.fromEntries(row.map((cell, i) => [header[i], cell])));
}

export default function ResultManager() {
  const [csv, setCsv] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpload = async () => {
    setUploading(true);
    setMessage('');
    try {
      const results = parseCSV(csv);
      // TODO: Replace with actual API call to upload results
      // Example: await supabase.from('results').insert(results);
      setMessage(`Uploaded ${results.length} results!`);
    } catch (e) {
      setMessage('Failed to upload results.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 max-w-xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Upload Student Results (CSV)</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="csv-upload">Paste CSV Data</Label>
        <textarea
          id="csv-upload"
          rows={8}
          value={csv}
          onChange={e => setCsv(e.target.value)}
          placeholder="student_id,subject,score\n1,Mathematics,85\n1,English,78\n2,Mathematics,90"
          className="mb-4 w-full rounded border border-slate-600 bg-slate-900 text-white p-2"
        />
        <Button onClick={handleUpload} disabled={uploading || !csv}>
          {uploading ? 'Uploading...' : 'Upload Results'}
        </Button>
        {message && <div className="mt-2 text-green-400">{message}</div>}
      </CardContent>
    </Card>
  );
}
