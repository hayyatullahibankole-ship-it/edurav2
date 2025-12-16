import { Routes, Route, Navigate } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import { DashboardLayout } from "./DashboardLayout";

// Edura Pages
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import MobileSplash from "@/pages/MobileSplash";
import MobileOnboarding from "@/pages/MobileOnboarding";
import MobileHome from "@/pages/MobileHome";
import InstallApp from "@/pages/InstallApp";
import AdminPortal from "@/pages/AdminPortal";
import AdminLogin from "@/pages/AdminLogin";
import CBTExam from "@/pages/CBTExam";
import TestResults from "@/pages/TestResults";
import Demo from "@/pages/Demo";
import DemoTest from "@/pages/DemoTest";
import Resources from "@/pages/Resources";
import Consultation from "@/pages/Consultation";
import Payment from "@/pages/Payment";
import NotFound from "@/pages/NotFound";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import AnswerReview from "@/pages/AnswerReview";
import PaymentSuccess from "@/pages/PaymentSuccess";
import StudyHub from "@/pages/StudyHub";
import StudyTopic from "@/pages/StudyTopic";
import LessonView from "@/pages/LessonView";
import Forum from "@/pages/Forum";
import ForumNewPost from "@/pages/ForumNewPost";
import ForumPost from "@/pages/ForumPost";
import ChallengeArena from "@/pages/ChallengeArena";
import ChallengeDetail from "@/pages/ChallengeDetail";
import ChallengeResults from "@/pages/ChallengeResults";
import SchoolRegistration from "@/pages/SchoolRegistration";
import SchoolLogin from "@/pages/SchoolLogin";
import SchoolSubscription from "@/pages/SchoolSubscription";
import SchoolDashboard from "@/pages/SchoolDashboard";
import SchoolVerificationPending from "@/pages/SchoolVerificationPending";
import SchoolLanding from "@/pages/SchoolLanding";
import OfflineExams from "@/pages/OfflineExams";
import StudyPlanner from "@/pages/StudyPlanner";
import ReferralProgram from "@/pages/ReferralProgram";
import PerformanceReport from "@/pages/PerformanceReport";
import LessonQuiz from "@/pages/LessonQuiz";

// Akboy Pages
import AkboyHome from "@/pages/akboy/AkboyHome";
import AkboyContact from "@/pages/akboy/AkboyContact";
import AkboyBlog from "@/pages/akboy/AkboyBlog";
import AkboyBlogPost from "@/pages/akboy/AkboyBlogPost";
import AkboyAbout from "@/pages/akboy/AkboyAbout";
import AkboyServices from "@/pages/akboy/AkboyServices";
import AkboyPortfolio from "@/pages/akboy/AkboyPortfolio";
import AkboyEvents from "@/pages/akboy/AkboyEvents";
import AkboyTutorialRegistration from "@/pages/akboy/AkboyTutorialRegistration";

