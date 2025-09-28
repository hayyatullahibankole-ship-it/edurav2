import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Shield } from 'lucide-react';

interface SecurityAlertsBannerProps {
  criticalIssues: string[];
}

export default function SecurityAlertsBanner({ criticalIssues }: SecurityAlertsBannerProps) {
  if (criticalIssues.length === 0) {
    return (
      <Alert className="bg-green-950 border-green-800 text-green-100">
        <Shield className="h-4 w-4 text-green-400" />
        <AlertDescription>
          All security fixes have been successfully implemented. Your application is now more secure.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="bg-amber-950 border-amber-800 text-amber-100">
      <AlertTriangle className="h-4 w-4 text-amber-400" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium">Manual configuration required to complete security setup:</p>
          <ul className="list-disc pl-4 space-y-1">
            {criticalIssues.map((issue, index) => (
              <li key={index} className="text-sm">{issue}</li>
            ))}
          </ul>
          <p className="text-sm text-amber-200 mt-3">
            Please complete these steps in your Supabase dashboard to ensure full security compliance.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}