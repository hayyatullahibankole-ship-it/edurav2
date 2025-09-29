import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight,
  Star,
  Crown,
  Zap,
  CreditCard,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { createSubscriptionPayment } from "@/utils/paystack";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const Payment = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      // Process plans and add UI-specific data
      const processedPlans = data.map((plan: any) => ({
        ...plan,
        displayPrice: plan.price === 0 ? '₦0' : `₦${plan.price.toLocaleString()}`,
        period: plan.price === 0 ? 'forever' : `per ${Math.floor(plan.duration_days / 30) === 1 ? 'month' : Math.floor(plan.duration_days / 30) + ' months'}`,
        icon: plan.price === 0 ? <Zap className="h-6 w-6" /> : 
              plan.price < 3000 ? <Star className="h-6 w-6" /> : 
              <Crown className="h-6 w-6" />,
        popular: plan.name.toLowerCase().includes('premium'),
        paystack: plan.price > 0,
        cta: plan.price === 0 ? "Start Free" : `Choose ${plan.name}`
      }));

      setPlans(processedPlans);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast({
        title: "Error",
        description: "Failed to load pricing plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaystackPayment = async (planName: string, amount: number) => {
    if (!user || !userProfile?.email) {
      toast({
        title: "Authentication Required", 
        description: "Please login first to subscribe",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await createSubscriptionPayment(planName, userProfile.email, amount);
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const yearlyDiscount = {
    premium: "₦25,000", 
    pro: "₦45,000"
  };

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading pricing plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              💰 Affordable Plans
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your Success Plan
            </h1>
            <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
              Flexible pricing designed for Nigerian students. Start free, upgrade when ready.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan: any, index: number) => (
              <Card 
                key={index} 
                className={`relative ${plan.popular ? 'border-accent shadow-lg scale-105' : ''} hover:shadow-lg transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-accent text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    plan.popular ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                  }`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.displayPrice}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {Array.isArray(plan.features) ? plan.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="bg-accent/10 rounded-full p-1">
                          <Check className="h-4 w-4 text-accent" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-muted-foreground">
                        {plan.description || "Features coming soon"}
                      </div>
                    )}
                  </div>
                  
                  {plan.name !== "Free" && plan.price > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Save with yearly billing:
                      </p>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <span className="font-semibold text-accent">
                          {plan.name === "Premium" ? yearlyDiscount.premium : yearlyDiscount.pro}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          (2 months free!)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {plan.paystack ? (
                    <Button 
                      onClick={() => handlePaystackPayment(plan.name, plan.price)}
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-accent hover:bg-accent/90' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                      disabled={!user}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      {user ? `Get Started Now` : "Login to Subscribe"}
                    </Button>
                  ) : (
                    <Link to={user ? "/dashboard" : "/auth"} className="block">
                      <Button 
                        className="w-full"
                        variant="outline"
                      >
                        {user ? "Current Plan" : plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I change my plan anytime?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept bank transfers, debit cards, and mobile money through Paystack and Flutterwave.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is there a money-back guarantee?</h3>
                <p className="text-muted-foreground">
                  Yes! We offer a 7-day money-back guarantee if you're not satisfied with our platform.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I share my account with friends?</h3>
                <p className="text-muted-foreground">
                  Each account is for individual use only. We offer group discounts for schools and study groups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Journey Today
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join over 50,000 students who achieved their dream scores with Edura
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? "/payment?plan=premium" : "/auth"}>
                <Button size="lg" variant="secondary">
                  {user ? "Upgrade to Premium" : "Start Free Trial"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="bg-card text-foreground border-primary-foreground hover:bg-card/90">
                  Try Demo First
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Payment;