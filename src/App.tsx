import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { offlineStorage } from "./utils/offlineStorage";
import { useEffect } from "react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MobileSplash from "./pages/MobileSplash";
import MobileOnboarding from "./pages/MobileOnboarding";
import MobileHome from "./pages/MobileHome";
import MobileWebLanding from "./pages/MobileWebLanding";
import InstallApp from "./pages/InstallApp";
import { useInstalledApp } from "./hooks/useInstalledApp";
import { useIsMobile } from "./hooks/use-mobile";

import AdminPortal from "./pages/AdminPortal";
import AdminLogin from "./pages/AdminLogin";
import CBTExam from "./pages/CBTExam";
import TestResults from "./pages/TestResults";
import Demo from "./pages/Demo";
import DemoTest from "./pages/DemoTest";

import Resources from "./pages/Resources";
import Consultation from "./pages/Consultation";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import AkboyHome from "./pages/akboy/AkboyHome";
import AkboyContact from "./pages/akboy/AkboyContact";
import AkboyBlog from "./pages/akboy/AkboyBlog";
import AkboyAbout from "./pages/akboy/AkboyAbout";
import AkboyServices from "./pages/akboy/AkboyServices";
import AkboyPortfolio from "./pages/akboy/AkboyPortfolio";
import AkboyEvents from "./pages/akboy/AkboyEvents";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import AnswerReview from "./pages/AnswerReview";
import PaymentSuccess from "./pages/PaymentSuccess";
import StudyHub from "./pages/StudyHub";
import StudyTopic from "./pages/StudyTopic";
import LessonView from "./pages/LessonView";
import Forum from "./pages/Forum";
import ForumNewPost from "./pages/ForumNewPost";
import ForumPost from "./pages/ForumPost";
import ChallengeArena from "./pages/ChallengeArena";
import ChallengeDetail from "./pages/ChallengeDetail";
import ChallengeResults from "./pages/ChallengeResults";
import SchoolRegistration from "./pages/SchoolRegistration";
import OfflineExams from "./pages/OfflineExams";
import StudyPlanner from "./pages/StudyPlanner";
import ReferralProgram from "./pages/ReferralProgram";
import PerformanceReport from "./pages/PerformanceReport";
import LessonQuiz from "./pages/LessonQuiz";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isInstalledApp } = useInstalledApp();
  const isMobile = useIsMobile();
  useOfflineSync(); // Enable offline sync

  // Initialize offline storage and cleanup on mount
  useEffect(() => {
    offlineStorage.init().then(() => {
      offlineStorage.cleanupExpiredData();
    });
  }, []);

  // Check if user is on mobile web (not installed PWA)
  const isMobileWeb = isMobile && !isInstalledApp;

  return (
    <>
      <OfflineIndicator />
      <Routes>
      {/* Mobile-specific routes */}
      <Route path="/mobile-splash" element={<MobileSplash />} />
      <Route path="/mobile-onboarding" element={<MobileOnboarding />} />
      <Route path="/mobile-home" element={
        <ProtectedRoute>
          <MobileHome />
        </ProtectedRoute>
      } />

      {/* Root route - redirect based on platform */}
      <Route 
        path="/" 
        element={
          isInstalledApp ? <Navigate to="/mobile-splash" replace /> : 
          <Layout><Home /></Layout>
        } 
      />
      
      {/* Install App Page */}
      <Route path="/install-app" element={<Layout><InstallApp /></Layout>} />
      
      {/* For testing mobile experience in web preview */}
      <Route path="/mobile-preview" element={<Navigate to="/mobile-splash" replace />} />
      
      <Route path="/auth" element={<Layout showNavbar={false}><Auth /></Layout>} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          {isInstalledApp ? <MobileHome /> : 
           <Layout showNavbar={false}><Dashboard /></Layout>}
        </ProtectedRoute>
      } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminPortal />
              </ProtectedRoute>
            } />
            <Route path="/practice" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><CBTExam /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/results" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><TestResults /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/test-results/:attemptId" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><TestResults /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/challenge-results/:attemptId" element={
              <ProtectedRoute>
                <ChallengeResults />
              </ProtectedRoute>
            } />
            <Route path="/exam" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><CBTExam /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/demo" element={<Layout><Demo /></Layout>} />
            <Route path="/demo-test" element={<Layout showNavbar={false}><DemoTest /></Layout>} />
            
            <Route path="/resources" element={<Layout><Resources /></Layout>} />
            <Route path="/consultation" element={<Layout><Consultation /></Layout>} />
            <Route path="/payment" element={<Layout><Payment /></Layout>} />
            <Route path="/answer-review" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><AnswerReview /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/payment-success" element={<Layout showNavbar={false}><PaymentSuccess /></Layout>} />
            <Route path="/study-hub" element={
              <ProtectedRoute>
                <StudyHub />
              </ProtectedRoute>
            } />
            <Route path="/study-hub/topic/:topicId" element={
              <ProtectedRoute>
                <StudyTopic />
              </ProtectedRoute>
            } />
            <Route path="/study-hub/lesson/:lessonId" element={
              <ProtectedRoute>
                <LessonView />
              </ProtectedRoute>
            } />
            <Route path="/forum" element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            } />
            <Route path="/forum/new" element={
              <ProtectedRoute>
                <ForumNewPost />
              </ProtectedRoute>
            } />
            <Route path="/forum/post/:postId" element={
              <ProtectedRoute>
                <ForumPost />
              </ProtectedRoute>
            } />
            <Route path="/challenge-arena" element={
              <ProtectedRoute>
                <ChallengeArena />
              </ProtectedRoute>
            } />
            <Route path="/challenge/:challengeId" element={
              <ProtectedRoute>
                <ChallengeDetail />
              </ProtectedRoute>
            } />
            <Route path="/school-registration" element={<Layout><SchoolRegistration /></Layout>} />
            <Route path="/offline-exams" element={
              <ProtectedRoute>
                <Layout><OfflineExams /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/study-planner" element={
              <ProtectedRoute>
                <Layout><StudyPlanner /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/referral-program" element={
              <ProtectedRoute>
                <Layout><ReferralProgram /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/performance-report" element={
              <ProtectedRoute>
                <Layout><PerformanceReport /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/study-hub/lesson/:lessonId/quiz" element={
              <ProtectedRoute>
                <LessonQuiz />
              </ProtectedRoute>
            } />
            {/* Blog redirects to AKBOY */}
            <Route path="/blog" element={<Navigate to="/akboy/blog" replace />} />
            <Route path="/blog/:slug" element={<Navigate to="/akboy/blog/:slug" replace />} />
            <Route path="/terms" element={<Layout><Terms /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            
            {/* AKBOY Creative Hub Routes */}
            <Route path="/akboy" element={<AkboyHome />} />
            <Route path="/akboy/about" element={<AkboyAbout />} />
            <Route path="/akboy/services" element={<AkboyServices />} />
            <Route path="/akboy/portfolio" element={<AkboyPortfolio />} />
            <Route path="/akboy/events" element={<AkboyEvents />} />
            <Route path="/akboy/contact" element={<AkboyContact />} />
            <Route path="/akboy/blog" element={<AkboyBlog />} />
            <Route path="/akboy/blog/:slug" element={<AkboyBlog />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
