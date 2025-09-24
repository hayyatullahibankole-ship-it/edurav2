import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  ArrowRight,
  Star,
  Crown,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "₦0",
      period: "forever",
      description: "Perfect for getting started",
      icon: <Zap className="h-6 w-6" />,
      features: [
        "5 practice tests per month",
        "Basic performance analytics",
        "Access to 2024 past questions",
        "Community forum access",
        "Email support"
      ],
      limitations: [
        "Limited question bank access",
        "No video tutorials",
        "No consultation booking"
      ],
      popular: false,
      cta: "Start Free",
      href: "/signup"
    },
    {
      name: "Premium",
      price: "₦2,500",
      period: "per month",
      description: "Most popular for serious students",
      icon: <Star className="h-6 w-6" />,
      features: [
        "Unlimited practice tests",
        "Advanced analytics & insights",
        "Complete question bank (2015-2024)",
        "Video tutorials for all subjects",
        "PDF study materials download",
        "Priority email support",
        "Performance predictions",
        "Subject-wise weak area analysis"
      ],
      limitations: [],
      popular: true,
      cta: "Choose Premium",
      href: "/signup"
    },
    {
      name: "Pro",
      price: "₦4,500",
      period: "per month",
      description: "Complete exam preparation solution",
      icon: <Crown className="h-6 w-6" />,
      features: [
        "Everything in Premium",
        "1-on-1 consultation booking (2 sessions/month)",
        "Group study sessions access",
        "Custom study plans",
        "WhatsApp support group",
        "Exam strategy workshops",
        "Mock exam certificates",
        "University admission guidance"
      ],
      limitations: [],
      popular: false,
      cta: "Choose Pro",
      href: "/signup"
    }
  ];

  const yearlyDiscount = {
    premium: "₦25,000",
    pro: "₦45,000"
  };

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
            {plans.map((plan, index) => (
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
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="bg-accent/10 rounded-full p-1">
                          <Check className="h-4 w-4 text-accent" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {plan.name !== "Free" && (
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
                  
                  <Link to={plan.href} className="block">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-accent hover:bg-accent/90' 
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
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
              Join over 50,000 students who achieved their dream scores with EduCBT
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" variant="secondary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
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

export default Pricing;