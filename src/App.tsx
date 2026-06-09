import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { ClerkTicketHandler } from "@/components/ClerkTicketHandler";
import { ConsentManager } from "@/components/ConsentManager";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { PerformanceMonitoring } from "@/components/PerformanceMonitoring";
import { RouteMetadata } from "@/components/RouteMetadata";
import { ClientAccessRoute } from "@/components/ClientAccessRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClientTermsGate } from "@/components/ClientTermsGate";
import { RoleDashboardRedirect } from "@/components/RoleDashboardRedirect";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const BumLanding = lazy(() => import("./pages/BumLanding"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const LegalDocumentPage = lazy(() => import("./pages/LegalDocumentPage"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const ClientLayout = lazy(() => import("./layouts/ClientLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminClients = lazy(() => import("./pages/admin/AdminClients"));
const AdminBums = lazy(() => import("./pages/admin/AdminBums"));
const AdminOpportunities = lazy(() => import("./pages/admin/AdminOpportunities"));
const AdminCredits = lazy(() => import("./pages/admin/AdminCredits"));
const AdminCommissionPlans = lazy(() => import("./pages/admin/AdminCommissionPlans"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts"));
const AdminLiveConversations = lazy(() => import("./pages/admin/AdminLiveConversations"));
const AdminEmails = lazy(() => import("./pages/admin/AdminEmails"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminScrumTracker = lazy(() => import("./pages/admin/AdminScrumTracker"));
const AdminPerformanceMetrics = lazy(() => import("./pages/admin/AdminPerformanceMetrics"));
const AdminHandoffs = lazy(() => import("./pages/admin/AdminHandoffs"));
const AdminTrainingAssets = lazy(() => import("./pages/admin/AdminTrainingAssets"));
const AdminTroubleshooting = lazy(() => import("./pages/admin/AdminTroubleshooting"));
const AdminLegal = lazy(() => import("./pages/admin/AdminLegal"));
const ClientDashboard = lazy(() => import("./pages/client/ClientDashboard"));
const ClientAgreements = lazy(() => import("./pages/client/ClientAgreements"));
const ClientTerms = lazy(() => import("./pages/client/ClientTerms"));
const ClientOpportunityNew = lazy(() => import("./pages/client/ClientOpportunityNew"));
const ClientTargets = lazy(() => import("./pages/client/ClientTargets"));
const ClientProfile = lazy(() => import("./pages/client/ClientProfile"));
const ClientUserProfile = lazy(() => import("./pages/client/ClientUserProfile"));
const ClientTeam = lazy(() => import("./pages/client/ClientTeam"));
const ClientBums = lazy(() => import("./pages/client/ClientBums"));
const ClientTrainings = lazy(() => import("./pages/client/ClientTrainings"));
const ClientRequests = lazy(() => import("./pages/client/ClientRequests"));
const ClientExports = lazy(() => import("./pages/client/ClientExports"));
const ClientPayments = lazy(() => import("./pages/client/ClientPayments"));
const ClientReports = lazy(() => import("./pages/client/ClientReports"));
const BumLayout = lazy(() => import("./layouts/BumLayout"));
const BumDashboard = lazy(() => import("./pages/bum/BumDashboard"));
const BumProspects = lazy(() => import("./pages/bum/BumProspects"));
const BumReverseOpportunities = lazy(() => import("./pages/bum/BumReverseOpportunities"));
const BumOpportunities = lazy(() => import("./pages/bum/BumOpportunities"));
const BumClaims = lazy(() => import("./pages/bum/BumClaims"));
const BumLiveConversations = lazy(() => import("./pages/bum/BumLiveConversations"));
const BumEarnings = lazy(() => import("./pages/bum/BumEarnings"));
const BumProfile = lazy(() => import("./pages/bum/BumProfile"));
const BumClients = lazy(() => import("./pages/bum/BumClients"));
const BumContacts = lazy(() => import("./pages/bum/BumContacts"));
const BumContactDetail = lazy(() => import("./pages/bum/BumContactDetail"));
const BumTrainings = lazy(() => import("./pages/bum/BumTrainings"));
const BumOpportunityDetail = lazy(() => import("./pages/bum/BumOpportunityDetail"));
const BumReports = lazy(() => import("./pages/bum/BumReports"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="trustedbums:theme">
      <Toaster />
      <Sonner />
      <AccessibilityProvider>
        <BrowserRouter
          basename={import.meta.env.BASE_URL}
          future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        >
          <AuthProvider>
            <AppErrorBoundary>
              <PerformanceMonitoring />
              <GoogleAnalytics />
              <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading...</div>}>
              <Routes>
                <Route path="/" element={<><RouteMetadata title="Trusted Bums | Client Warm Introduction Strategy" description="Trusted Bums helps companies reach hard-to-access target accounts through credible warm-introduction strategy." path="/" /><Index /></>} />
                <Route path="/bums" element={<><RouteMetadata title="Become a Bum | Trusted Bums" description="Apply to become a Trusted Bum and turn credible buyer relationships into approved warm-introduction work." path="/bums" /><BumLanding /></>} />
                <Route path="/login" element={<><RouteMetadata title="Login | Trusted Bums" description="Sign in to the Trusted Bums client, Bum, or admin portal." path="/login" /><Login /></>} />
                <Route path="/sign-in" element={<ClerkTicketHandler />} />
                <Route path="/privacy-policy" element={<><RouteMetadata title="Privacy Policy | Trusted Bums" description="Review how Trusted Bums handles privacy, data protection, cookies, and trusted marketplace account information." path="/privacy-policy" /><PrivacyPolicy /></>} />
                <Route path="/legal/:slug" element={<><RouteMetadata title="Legal Documents | Trusted Bums" description="Review Trusted Bums legal documents, marketplace terms, and client agreement information." /><LegalDocumentPage /></>} />
                <Route element={<ProtectedRoute allowedRoles={["ADMIN", "CLIENT", "BUM"]} />}>
                  <Route path="/dashboard" element={<RoleDashboardRedirect />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={["CLIENT", "BUM"]} />}>
                  <Route path="/terms" element={<ClientTerms />} />
                </Route>

                {/* Admin Portal */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                  <Route element={<ClientTermsGate />}>
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="clients" element={<AdminClients />} />
                      <Route path="bums" element={<AdminBums />} />
                      <Route path="opportunities" element={<AdminOpportunities />} />
                      <Route path="handoffs" element={<AdminHandoffs />} />
                      <Route path="credits" element={<AdminCredits />} />
                      <Route path="commission-plans" element={<AdminCommissionPlans />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="payouts" element={<AdminPayouts />} />
                      <Route path="live-conversations" element={<AdminLiveConversations />} />
                      <Route path="emails" element={<AdminEmails />} />
                      <Route path="training-assets" element={<AdminTrainingAssets />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="scrum" element={<AdminScrumTracker />} />
                      <Route path="performance" element={<AdminPerformanceMetrics />} />
                      <Route path="troubleshooting" element={<AdminTroubleshooting />} />
                      <Route path="legal" element={<AdminLegal />} />
                      <Route path="profile" element={<AdminProfile />} />
                    </Route>
                  </Route>
                </Route>

                {/* Client Portal */}
                <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
                  <Route element={<ClientTermsGate />}>
                    <Route path="/client" element={<ClientLayout />}>
                      <Route index element={<Navigate to="/client/dashboard" replace />} />
                      <Route path="dashboard" element={<ClientDashboard />} />
                      <Route path="terms" element={<ClientTerms />} />
                      <Route path="agreements" element={<ClientAgreements />} />
                      <Route path="profile" element={<ClientProfile />} />
                      <Route path="user-profile" element={<ClientUserProfile />} />
                      <Route path="reports" element={<ClientReports />} />
                      <Route element={<ClientAccessRoute allowedAccessRoles={["CLIENT_ADMIN"]} />}>
                        <Route path="team" element={<ClientTeam />} />
                      </Route>
                      <Route element={<ClientAccessRoute allowedAccessRoles={["CLIENT_ADMIN", "CLIENT_MEMBER"]} />}>
                        <Route path="targets" element={<ClientTargets />} />
                        <Route path="opportunities" element={<ClientOpportunityNew />} />
                        <Route path="opportunities/new" element={<ClientOpportunityNew />} />
                        <Route path="bum-directory" element={<ClientBums />} />
                        <Route path="trainings" element={<ClientTrainings />} />
                        <Route path="requests" element={<ClientRequests />} />
                      </Route>
                      <Route element={<ClientAccessRoute allowedAccessRoles={["CLIENT_ADMIN", "CLIENT_FINANCE"]} />}>
                        <Route path="payments" element={<ClientPayments />} />
                        <Route path="exports" element={<ClientExports />} />
                      </Route>
                    </Route>
                  </Route>
                </Route>

                {/* Bum Portal */}
                <Route element={<ProtectedRoute allowedRoles={["BUM"]} />}>
                  <Route element={<ClientTermsGate />}>
                    <Route path="/bum" element={<BumLayout />}>
                      <Route index element={<Navigate to="/bum/dashboard" replace />} />
                      <Route path="dashboard" element={<BumDashboard />} />
                      <Route path="terms" element={<ClientTerms />} />
                      <Route path="prospects" element={<BumProspects />} />
                      <Route path="reverse-opportunities" element={<BumReverseOpportunities />} />
                      <Route path="clients" element={<BumClients />} />
                      <Route path="contacts" element={<BumContacts />} />
                      <Route path="contacts/:id" element={<BumContactDetail />} />
                      <Route path="opportunities" element={<BumOpportunities />} />
                      <Route path="opportunities/:id" element={<BumOpportunityDetail />} />
                      <Route path="claims" element={<BumClaims />} />
                      <Route path="trainings" element={<BumTrainings />} />
                      <Route path="live-conversations" element={<BumLiveConversations />} />
                      <Route path="earnings" element={<BumEarnings />} />
                      <Route path="reports" element={<BumReports />} />
                      <Route path="profile" element={<BumProfile />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <ConsentManager />
            </AppErrorBoundary>
          </AuthProvider>
        </BrowserRouter>
      </AccessibilityProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
