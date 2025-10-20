import { HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { contactSupport } from "@/utils/whatsapp";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const WhatsAppButton = () => {
  const isMobile = useIsMobile();

  const handleClick = () => {
    try {
      contactSupport("General Support", "Hello, I need assistance with Edura platform.");
    } catch (error) {
      toast.error("Unable to open WhatsApp. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleClick}
      className={`fixed z-30 w-14 h-14 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce-slow bg-gradient-to-br from-primary to-secondary p-0 ${
        isMobile ? "bottom-24 right-4" : "bottom-20 right-6"
      }`}
      aria-label="Contact Support"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/50 blur-xl animate-pulse" />
      
      {/* Icon */}
      <HelpCircle className="relative w-7 h-7 text-white" />
    </Button>
  );
};

export default WhatsAppButton;
