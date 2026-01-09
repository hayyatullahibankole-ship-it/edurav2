import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InstallAppGate = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-primary/40 bg-primary/5 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-primary" />
          Install EDURA App to Continue
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          To start full CBT practice with correct timing, progress tracking,
          and exam mode, EDURA works best as an app.
        </p>

        <Button
          className="w-full"
          onClick={() => navigate("/install-app")}
        >
          Install EDURA App
        </Button>
      </CardContent>
    </Card>
  );
};

export default InstallAppGate;
