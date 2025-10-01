import { MessageCircle } from "lucide-react";
import { Button } from "./ui/button";
import { contactSupport } from "@/utils/whatsapp";
import { toast } from "sonner";

const WhatsAppButton = () => {
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
      className="fixed bottom-6 right-6 z-50 h-14 px-6 rounded-full shadow-lg hover:scale-105 transition-transform"
      aria-label="Contact Support on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 mr-2" />
      SUPPORT
    </Button>
  );
};

export default WhatsAppButton;
