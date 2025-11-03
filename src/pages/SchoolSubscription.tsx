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
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", user?.id)
        .single();

      if (!userData) return;

      const { data: school } = await supabase
        .from("schools")
        .select("*")
        .eq("admin_user_id", userData.id)
        .single();

      if (school) {
        setSchoolData(school);
      }
    } catch (error) {
      console.error("Error fetching school data:", error);
    }
  };

  useEffect(() => {
    calculatePrice();
  }, [studentCount]);

  const calculatePrice = () => {
    let price = 300;
    
    if (studentCount > 500) {
      setPricePerStudent(0);
      setTotalAmount(0);
      return;
    } else if (studentCount > 200) {
      price = 200;
    } else if (studentCount > 50) {
      price = 250;
    }

    setPricePerStudent(price);
    setTotalAmount(price * studentCount);
  };

  const handlePayment = async () => {
    if (!schoolData) {
      toast.error("School data not found");
      return;
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

    try {
      // Create subscription record
      const { data: subscription, error: subError } = await (supabase as any)
        .from("school_subscriptions")
        .insert({
          school_id: schoolData.id,
          student_seats: studentCount,
          price_per_student: pricePerStudent,
          total_amount: totalAmount,
          status: "pending",
          admin_user_id: user?.id,
        })
        .select()
        .single();

      if (subError) throw subError;

      // Initiate payment (simplified without callbacks for now)
      const amountInKobo = totalAmount * 100;
      
      toast.info("Redirecting to payment...");
      
      // Store subscription ID for later verification
      localStorage.setItem("pending_school_subscription", subscription.id);
      
      // Use basic paystack initialization
      window.location.href = `/payment?amount=${amountInKobo}&email=${schoolData.email}&reference=school_sub_${subscription.id}`;


    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

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
              <h3 className="font-semibold mb-3">Pricing Tiers</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>1 - 50 students</span>
                  <span className="font-medium">₦300 per student</span>
                </div>
                <div className="flex justify-between">
                  <span>51 - 200 students</span>
                  <span className="font-medium">₦250 per student</span>
                </div>
                <div className="flex justify-between">
                  <span>201 - 500 students</span>
                  <span className="font-medium">₦200 per student</span>
                </div>
                <div className="flex justify-between">
                  <span>501+ students</span>
                  <span className="font-medium text-primary">Contact Support</span>
                </div>
              </div>
            </div>

            {/* Calculation Display */}
            {studentCount > 0 && studentCount <= 500 && (
              <div className="bg-primary/10 rounded-lg p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Students:</span>
                  <span className="font-semibold text-lg">{studentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price per student:</span>
                  <span className="font-semibold text-lg">₦{pricePerStudent.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
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
              disabled={loading || studentCount < 1 || studentCount > 500}
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
                  Proceed to Payment
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