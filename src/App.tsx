import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { ClerkTicketHandler } from "@/components/ClerkTicketHandler";
import { ConsentManager } from "@/components/ConsentManager";
import { ClientAccessRoute } from "@/components/ClientAccessRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClientTermsGate } from "@/components/ClientTermsGate";
import { RoleDashboardRedirect } from "@/components/RoleDashboardRedirect";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminLayout from "./layouts/AdminLayout";
import ClientLayout from "./layouts/ClientLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminBums from "./pages/admin/AdminBums";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminCredits from "./pages/admin/AdminCredits";
import AdminCommissionPlans from "./pages/admin/AdminCommissionPlans";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPayouts from "./pages/admin/AdminPayouts";
import AdminLiveConversations from "./pages/admin/AdminLiveConversations";
import AdminEmails from "./pages/admin/AdminEmails";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminReports from "./pages/admin/AdminReports";
import AdminTrainingAssets from "./pages/admin/AdminTrainingAssets";
import AdminTroubleshooting from "./pages/admin/AdminTroubleshooting";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientAgreements from "./pages/client/ClientAgreements";
import ClientTerms from "./pages/client/ClientTerms";
import ClientOpportunityNew from "./pages/client/ClientOpportunityNew";
import ClientTargets from "./pages/client/ClientTargets";
import ClientProfile from "./pages/client/ClientProfile";
import ClientBums from "./pages/client/ClientBums";
import ClientTrainings from "./pages/client/ClientTrainings";
import ClientRequests from "./pages/client/ClientRequests";
import ClientExports from "./pages/client/ClientExports";
import ClientPayments from "./pages/client/ClientPayments";
import ClientReports from "./pages/client/ClientReports";
import BumLayout from "./layouts/BumLayout";
import BumDashboard from "./pages/bum/BumDashboard";
import BumProspects from "./pages/bum/BumProspects";
import BumReverseOpportunities from "./pages/bum/BumReverseOpportunities";
import BumOpportunities from "./pages/bum/BumOpportunities";
import BumClaims from "./pages/bum/BumClaims";
import BumLiveConversations from "./pages/bum/BumLiveConversations";
import BumEarnings from "./pages/bum/BumEarnings";
import BumProfile from "./pages/bum/BumProfile";
import BumClients from "./pages/bum/BumClients";
import BumTrainings from "./pages/bum/BumTrainings";
import BumOpportunityDetail from "./pages/bum/BumOpportunityDetail";
import BumReports from "./pages/bum/BumReports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="trustedbums:theme">
      <Toaster />
      <Sonner />
      <AccessibilityProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <AppErrorBoundary>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/sign-in" element={<ClerkTicketHandler />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
                      <Route path="credits" element={<AdminCredits />} />
                      <Route path="commission-plans" element={<AdminCommissionPlans />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="payouts" element={<AdminPayouts />} />
                      <Route path="live-conversations" element={<AdminLiveConversations />} />
                      <Route path="emails" element={<AdminEmails />} />
                      <Route path="training-assets" element={<AdminTrainingAssets />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="troubleshooting" element={<AdminTroubleshooting />} />
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
                      <Route path="reports" element={<ClientReports />} />
                      <Route element={<ClientAccessRoute allowedAccessRoles={["CLIENT_ADMIN", "CLIENT_MEMBER"]} />}>
                        <Route path="targets" element={<ClientTargets />} />
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
