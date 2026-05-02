import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Admin Portal */}
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

          {/* Client Portal */}
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<ClientDashboard />} />
            <Route path="agreements" element={<ClientAgreements />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="trainings" element={<ClientTrainings />} />
            <Route path="requests" element={<ClientRequests />} />
            <Route path="exports" element={<ClientExports />} />
          </Route>

          {/* Bum Portal */}
          <Route path="/bum" element={<BumLayout />}>
            <Route index element={<BumDashboard />} />
            <Route path="opportunities" element={<BumOpportunities />} />
            <Route path="claims" element={<BumClaims />} />
            <Route path="live-conversations" element={<BumLiveConversations />} />
            <Route path="earnings" element={<BumEarnings />} />
            <Route path="profile" element={<BumProfile />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
