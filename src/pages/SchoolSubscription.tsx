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
import { verifyPaymentManually } from "@/utils/manualPaymentVerification";
export default function SchoolSubscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingSchool, setFetchingSchool] = useState(true);
  const [studentCount, setStudentCount] = useState(50);
  const [pricePerStudent, setPricePerStudent] = useState(1000);
  const [totalAmount, setTotalAmount] = useState(1000);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyRef, setVerifyRef] = useState("");
  const [lastRef, setLastRef] = useState<string | null>(null);
  useEffect(() => {
    if (!user?.id) {
      toast.error("Please log in to continue");
      navigate("/auth");
      return;
    }

    // Only fetch if we don't have school data yet
    if (!schoolData) {
      fetchSchoolData();
    }
  }, [user?.id]); // Only re-run when user ID actually changes

  // Load Paystack inline script so the subscribe button can open the payment modal
  useEffect(() => {
    let appended = false;
    const src = 'https://js.paystack.co/v1/inline.js';
    const existing = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
    if (!existing) {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      appended = true;
    }
    return () => {
      if (appended) {
        const el = document.querySelector(`script[src="${src}"]`);
        el && el.parentElement?.removeChild(el);
      }
    };
  }, []);

  // Prefill last payment reference if available
  useEffect(() => {
    try {
      const pending = localStorage.getItem('pending_school_subscription');
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed?.reference) {
          setLastRef(parsed.reference);
          setVerifyRef(parsed.reference);
        }
      }
    } catch {}
  }, []);

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
    if (studentCount <= 0) {
      setPricePerStudent(0);
      setTotalAmount(0);
      return;
    }

    let calculatedTotal = 0;
    let calculatedPerStudent = 0;

    if (studentCount >= 1 && studentCount <= 50) {
      // ₦1,000 per student
      calculatedPerStudent = 1000;
      calculatedTotal = studentCount * 1000;
    } else if (studentCount >= 51 && studentCount <= 100) {
      // ₦900 per student
      calculatedPerStudent = 900;
      calculatedTotal = studentCount * 900;
    } else if (studentCount >= 101 && studentCount <= 200) {
      // ₦850 per student
      calculatedPerStudent = 850;
      calculatedTotal = studentCount * 850;
    } else if (studentCount >= 201 && studentCount <= 250) {
      // ₦800 per student
      calculatedPerStudent = 800;
      calculatedTotal = studentCount * 800;
    } else {
      // 251+ students - Contact support
      calculatedTotal = 0;
      calculatedPerStudent = 0;
    }

    setPricePerStudent(calculatedPerStudent);
    setTotalAmount(calculatedTotal);
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

    if (studentCount > 250) {
      toast.error("For 250+ students, please contact support at +234 705 075 7085");
      window.open("https://wa.me/2347050757085?text=Hello,%20I%20need%20a%20subscription%20for%20more%20than%20250%20students", "_blank");
      return;
    }

    if (studentCount < 1) {
      toast.error("Please enter a valid number of students");
      return;
    }

    setLoading(true);
    console.log("Starting subscription payment...");
    console.log("School data being used:", schoolData);
    console.log("Total amount:", totalAmount);

    try {
      if (!user?.email) {
        toast.error("User email not found. Please log in again.");
        return;
      }

      // Generate payment reference
      const reference = `school_sub_${schoolData.id}_${Date.now()}`;

      // Initialize Paystack payment with enhanced metadata
      const paymentRef = await createSubscriptionPayment(
        `School Subscription - ${studentCount} students`,
        user.email,
        totalAmount,
        {
          student_seats: studentCount,
          price_per_student: pricePerStudent,
          school_id: schoolData.id,
          admin_auth_id: user.id
        },
        (reference) => {
          // Use React Router for SPA navigation instead of full reload
          navigate(`/payment-success?reference=${reference}`);
        }
      );

      // Store subscription details for verification
      localStorage.setItem('pending_school_subscription', JSON.stringify({
        school_id: schoolData.id,
        student_seats: studentCount,
        price_per_student: pricePerStudent,
        total_amount: totalAmount,
        reference: paymentRef || reference,
        admin_auth_id: user.id
      }));

      // Payment will open in modal, and redirect will happen after successful payment

    } catch (error: any) {
      console.error("Payment initialization error:", error);
      toast.error(error.message || "Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = async () => {
    const ref = verifyRef || lastRef || "";
    if (!ref) {
      toast.error("Enter your Paystack reference to verify");
      return;
    }
    setVerifying(true);
    try {
      const result = await verifyPaymentManually(ref);
      if ((result as any)?.success) {
        toast.success("Payment verified. Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/school-dashboard");
        }, 1200);
      } else {
        toast.error("Verification failed. Please try again or contact support.");
      }
    } catch (e: any) {
      console.error("Manual verification error", e);
      toast.error(e?.message || "Could not verify payment");
    } finally {
      setVerifying(false);
    }
  };

  if (fetchingSchool) {
    return (
      <div className="min-h-screen bg-primary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading school information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/5 py-12 px-4">
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
            School subscriptions are valid for 3 months. Choose the number of students you want to register.
            The more students you add, the better the rate!
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
              <h3 className="font-semibold mb-3">Pricing Tiers (3 Months)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span>1-50 students</span>
                  <span className="font-medium text-primary">₦1,000 per student</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>51-100 students</span>
                  <span className="font-medium">₦900 per student</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>101-200 students</span>
                  <span className="font-medium">₦850 per student</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>201-250 students</span>
                  <span className="font-medium">₦800 per student</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span>250+ students</span>
                  <span className="font-medium text-blue-600">Contact Support</span>
                </div>
              </div>
            </div>

            {/* Calculation Display */}
            {studentCount > 0 && studentCount <= 250 && (
              <div className="bg-primary/10 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-semibold text-lg">{studentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {studentCount <= 50 ? "Total price:" : "Price per student:"}
                  </span>
                  <span className="font-semibold text-lg text-primary">
                    ₦{pricePerStudent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-semibold text-lg">3 Months</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {studentCount > 250 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  For subscriptions with 250+ students, please contact our support team at +234 906 161 5303 for custom pricing and enterprise features.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handlePayment}
              disabled={loading || studentCount < 1 || studentCount > 250 || totalAmount === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {studentCount > 250 ? "Contact Support" : `Subscribe - ₦${totalAmount.toLocaleString()}`}
                </>
              )}
            </Button>

            <div className="space-y-3">
              <div className="text-center text-sm text-muted-foreground">Already paid?</div>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Paystack reference"
                  value={verifyRef}
                  onChange={(e) => setVerifyRef(e.target.value)}
                />
                <Button variant="outline" onClick={handleManualVerify} disabled={verifying || !verifyRef}>
                  {verifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify payment
                </Button>
              </div>
              {lastRef && (
                <button
                  type="button"
                  className="text-xs underline text-primary"
                  onClick={() => setVerifyRef(lastRef)}
                >
                  Use last payment reference
                </button>
              )}
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our subscription terms. Payment is secure via Paystack.
              Subscription is valid for 3 months from activation.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}