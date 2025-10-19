import { WifiOff, Wifi } from "lucide-react";
import { useOffline } from "@/hooks/useOffline";
import { Badge } from "@/components/ui/badge";

export const OfflineIndicator = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <Badge 
        variant="destructive" 
        className="flex items-center gap-2 px-4 py-2 shadow-lg"
      >
        <WifiOff className="h-4 w-4 animate-pulse" />
        <span className="font-semibold">Offline Mode</span>
      </Badge>
    </div>
  );
};
