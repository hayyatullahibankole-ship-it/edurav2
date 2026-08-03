import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, GraduationCap, FileCheck, Award, Building2 } from "lucide-react";

const items = [
  { label: "JAMB e-PIN", icon: GraduationCap },
  { label: "WAEC & NECO", icon: FileCheck },
  { label: "Result Checking", icon: Award },
  { label: "Admissions", icon: Building2 },
];

export const ServicesStrip = () => {
  const navigate = useNavigate();

  return (
    <Card className="border">
      <CardContent className="p-4 space-y-4">
        <button
          onClick={() => navigate("/services")}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h3 className="font-semibold">Educational Services</h3>
            <p className="text-sm text-muted-foreground">
              e-PINs, registrations, results & admission support
            </p>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </button>

        <div className="grid grid-cols-4 gap-2">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate("/services")}
              className="flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary/60"
            >
              <item.icon className="h-5 w-5 text-foreground" />
              <span className="text-center text-[11px] font-medium leading-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesStrip;
