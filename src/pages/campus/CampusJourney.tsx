import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAcademicStage } from "@/hooks/useAcademicStage";
import { ACADEMIC_STAGES, STUDY_LEVELS, isCampusStage, type AcademicStage } from "@/lib/academicStages";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CampusJourney = () => {
  const navigate = useNavigate();
  const { stage, institution_name, faculty, department, study_level, matric_number, loading, updateProfile } = useAcademicStage();

  const [selected, setSelected] = useState<AcademicStage | null>(null);
  const [details, setDetails] = useState({ institution_name: "", faculty: "", department: "", study_level: "", matric_number: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = "Academic journey | Edura"; }, []);

  useEffect(() => {
    if (loading) return;
    setSelected((stage as AcademicStage) ?? null);
    setDetails({
      institution_name: institution_name ?? "",
      faculty: faculty ?? "",
      department: department ?? "",
      study_level: study_level ?? "",
      matric_number: matric_number ?? "",
    });
  }, [loading, stage, institution_name, faculty, department, study_level, matric_number]);

  const save = async () => {
    if (!selected) return toast.error("Pick your current stage");
    setSaving(true);
    const { error } = await updateProfile({
      academic_stage: selected,
      institution_name: details.institution_name.trim() || null,
      faculty: details.faculty.trim() || null,
      department: details.department.trim() || null,
      study_level: details.study_level || null,
      matric_number: details.matric_number.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Journey updated");
    navigate(isCampusStage(selected) ? "/campus" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <Button variant="ghost" size="sm" className="gap-1 mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">Your academic journey</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edura grows with you. Tell us where you are and we'll show the right dashboard — exam prep for secondary school and candidates, Edura Campus for higher institution.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ACADEMIC_STAGES.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelected(s.key)}
              className={cn(
                "text-left rounded-xl border p-4 transition-colors",
                selected === s.key ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                </div>
                {selected === s.key && <Check className="h-4 w-4 text-primary shrink-0" />}
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                {s.dashboard === "campus" ? "Edura Campus" : "Exam prep dashboard"}
              </p>
            </button>
          ))}
        </div>

        {isCampusStage(selected) && (
          <Card className="mt-6">
            <CardContent className="p-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Institution</Label>
                <Input value={details.institution_name} onChange={(e) => setDetails({ ...details, institution_name: e.target.value })} placeholder="University of Ibadan" />
              </div>
              <div><Label>Faculty</Label><Input value={details.faculty} onChange={(e) => setDetails({ ...details, faculty: e.target.value })} /></div>
              <div><Label>Department</Label><Input value={details.department} onChange={(e) => setDetails({ ...details, department: e.target.value })} /></div>
              <div>
                <Label>Level</Label>
                <Select value={details.study_level} onValueChange={(v) => setDetails({ ...details, study_level: v })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>{STUDY_LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Matric number</Label><Input value={details.matric_number} onChange={(e) => setDetails({ ...details, matric_number: e.target.value })} /></div>
            </CardContent>
          </Card>
        )}

        <Button className="mt-6 w-full sm:w-auto" onClick={save} disabled={saving || loading}>
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save and continue
        </Button>
      </div>
    </div>
  );
};

export default CampusJourney;
