import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Floating launcher that opens the full AI Tutor page.
 * Hidden on the tutor page itself and during exams.
 */
export const AIAssistant = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const path = location.pathname;
  const hidden =
    path.startsWith("/ai-tutor") ||
    path.startsWith("/exam") ||
    path.startsWith("/mock-exam") ||
    path.includes("/attempt");

  if (hidden) return null;

  return (
    <button
      onClick={() => navigate("/ai-tutor")}
      aria-label="Open AI Tutor"
      className={`fixed z-50 flex items-center gap-2.5 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 ${
        isMobile ? "bottom-24 right-5" : "bottom-8 right-8"
      }`}
    >
      <GraduationCap className="h-5 w-5" strokeWidth={2.4} />
      {!isMobile && (
        <span className="flex flex-col items-start leading-none">
          <span className="text-sm font-bold">AI Tutor</span>
          <span className="text-[10px] opacity-80">Ask me anything</span>
        </span>
      )}
    </button>
  );
};

export default AIAssistant;
