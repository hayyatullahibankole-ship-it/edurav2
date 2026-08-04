import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAcademicStage } from "@/hooks/useAcademicStage";
import { STUDY_LEVELS } from "@/lib/academicStages";

/**
 * The single bridge between the candidate world (CBT / Services) and Edura Campus.
 * Shown to WAEC / JAMB candidates who have gained admission.
 */
export const UpgradeToCampus = ({ variant = "outline" as const }) => {
  const { stage, isCampus, updateProfile } = useAcademicStage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    institution_name: "",
    faculty: "",
    department: "",
    study_level: "",
    matric_number: "",
  });

  if (isCampus || !stage) return null;

  const submit = async () => {
    if (!form.institution_name.trim()) return toast.error("Enter your institution");
    setSaving(true);
    const { error } = await updateProfile({
      academic_stage: "undergraduate",
      institution_name: form.institution_name.trim(),
      faculty: form.faculty.trim() || null,
      department: form.department.trim() || null,
      study_level: form.study_level || null,
      matric_number: form.matric_number.trim() || null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome to Edura Campus 🎓");
    navigate("/campus", { replace: true });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className="gap-2">
          <GraduationCap className="h-4 w-4" /> I've been admitted
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade to Edura Campus</DialogTitle>
          <DialogDescription>
            Congratulations. Tell us where you got in and we'll move your account to Campus — courses, projects,
            study tools and opportunities.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <Label>Institution</Label>
            <Input
              value={form.institution_name}
              onChange={(e) => setForm({ ...form, institution_name: e.target.value })}
              placeholder="University of Ibadan"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Faculty</Label>
              <Input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} />
            </div>
            <div>
              <Label>Department</Label>
              <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Level</Label>
              <Select value={form.study_level} onValueChange={(v) => setForm({ ...form, study_level: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {STUDY_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Matric number</Label>
              <Input
                value={form.matric_number}
                onChange={(e) => setForm({ ...form, matric_number: e.target.value })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={saving} className="w-full sm:w-auto">
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Move me to Campus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeToCampus;
