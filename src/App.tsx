import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ClientTermsGate } from "@/components/ClientTermsGate";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
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
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientAgreements from "./pages/client/ClientAgreements";
import ClientTerms from "./pages/client/ClientTerms";
import ClientOpportunityNew from "./pages/client/ClientOpportunityNew";
import ClientProfile from "./pages/client/ClientProfile";
import ClientTrainings from "./pages/client/ClientTrainings";
import ClientRequests from "./pages/client/ClientRequests";
import ClientExports from "./pages/client/ClientExports";
import BumLayout from "./layouts/BumLayout";
import BumDashboard from "./pages/bum/BumDashboard";
import BumOpportunities from "./pages/bum/BumOpportunities";
import BumClaims from "./pages/bum/BumClaims";
import BumLiveConversations from "./pages/bum/BumLiveConversations";
import BumEarnings from "./pages/bum/BumEarnings";
import BumProfile from "./pages/bum/BumProfile";
import BumClients from "./pages/bum/BumClients";
import BumTrainings from "./pages/bum/BumTrainings";
import BumOpportunityDetail from "./pages/bum/BumOpportunityDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AccessibilityProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
                  </Route>
                </Route>
              </Route>

              {/* Client Portal */}
              <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
                <Route element={<ClientTermsGate />}>
                  <Route path="/client" element={<ClientLayout />}>
                    <Route index element={<Navigate to="/client/dashboard" replace />} />
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="terms" element={<Navigate to="/terms" replace />} />
                    <Route path="opportunities/new" element={<ClientOpportunityNew />} />
                    <Route path="agreements" element={<ClientAgreements />} />
                    <Route path="profile" element={<ClientProfile />} />
                    <Route path="trainings" element={<ClientTrainings />} />
                    <Route path="requests" element={<ClientRequests />} />
                    <Route path="exports" element={<ClientExports />} />
                  </Route>
                </Route>
              </Route>

              {/* Bum Portal */}
              <Route element={<ProtectedRoute allowedRoles={["BUM"]} />}>
                <Route element={<ClientTermsGate />}>
                  <Route path="/bum" element={<BumLayout />}>
                    <Route index element={<Navigate to="/bum/dashboard" replace />} />
                    <Route path="dashboard" element={<BumDashboard />} />
                    <Route path="clients" element={<BumClients />} />
                    <Route path="opportunities" element={<BumOpportunities />} />
                    <Route path="opportunities/:id" element={<BumOpportunityDetail />} />
                    <Route path="claims" element={<BumClaims />} />
                    <Route path="trainings" element={<BumTrainings />} />
                    <Route path="live-conversations" element={<BumLiveConversations />} />
                    <Route path="earnings" element={<BumEarnings />} />
                    <Route path="profile" element={<BumProfile />} />
                  </Route>
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </AccessibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
