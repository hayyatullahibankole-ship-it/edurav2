import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  Briefcase,
  Crown,
  FileText,
  GraduationCap,
  Library,
  Loader2,
  Newspaper,
  Sparkles,
  Target,
  Ticket,
  Trophy,
  Wallet as WalletIcon,
} from "lucide-react";
import AppShell from "@/components/edura/AppShell";
import { StatTile, ActionTile, ListRow, Panel, EmptyState } from "@/components/edura/tiles";
import UpgradeToCampus from "@/components/edura/UpgradeToCampus";
import OnboardingTour from "@/components/OnboardingTour";
import LoadingAnimation from "@/components/LoadingAnimation";
import { AIAssistant } from "@/components/AIAssistant";
import { FreeAccessBanner } from "@/components/dashboard/FreeAccessBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useWallet } from "@/hooks/useWallet";
import { useStudentStats } from "@/hooks/useStudentStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const naira = (value: number) =>
  `₦${Number(value || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

/**
 * The unified home for exam candidates: one command centre that opens into the
 * two workspaces (CBT practice and educational services).
 */
const Dashboard = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const {
    subscription,
    loading: subscriptionLoading,
    isPremium,
    hasFreePromoAccess,
    freeAccessExpiry,
    freeAccessExpired,
  } = useSubscription();
  const { balance: walletBalance, loading: walletLoading } = useWallet();
  const { stats, recentTests, schoolInfo, loading } = useStudentStats();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  const firstName = userProfile?.first_name || user?.email?.split("@")[0] || "Student";

  const redeemCode = async () => {
    if (!accessCode.trim()) {
      toast.error("Enter your access code");
      return;
    }
    setRedeeming(true);
    try {
      const { data, error } = await supabase.rpc("redeem_promo_coupon", {
        coupon_code: accessCode.trim(),
      });
      if (error) throw error;
      const result = data as { success: boolean; error?: string; message?: string };
      if (result?.success) {
        toast.success(result.message || "Access activated");
        setAccessCode("");
        window.location.reload();
      } else {
        toast.error(result?.error || "Invalid access code");
      }
    } catch (err) {
      console.error("Redeem error", err);
      toast.error("Could not activate that code");
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) return <LoadingAnimation />;

  return (
    <AppShell
      side="cbt"
      title={`Hi ${firstName}`}
      subtitle="Your learning command centre — practice, services and wallet in one place."
      meta={
        <>
          {!subscriptionLoading && (
            <Badge variant={isPremium ? "default" : "secondary"} className="text-[11px]">
              {isPremium ? "Premium" : subscription?.subscription_plans?.name || "Free plan"}
            </Badge>
          )}
          {schoolInfo && (
            <Badge variant="outline" className="text-[11px]">{schoolInfo.name}</Badge>
          )}
        </>
      }
    >
      <OnboardingTour isOpen={showOnboarding} onComplete={() => setShowOnboarding(false)} />

      <div className="space-y-5 animate-fade-in">
        {hasFreePromoAccess && freeAccessExpiry && <FreeAccessBanner expiryDate={freeAccessExpiry} />}
        {freeAccessExpired && freeAccessExpiry && (
          <FreeAccessBanner expiryDate={freeAccessExpiry} isExpired />
        )}

        {/* Access code + upgrade */}
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2">
              <Ticket className="h-4 w-4 text-primary shrink-0" />
              <Input
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && redeemCode()}
                placeholder="Enter access code"
                className="uppercase h-10"
                disabled={redeeming}
              />
              <Button onClick={redeemCode} disabled={redeeming || !accessCode.trim()} className="h-10">
                {redeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate"}
              </Button>
            </div>
            <Button
              variant={isPremium ? "outline" : "default"}
              className="h-10 gap-1.5 sm:w-auto"
              onClick={() => navigate("/payment")}
            >
              <Crown className="h-4 w-4" />
              {isPremium ? "Manage plan" : "Upgrade"}
            </Button>
          </div>
        </div>

        {/* Workspaces */}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/cbt"
            className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GraduationCap className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-base font-semibold">CBT Practice</p>
            <p className="mt-1 text-xs text-muted-foreground">
              JAMB, WAEC, NECO and Post-UTME practice, results and study tools.
            </p>
          </Link>

          <Link
            to="/services"
            className="rounded-2xl border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex items-start justify-between">
              <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-3 text-base font-semibold">Educational Services</p>
            <p className="mt-1 text-xs text-muted-foreground">
              e-PINs, admission processing, scholarships and expert support.
            </p>
          </Link>
        </div>

        {/* Wallet + numbers */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/wallet"
            className="rounded-2xl bg-primary p-5 text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2 lg:col-span-1"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
              Wallet balance
            </span>
            <p className="mt-1.5 text-2xl font-bold">
              {walletLoading ? "..." : naira(walletBalance)}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
              Fund wallet <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link>
          <StatTile label="Tests taken" value={stats.testsTaken} />
          <StatTile label="Average score" value={`${stats.averageScore}%`} />
          <StatTile
            label="Global rank"
            value={stats.rank > 0 ? `#${stats.rank}` : "—"}
            hint={stats.totalStudents ? `of ${stats.totalStudents} students` : undefined}
          />
        </div>

        {/* Admitted upgrade */}
        <div className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">I've been admitted</p>
                <p className="text-xs text-muted-foreground">
                  Move to Edura Campus for academics, projects and opportunities.
                </p>
              </div>
            </div>
            <UpgradeToCampus />
          </div>
        </div>

        {/* Recent results + discover */}
        <div className="grid gap-3 lg:grid-cols-2">
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
                      <p className="text-[11px] text-muted-foreground">{test.date}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{test.score}%</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState>No tests yet — start practicing to see results here.</EmptyState>
            )}
          </Panel>

          <Panel title="Discover">
            <div className="grid gap-2 sm:grid-cols-2">
              <ListRow to="/study-hub" icon={Target} title="Study hub" meta="Planner & materials" />
              <ListRow to="/resources" icon={FileText} title="Past questions" meta="Downloadables" />
              <ListRow to="/ebooks" icon={Library} title="Ebook library" meta="Read online" />
              <ListRow to="/news" icon={Newspaper} title="Education news" meta="Latest updates" />
              <ListRow to="/leaderboard" icon={Trophy} title="Leaderboard" meta="See your standing" />
              <ListRow to="/referral-program" icon={Award} title="Referrals" meta="Earn rewards" />
            </div>
          </Panel>
        </div>
      </div>

      <AIAssistant />
    </AppShell>
  );
};

export default Dashboard;
