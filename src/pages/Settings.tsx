import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "@/components/edura/AppShell";
import ProfileSettings from "@/components/ProfileSettings";
import AccountSettings from "@/components/AccountSettings";
import UpgradeToCampus from "@/components/edura/UpgradeToCampus";
import { DashboardThemeMenu } from "@/components/DashboardThemeMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/edura/tiles";
import { useAcademicStage } from "@/hooks/useAcademicStage";
import { stageLabel } from "@/lib/academicStages";

/**
 * One settings surface for every student, reached from the top-bar avatar.
 * Sections: profile, academic journey, appearance and account/security.
 */
const Settings = () => {
  const navigate = useNavigate();
  const { stage, isCampus, institution_name, department, study_level, loading } = useAcademicStage();

  // Deep links like /settings#journey scroll to the matching section.
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading]);

  return (
    <AppShell
      side={isCampus ? "campus" : "cbt"}
      title="Settings"
      subtitle="Manage your profile, journey and account"
    >
      <div className="space-y-6">
        <section id="profile" className="scroll-mt-24">
          <ProfileSettings />
        </section>

        <section id="journey" className="scroll-mt-24">
          <Panel title="Academic journey">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{stageLabel(stage) || "Not set"}</Badge>
              {institution_name && <Badge variant="outline">{institution_name}</Badge>}
              {department && <Badge variant="outline">{department}</Badge>}
              {study_level && <Badge variant="outline">{study_level} Level</Badge>}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {isCampus
                ? "You're on Edura Campus. Update your institution details any time."
                : "Got admitted? Move to Edura Campus and unlock academics, projects and opportunities."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {isCampus ? (
                <Button variant="outline" size="sm" onClick={() => navigate("/campus/journey")}>
                  Update journey details
                </Button>
              ) : (
                <UpgradeToCampus />
              )}
            </div>
          </Panel>
        </section>

        <section id="appearance" className="scroll-mt-24">
          <Panel title="Appearance">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Choose light, dark or match your device. Applies to your dashboard only.
              </p>
              <DashboardThemeMenu />
            </div>
          </Panel>
        </section>

        <section id="security" className="scroll-mt-24">
          <AccountSettings />
        </section>
      </div>
    </AppShell>
  );
};

export default Settings;
