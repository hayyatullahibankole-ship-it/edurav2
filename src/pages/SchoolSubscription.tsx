import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Users, CreditCard, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { createSubscriptionPayment } from "@/utils/paystack";

export default function SchoolSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingSchool, setFetchingSchool] = useState(true);
  const [studentCount, setStudentCount] = useState(50);
  const [pricePerStudent, setPricePerStudent] = useState(300);
  const [totalAmount, setTotalAmount] = useState(15000);
  const [schoolData, setSchoolData] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to continue");
      navigate("/auth");
      return;
    }

    fetchSchoolData();
  }, [user]);

  const fetchSchoolData = async () => {
    setFetchingSchool(true);
    try {
      console.log("Fetching school data for user:", user?.id);
      
      // Ensure user profile exists or create it
      let profileId: string | null = null;
      const { data: existingProfile } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user?.id)
        .maybeSingle();

      if (existingProfile) {
        profileId = existingProfile.id;
      } else {
        const pendingRaw = localStorage.getItem('pendingSchoolRegistration');
        const pending = pendingRaw ? JSON.parse(pendingRaw) : {};
        const fullName = (user as any)?.user_metadata?.full_name || pending.adminFullName || (user?.email?.split('@')[0] ?? 'School Admin');
        const firstName = fullName.split(' ')[0] || fullName;
        const lastName = fullName.split(' ').slice(1).join(' ') || '';

        const { data: insertedProfile, error: userInsertError } = await supabase
          .from('users')
          .insert({
            auth_user_id: user?.id,
            email: user?.email,
            first_name: firstName,
            last_name: lastName,
            phone: pending.adminPhone || null,
          })
          .select('id')
          .single();
        
        if (userInsertError) throw userInsertError;
        profileId = insertedProfile.id;
      }

      // Try fetch school for this profile
      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("admin_user_id", profileId)
        .maybeSingle();

      console.log("School data:", school, "Error:", schoolError);

      if (school) {
        setSchoolData(school);
      } else {
        // Attempt to create school from pending registration data or sensible defaults
        const pendingRaw = localStorage.getItem('pendingSchoolRegistration');
        const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

        // Build fallback details if pending is missing
        const fallbackName = (() => {
          const fullName = (user as any)?.user_metadata?.full_name as string | undefined;
          if (pending?.schoolName) return pending.schoolName;
          if (fullName) return `${fullName.split(' ')[0]}'s School`;
          if (user?.email) return `${user.email.split('@')[0]} School`;
          return 'My School';
        })();

        const slug = (pending?.schoolName || fallbackName)
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { data: newSchool, error: createError } = await (supabase as any)
          .from('schools')
          .insert({
            name: pending?.schoolName || fallbackName,
            slug,
            email: pending?.schoolEmail || user?.email,
            phone: pending?.schoolPhone || null,
            address: pending?.schoolAddress || null,
            state: pending?.state || null,
            admin_user_id: profileId,
            is_active: false,
          })
          .select('*')
          .single();

        if (createError) {
          console.error('Failed to create school (no pending data):', createError);
          toast.error('Could not create school automatically. Please complete the short registration form to proceed.');
          // Stay on this page so user can retry after registration
        } else {
          // The trigger will automatically assign the school_admin role
          setSchoolData(newSchool);
          localStorage.removeItem('pendingSchoolRegistration');
          toast.success('School created. You can now activate your subscription.');
        }
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
      toast.error("Failed to load school data");
    } finally {
      setFetchingSchool(false);
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [studentCount]);

  const calculatePrice = () => {
    // Set pricing to zero for all school subscriptions
    setPricePerStudent(0);
    setTotalAmount(0);
  };

  const handlePayment = async () => {
    console.log("=== HANDLE PAYMENT CLICKED ===");
    console.log("Current school data:", schoolData);
    console.log("Student count:", studentCount);
    console.log("User:", user);
    
    // Ensure we have a school record; if missing, try to create it inline
    if (!schoolData) {
      try {
        const pendingRaw = localStorage.getItem('pendingSchoolRegistration');
        const pending = pendingRaw ? JSON.parse(pendingRaw) : null;

        // Ensure profile exists
        let profileId: string | null = null;
        const { data: existingProfile } = await supabase
          .from("users")
          .select("id")
          .eq("auth_user_id", user?.id)
          .maybeSingle();
        if (existingProfile) profileId = existingProfile.id;
        else {
          const fullName = (user as any)?.user_metadata?.full_name || pending?.adminFullName || (user?.email?.split('@')[0] ?? 'School Admin');
          const firstName = fullName.split(' ')[0] || fullName;
          const lastName = fullName.split(' ').slice(1).join(' ') || '';
          const { data: insertedProfile } = await supabase
            .from('users')
            .insert({
              auth_user_id: user?.id,
              email: user?.email,
              first_name: firstName,
              last_name: lastName,
              phone: pending?.adminPhone || null,
            })
            .select('id')
            .single();
          profileId = insertedProfile?.id ?? null;
        }

        if (!profileId) {
          toast.error('Could not create admin profile. Please try again.');
          return;
        }

        const fallbackName = (() => {
          const fullName = (user as any)?.user_metadata?.full_name as string | undefined;
          if (pending?.schoolName) return pending.schoolName;
          if (fullName) return `${fullName.split(' ')[0]}'s School`;
          if (user?.email) return `${user.email.split('@')[0]} School`;
          return 'My School';
        })();
        const slug = (pending?.schoolName || fallbackName).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const { data: newSchool, error: createError } = await (supabase as any)
          .from('schools')
          .insert({
            name: pending?.schoolName || fallbackName,
            slug,
            email: pending?.schoolEmail || user?.email,
            phone: pending?.schoolPhone || null,
            address: pending?.schoolAddress || null,
            state: pending?.state || null,
            admin_user_id: profileId,
            is_active: false,
          })
          .select('*')
          .single();

        if (createError || !newSchool) {
          toast.error('Could not create school automatically. Please complete the school registration.');
          return;
        }
        setSchoolData(newSchool);
      } catch (e) {
        console.error('Inline school creation failed', e);
        toast.error('Failed to prepare school data');
        return;
      }
    }

    if (studentCount > 500) {
      toast.error("For 501+ students, please contact support");
      return;
    }

    if (studentCount < 1) {
      toast.error("Please enter a valid number of students");
      return;
    }

    setLoading(true);
    console.log("Starting subscription activation...");
    console.log("School data being used:", schoolData);

    try {
      // Prefer edge function to avoid RLS issues
      const { data: activateRes, error: activateErr } = await supabase.functions.invoke('activate-free-subscription', {
        body: {
          student_seats: studentCount,
          school: schoolData || null,
          pending: JSON.parse(localStorage.getItem('pendingSchoolRegistration') || 'null')
        },
      });
      if (activateErr) {
        console.warn('Edge activation failed, falling back to direct DB:', activateErr);
      } else if (activateRes?.success) {
        toast.success('School subscription activated successfully!');
        setTimeout(() => navigate('/school-dashboard'), 1000);
        return;
      }
      // Create and activate free subscription
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year free subscription

      console.log("Inserting subscription with data:", {
        school_id: schoolData.id,
        student_seats: studentCount,
        admin_user_id: schoolData.admin_user_id,
      });

      const { data: subscription, error: subError } = await (supabase as any)
        .from("school_subscriptions")
        .insert({
          school_id: schoolData.id,
          student_seats: studentCount,
          price_per_student: 0,
          total_amount: 0,
          status: "ACTIVE",
          admin_user_id: user?.id, // FK references auth.users(id)
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          auto_renew: false,
        })
        .select()
        .single();

      console.log("Subscription insert result:", { subscription, subError });
      if (subError) throw subError;

      // Activate the school
      const { error: activationError } = await supabase
        .from('schools')
        .update({ is_active: true })
        .eq('id', schoolData.id);

      if (activationError) throw activationError;

      toast.success("School subscription activated successfully!");
      
      // Redirect to school dashboard
      setTimeout(() => {
        navigate("/school-dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Activation error:", error);
      toast.error(error.message || "Failed to activate subscription");
    } finally {
      setLoading(false);
    }
  };

  if (fetchingSchool) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading school information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CreditCard className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Activate Your Subscription</h1>
          <p className="text-muted-foreground">
            Choose the number of students and complete payment
          </p>
        </div>

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Edura subscriptions are based on the number of students you want to register. 
            The more students you add, the lower the cost per student.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              Select the number of students to get started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="studentCount">Number of Students to Register</Label>
              <div className="relative mt-2">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentCount"
                  type="number"
                  min="1"
                  max="1000"
                  className="pl-10"
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            {/* Pricing Table */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold mb-3">Pricing</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>All students</span>
                  <span className="font-medium text-primary">FREE</span>
                </div>
              </div>
            </div>

            {/* Calculation Display */}
            {studentCount > 0 && (
              <div className="bg-primary/10 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-semibold text-lg">{studentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price per student:</span>
                  <span className="font-semibold text-lg text-primary">FREE</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">FREE</span>
                  </div>
                </div>
              </div>
            )}

            {studentCount > 500 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For subscriptions with 501+ students, please contact our support team for custom pricing and enterprise features.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePayment}
              disabled={loading || studentCount < 1}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Activate Free Subscription
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our subscription terms and conditions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}