// Akboy Routes Component
const AkboyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AkboyHome />} />
      <Route path="/about" element={<AkboyAbout />} />
      <Route path="/services" element={<AkboyServices />} />
      <Route path="/portfolio" element={<AkboyPortfolio />} />
      <Route path="/events" element={<AkboyEvents />} />
      <Route path="/contact" element={<AkboyContact />} />

      {/* Registration aliases */}
      <Route path="/register" element={<AkboyTutorialRegistration />} />
      <Route path="/tutorial-registration" element={<AkboyTutorialRegistration />} />
      <Route path="/tutorials/register" element={<AkboyTutorialRegistration />} />

      <Route path="/blog" element={<AkboyBlog />} />
      <Route path="/blog/:slug" element={<AkboyBlogPost />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Edura Routes Component
const EduraRoutes = () => {
  const { isInstalledApp } = useInstalledApp();
  
  return (
    <Routes>
      {/* Mobile-specific routes */}
      <Route path="/mobile-splash" element={<MobileSplash />} />
      <Route path="/mobile-onboarding" element={<MobileOnboarding />} />
      <Route path="/mobile-home" element={
        <ProtectedRoute>
          <MobileHome />
        </ProtectedRoute>
      } />

      {/* Root route */}
      <Route 
        path="/" 
        element={
          isInstalledApp ? <Navigate to="/mobile-splash" replace /> : 
          <Layout><Home /></Layout>
        } 
      />
      
      <Route path="/install-app" element={<Layout><InstallApp /></Layout>} />
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
      <Route path="/exam/:attemptId" element={
        <ProtectedRoute>
          <Layout showNavbar={false}><CBTExam /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/demo" element={<Layout><Demo /></Layout>} />
      <Route path="/demo-test" element={<Layout showNavbar={false}><DemoTest /></Layout>} />
      
      <Route path="/resources" element={
        <ProtectedRoute>
          <DashboardLayout><Resources /></DashboardLayout>
        </ProtectedRoute>
      } />
      
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
          <DashboardLayout><StudyHub /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/study-hub/topic/:topicId" element={
        <ProtectedRoute>
          <DashboardLayout><StudyTopic /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/study-hub/lesson/:lessonId" element={
        <ProtectedRoute>
          <DashboardLayout><LessonView /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/study-hub/lesson/:lessonId/quiz" element={
        <ProtectedRoute>
          <LessonQuiz />
        </ProtectedRoute>
      } />
      
      <Route path="/forum" element={
        <ProtectedRoute>
          <DashboardLayout><Forum /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/forum/new" element={
        <ProtectedRoute>
          <DashboardLayout><ForumNewPost /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/forum/post/:postId" element={
        <ProtectedRoute>
          <DashboardLayout><ForumPost /></DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/challenge-arena" element={
        <ProtectedRoute>
          <DashboardLayout><ChallengeArena /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/challenge/:challengeId" element={
        <ProtectedRoute>
          <DashboardLayout><ChallengeDetail /></DashboardLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/schools" element={<Layout showNavbar={false}><SchoolLanding /></Layout>} />
      <Route path="/school-landing" element={<Layout showNavbar={false}><SchoolLanding /></Layout>} />
      <Route path="/school-login" element={<Layout><SchoolLogin /></Layout>} />
      <Route path="/school-registration" element={<Layout><SchoolRegistration /></Layout>} />
      <Route path="/school-subscription" element={
        <ProtectedRoute>
          <SchoolSubscription />
        </ProtectedRoute>
      } />
      <Route path="/school-dashboard" element={
        <ProtectedRoute>
          <SchoolDashboard />
        </ProtectedRoute>
      } />
      <Route path="/school-verification-pending" element={<SchoolVerificationPending />} />
      
      <Route path="/offline-exams" element={
        <ProtectedRoute>
          <Layout><OfflineExams /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/study-planner" element={
        <ProtectedRoute>
          <DashboardLayout><StudyPlanner /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/referral-program" element={
        <ProtectedRoute>
          <DashboardLayout><ReferralProgram /></DashboardLayout>
        </ProtectedRoute>
      } />
      <Route path="/performance-report" element={
        <ProtectedRoute>
          <DashboardLayout><PerformanceReport /></DashboardLayout>
        </ProtectedRoute>
      } />
      
      {/* Blog Routes - shared with Akboy */}
      <Route path="/blog" element={<AkboyBlog />} />
      <Route path="/blog/:slug" element={<AkboyBlogPost />} />
      
      <Route path="/terms" element={<Layout><Terms /></Layout>} />
      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
      
      {/* AKBOY Routes accessible via /akboy path on Edura domain */}
      <Route path="/akboy" element={<AkboyHome />} />
      <Route path="/akboy/about" element={<AkboyAbout />} />
      <Route path="/akboy/services" element={<AkboyServices />} />
      <Route path="/akboy/portfolio" element={<AkboyPortfolio />} />
      <Route path="/akboy/events" element={<AkboyEvents />} />
      <Route path="/akboy/contact" element={<AkboyContact />} />

      {/* Registration aliases */}
      <Route path="/akboy/register" element={<AkboyTutorialRegistration />} />
      <Route path="/akboy/tutorial-registration" element={<AkboyTutorialRegistration />} />
      <Route path="/akboy/tutorials/register" element={<AkboyTutorialRegistration />} />

      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

// Main Platform Router
export const PlatformRouter = () => {
  const { isAkboy } = useDomainDetection();
  
  // If accessing from Akboy domain, show Akboy routes
  if (isAkboy) {
    return <AkboyRoutes />;
  }
  
  // Default to Edura routes
  return <EduraRoutes />;
};
