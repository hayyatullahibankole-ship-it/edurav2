import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  GraduationCap,
  Wallet,
  Building2,
  Trophy,
  Bot,
  FolderOpen,
  BookOpen,
  MessageSquare,
  Sword,
  Newspaper,
  Library,
  Calendar,
} from "lucide-react";

interface ExploreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const groups: {
  title: string;
  items: { label: string; description: string; icon: React.ElementType; path: string }[];
}[] = [
  {
    title: "Services",
    items: [
      {
        label: "Educational Services",
        description: "e-PINs, registrations, results",
        icon: GraduationCap,
        path: "/services",
      },
      {
        label: "Admissions",
        description: "Post-UTME & admission support",
        icon: Building2,
        path: "/services",
      },
      {
        label: "Wallet",
        description: "Fund, pay & earn rewards",
        icon: Wallet,
        path: "/referral-program",
      },
    ],
  },
  {
    title: "Learn",
    items: [
      { label: "Study Hub", description: "Lessons & topics", icon: BookOpen, path: "/study-hub" },
      { label: "Resources", description: "Past questions & books", icon: FolderOpen, path: "/resources" },
      { label: "Ebook Library", description: "Read exclusive books", icon: Library, path: "/ebooks" },
      { label: "AI Assistant", description: "Ask anything, get answers", icon: Bot, path: "/study-hub" },
    ],
  },
  {
    title: "Community & Growth",
    items: [
      { label: "Challenge Arena", description: "Compete with students", icon: Sword, path: "/challenge-arena" },
      { label: "Forum", description: "Ask & discuss", icon: MessageSquare, path: "/forum" },
      { label: "Campus Hub", description: "News & opportunities", icon: Newspaper, path: "/campus-hub" },
      { label: "Events", description: "Workshops & seminars", icon: Calendar, path: "/akboy/events" },
      { label: "Performance", description: "Your analytics report", icon: Trophy, path: "/performance-report" },
    ],
  },
];

export const ExploreSheet = ({ open, onOpenChange }: ExploreSheetProps) => {
  const navigate = useNavigate();

  const go = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] overflow-y-auto rounded-t-3xl p-0">
        <SheetHeader className="border-b p-6 text-left">
          <SheetTitle className="text-2xl font-bold">Explore</SheetTitle>
          <SheetDescription>Everything EDURA offers, in one place</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {groups.map((group) => (
            <section key={group.title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => go(item.path)}
                    className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors active:scale-[0.98] hover:border-primary/60"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <item.icon className="h-5 w-5 text-foreground" />
                    </span>
                    <span className="text-sm font-semibold leading-tight">{item.label}</span>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {item.description}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExploreSheet;
