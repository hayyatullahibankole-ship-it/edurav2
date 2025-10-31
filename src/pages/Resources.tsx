import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, FileSpreadsheet } from "lucide-react";
import Layout from "@/components/Layout";
import { PastQuestionsTab } from "@/components/resources/PastQuestionsTab";
import { SyllabusTab } from "@/components/resources/SyllabusTab";
import { BooksTab } from "@/components/resources/BooksTab";

const Resources = () => {
  const [activeTab, setActiveTab] = useState("past-questions");

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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="past-questions" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Past Questions</span>
                <span className="sm:hidden">Questions</span>
              </TabsTrigger>
              <TabsTrigger value="syllabus" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Syllabus</span>
              </TabsTrigger>
              <TabsTrigger value="books" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Books</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="past-questions" className="mt-0">
              <PastQuestionsTab />
            </TabsContent>

            <TabsContent value="syllabus" className="mt-0">
              <SyllabusTab />
            </TabsContent>

            <TabsContent value="books" className="mt-0">
              <BooksTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Resources;
