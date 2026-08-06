import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { renderCampusMarkdown } from "@/lib/campusAI";
import { toast } from "sonner";

interface AIOutputProps {
  text: string;
  loading: boolean;
  placeholder?: string;
  actions?: React.ReactNode;
}

/** Shared renderer for every Campus AI answer: markdown + maths, copy, actions. */
export const AIOutput = ({ text, loading, placeholder, actions }: AIOutputProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  if (!text && !loading) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <Sparkles className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {placeholder || "Your AI answer will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "Writing…" : "Answer"}
        </span>
        <div className="flex items-center gap-1.5">
          {actions}
          {!!text && (
            <Button size="sm" variant="ghost" className="h-8 gap-1.5 px-2" onClick={copy}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline text-xs">Copy</span>
            </Button>
          )}
        </div>
      </div>
      <div
        className="prose-none max-w-none px-4 py-4 text-sm leading-relaxed [overflow-wrap:anywhere]"
        dangerouslySetInnerHTML={{ __html: renderCampusMarkdown(text || "…") }}
      />
    </div>
  );
};

export default AIOutput;
