import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, FileSpreadsheet, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { AllResourcesTab } from "@/components/resources/AllResourcesTab";

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: "all",
      title: "All Resources",
      description: "Browse all study materials including past questions, textbooks, syllabus documents, and more",
      icon: FileText,
      color: "text-primary"
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Study <span className="text-primary">Resources</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access comprehensive study materials to boost your exam preparation
            </p>
          </div>

          {selectedCategory ? (
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCategory(null)}
                className="mb-6"
              >
                ← Back to Categories
              </Button>
              <AllResourcesTab />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-4xl mx-auto">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card 
                    key={category.id}
                    className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary/50"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center ${category.color} group-hover:bg-primary/20 transition-colors`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl mb-2 group-hover:text-primary transition-colors">
                              {category.title}
                            </CardTitle>
                            <CardDescription className="text-base">
                              {category.description}
                            </CardDescription>
                          </div>
                        </div>
                        <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
