import { Routes, Route, Navigate } from "react-router-dom";
import { useDomainDetection } from "@/hooks/useDomainDetection";
import { useInstalledApp } from "@/hooks/useInstalledApp";
import { useIsMobile } from "@/hooks/use-mobile";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import { DashboardLayout } from "./DashboardLayout";
import { NativeAppWrapper } from "./NativeAppWrapper";

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
import AkboyCampusHub from "@/pages/akboy/AkboyCampusHub";
import AkboyContact from "@/pages/akboy/AkboyContact";
import AkboyBlog from "@/pages/akboy/AkboyBlog";
import AkboyBlogPost from "@/pages/akboy/AkboyBlogPost";
import AkboyAbout from "@/pages/akboy/AkboyAbout";
import AkboyServices from "@/pages/akboy/AkboyServices";
import AkboyPortfolio from "@/pages/akboy/AkboyPortfolio";
import AkboyEvents from "@/pages/akboy/AkboyEvents";
import AkboyTutorialRegistration from "@/pages/akboy/AkboyTutorialRegistration";
import AkboyMockRegistration from "@/pages/akboy/AkboyMockRegistration";
import AkboyMockLogin from "@/pages/akboy/AkboyMockLogin";
import AkboyMockExam from "@/pages/akboy/AkboyMockExam";
import AkboyMockSubmitted from "@/pages/akboy/AkboyMockSubmitted";
import AkboyMockResults from "@/pages/akboy/AkboyMockResults";
import AkboyMockPages from "@/pages/akboy/AkboyMockPages";
import ReprintAdmitSlip from "@/pages/akboy/ReprintAdmitSlip";
import AkboyAcademy from "@/pages/akboy/AkboyAcademy";
import AkboyResources from "@/pages/akboy/AkboyResources";
import AkboyTestimonials from "@/pages/akboy/AkboyTestimonials";
import AkboyConsultation from "@/pages/akboy/AkboyConsultation";

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

      <Route path="/blog" element={<Navigate to="/campus-hub" replace />} />
      <Route path="/campus-hub" element={<AkboyCampusHub />} />
      <Route path="/blog/:slug" element={<AkboyBlogPost />} />
      <Route path="/mock" element={<AkboyMockPages />} />
      <Route path="/mock-registration" element={<AkboyMockRegistration />} />
      <Route path="/mock-login" element={<AkboyMockLogin />} />
      <Route path="/mock-exam" element={<AkboyMockExam />} />
      <Route path="/mock-submitted" element={<AkboyMockSubmitted />} />
      <Route path="/mock-results" element={<AkboyMockResults />} />
      <Route path="/privacy" element={<Privacy />} />
        <Route path="/reprint-admit-slip" element={<ReprintAdmitSlip />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Campus Hub standalone routes
const CampusHubRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AkboyCampusHub />} />
      <Route path="/campus-hub" element={<AkboyCampusHub />} />
      <Route path="/blog" element={<Navigate to="/" replace />} />
      <Route path="/blog/:slug" element={<AkboyBlogPost />} />
      <Route path="*" element={<Navigate to="/" replace />} />
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
      
      {/* Blog Routes - shared with Akboy (now Campus Hub) */}
      <Route path="/blog" element={<Navigate to="/campus-hub" replace />} />
      <Route path="/campus-hub" element={<AkboyCampusHub />} />
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
      <Route path="/akboy/blog" element={<Navigate to="/akboy/campus-hub" replace />} />
      <Route path="/akboy/campus-hub" element={<AkboyCampusHub />} />
      <Route path="/akboy/blog/:slug" element={<AkboyBlogPost />} />

      {/* Registration aliases */}
      <Route path="/akboy/register" element={<AkboyTutorialRegistration />} />
      <Route path="/akboy/tutorial-registration" element={<AkboyTutorialRegistration />} />
      <Route path="/akboy/tutorials/register" element={<AkboyTutorialRegistration />} />

      {/* AKBOY Mock Exam Routes */}
      <Route path="/akboy/mock" element={<AkboyMockPages />} />
      <Route path="/akboy/mock-registration" element={<AkboyMockRegistration />} />
      <Route path="/akboy/mock-login" element={<AkboyMockLogin />} />
      <Route path="/akboy/mock-exam" element={<AkboyMockExam />} />
      <Route path="/akboy/mock-submitted" element={<AkboyMockSubmitted />} />
      <Route path="/akboy/mock-results" element={<AkboyMockResults />} />

      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

// Main Platform Router
export const PlatformRouter = () => {
  const { isAkboy, isCampusHub } = useDomainDetection();
  const { isInstalledApp } = useInstalledApp();

  // In preview/development we access Akboy pages under the /akboy prefix.
  // In that case we must keep EduraRoutes mounted so /akboy/* routes resolve.
  const hash = window.location.hash.toLowerCase();
  const normalizedHash = hash.replace(/^#!/, '#');
  const isAkboyPrefixedPath = window.location.pathname.startsWith('/akboy') || normalizedHash.startsWith('#/akboy');

  // If accessing from the Campus Hub standalone subdomain, show the standalone hub routes.
  if (isCampusHub && !isAkboyPrefixedPath) {
    return <CampusHubRoutes />;
  }

  // If accessing from the Akboy domain, show Akboy routes
  if (isAkboy && !isAkboyPrefixedPath) {
    return <AkboyRoutes />;
  }

  // Wrap with NativeAppWrapper for installed apps
  if (isInstalledApp) {
    return (
      <NativeAppWrapper>
        <EduraRoutes />
      </NativeAppWrapper>
    );
  }

  return <EduraRoutes />;
};

