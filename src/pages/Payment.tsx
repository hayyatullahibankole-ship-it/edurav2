import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle, CreditCard, Shield, Zap } from 'lucide-react';
import { createSubscriptionPayment } from '@/utils/paystack';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'premium');
  const [email, setEmail] = useState(user?.email || '');

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: 2500,
      duration: '1 Month',
      features: [
        'Access to practice tests',
        'Basic study materials',
        'Progress tracking',
        'Email support'
      ]
    },
    premium: {
      name: 'Premium Plan',
      price: 6000,
      duration: '3 Months',
      features: [
        'Everything in Basic',
        'Advanced practice tests',
        'Video tutorials',
        'Personalized study plan',
        'Priority support',
        'Performance analytics'
      ]
    },
    pro: {
      name: 'Pro Plan',
      price: 10000,
      duration: '6 Months',
      features: [
        'Everything in Premium',
        'Unlimited practice tests',
        'One-on-one tutoring sessions',
        'Exam prediction insights',
        'Mobile offline access',
        '24/7 support'
      ]
    }
  };

  const handlePayment = () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    const plan = plans[selectedPlan as keyof typeof plans];
    createSubscriptionPayment(selectedPlan, email, plan.price);
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

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-muted-foreground text-lg">
              Upgrade your learning experience with EduCore
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Plan Selection */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Select Your Plan
                  </CardTitle>
                  <CardDescription>
                    Choose the plan that best fits your learning needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                    {Object.entries(plans).map(([key, plan]) => (
                      <div key={key} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={key} />
                          <Label htmlFor={key} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-semibold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">{plan.duration}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary">
                                  ₦{plan.price.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                        {selectedPlan === key && (
                          <div className="mt-3 pl-6">
                            <ul className="space-y-1">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Payment Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Details
                  </CardTitle>
                  <CardDescription>
                    Complete your subscription with secure payment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span>Plan</span>
                      <span className="font-medium">
                        {plans[selectedPlan as keyof typeof plans].name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span>{plans[selectedPlan as keyof typeof plans].duration}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ₦{plans[selectedPlan as keyof typeof plans].price.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handlePayment} 
                    className="w-full" 
                    size="lg"
                  >
                    Pay with Paystack
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Secured by Paystack
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Choose EduCore?</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Comprehensive WAEC & JAMB preparation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Expert-created content and practice tests
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Progress tracking and analytics
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      24/7 customer support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;