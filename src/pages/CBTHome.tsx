import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Bot,
  FileText,
  MessageSquare,
  Sword,
  Target,
  Trophy,
} from "lucide-react";
import AppShell from "@/components/edura/AppShell";
import { StatTile, ListRow, Panel, EmptyState } from "@/components/edura/tiles";
import ScheduleTestModal from "@/components/ScheduleTestModal";
import SchoolAvailableExams from "@/components/school/SchoolAvailableExams";
import MockResultChecker from "@/components/MockResultChecker";
import { InstallRequiredModal } from "@/components/InstallRequiredModal";
import { Button } from "@/components/ui/button";
import { useStudentStats } from "@/hooks/useStudentStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInstalledApp } from "@/hooks/useInstalledApp";

const EXAM_TYPES = [
  { type: "jamb" as const, label: "JAMB", subtitle: "UTME practice", letter: "J" },
  { type: "waec" as const, label: "WAEC", subtitle: "SSCE practice", letter: "W" },
  { type: "neco" as const, label: "NECO", subtitle: "Senior secondary", letter: "N" },
  { type: "post-utme" as const, label: "POST-UTME", subtitle: "University practice", letter: "P" },
];

/**
 * The dedicated CBT workspace: everything about practising and tracking exams.
 */
const CBTHome = () => {
  const { stats, recentTests, subjectProgress, loading } = useStudentStats();
  const isMobile = useIsMobile();
  const { isInstalledApp } = useInstalledApp();
  const isMobileBrowser = isMobile && !isInstalledApp;

  const [showMockResult, setShowMockResult] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [blockedFeature, setBlockedFeature] = useState("");

  if (showMockResult) {
    return (
      <AppShell side="cbt" title="Mock result checker" subtitle="Check your official mock results">
        <div className="space-y-4">
          <Button variant="outline" onClick={() => setShowMockResult(false)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to CBT
          </Button>
          <MockResultChecker />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      side="cbt"
      title="CBT Practice"
      subtitle="Pick an exam, practise under real conditions and track your progress."
      action={
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowMockResult(true)}>
          <Award className="h-4 w-4" /> Mock result
        </Button>
      }
    >
      <div className="space-y-5">
        <Panel title="Start a practice test">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {EXAM_TYPES.map((exam) => {
              const inner = (
                <div className="w-full rounded-xl border bg-background p-4 text-center transition-colors hover:border-primary">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                    {exam.letter}
                  </div>
                  <span className="block text-sm font-semibold">{exam.label}</span>
                  <span className="text-[10px] uppercase text-muted-foreground">{exam.subtitle}</span>
                </div>
              );
              return isMobileBrowser ? (
                <button
                  key={exam.type}
                  onClick={() => {
                    setBlockedFeature(`${exam.label} Practice`);
                    setShowInstallModal(true);
                  }}
                >
                  {inner}
                </button>
              ) : (
                <ScheduleTestModal key={exam.type} defaultExamType={exam.type}>
                  <button className="w-full">{inner}</button>
                </ScheduleTestModal>
              );
            })}
          </div>
        </Panel>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile label="Tests taken" value={loading ? "..." : stats.testsTaken} />
          <StatTile label="Average score" value={loading ? "..." : `${stats.averageScore}%`} />
          <StatTile label="Study hours" value={loading ? "..." : `${stats.studyHours}h`} />
          <StatTile
            label="Global rank"
            value={loading ? "..." : stats.rank > 0 ? `#${stats.rank}` : "—"}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Subject progress">
            {loading ? (
              <EmptyState>Loading…</EmptyState>
            ) : subjectProgress.length ? (
              <div className="space-y-4">
                {subjectProgress.slice(0, 6).map((subject) => (
                  <div key={subject.subject}>
                    <div className="mb-1.5 flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">{subject.subject}</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>Complete tests to track your subject progress.</EmptyState>
            )}
          </Panel>

          <Panel
            title="Recent results"
            action={
              <Link to="/performance-report" className="text-xs font-semibold text-primary hover:underline">
                View all
              </Link>
            }
          >
            {recentTests.length ? (
              <div className="space-y-2">
                {recentTests.map((test) => (
                  <Link
                    key={test.attemptId}
                    to={`/results?attempt=${test.attemptId}`}
                    className="flex items-center justify-between rounded-xl border px-3.5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{test.subject}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {test.date} · {test.duration}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary">{test.score}%</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState>No results yet — take your first test.</EmptyState>
            )}
          </Panel>
        </div>

        <Panel title="School exams">
          <SchoolAvailableExams />
        </Panel>

        <Panel title="Practice tools">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <ListRow to="/study-hub" icon={Target} title="Study hub" meta="Plan your sessions" />
            <ListRow to="/resources" icon={FileText} title="Past questions" meta="Browse by exam" />
            <ListRow to="/battle" icon={Sword} title="Battle mode" meta="Challenge a friend" />
            <ListRow to="/forum" icon={MessageSquare} title="Forum" meta="Ask and answer" />
            <ListRow to="/ai-tutor" icon={Bot} title="AI tutor" meta="Instant explanations" />
            <ListRow to="/leaderboard" icon={Trophy} title="Leaderboard" meta="Compare scores" />
          </div>
        </Panel>
      </div>

      <InstallRequiredModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
        featureName={blockedFeature}
      />
    </AppShell>
  );
};

export default CBTHome;
