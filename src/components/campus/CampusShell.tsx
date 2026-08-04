import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import AppShell from "@/components/edura/AppShell";
import { useAcademicStage } from "@/hooks/useAcademicStage";
import { stageLabel } from "@/lib/academicStages";

interface CampusShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const CampusShell = ({ title, subtitle, action, children }: CampusShellProps) => {
  const { stage, department, study_level } = useAcademicStage();

  return (
    <AppShell
      side="campus"
      title={title}
      subtitle={subtitle}
      action={action}
      meta={
        <>
          <Badge variant="secondary" className="text-[11px]">{stageLabel(stage)}</Badge>
          {department && <Badge variant="outline" className="text-[11px]">{department}</Badge>}
          {study_level && <Badge variant="outline" className="text-[11px]">{study_level} Level</Badge>}
        </>
      }
    >
      {children}
    </AppShell>
  );
};

export default CampusShell;
