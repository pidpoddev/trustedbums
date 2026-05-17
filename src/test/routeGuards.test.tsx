import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClientAccessRoute } from "@/components/ClientAccessRoute";
import { ClientTermsGate } from "@/components/ClientTermsGate";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleDashboardRedirect } from "@/components/RoleDashboardRedirect";
import { type AuthUser, type ClientAccessRole, type UserRole } from "@/data/authData";

const authState = vi.hoisted(() => ({
  value: {
    user: null as AuthUser | null,
    isLoaded: true,
    isSignedIn: false,
    hasRole: (roles: UserRole[]) => Boolean(authState.value.user && roles.includes(authState.value.user.role)),
    hasClientAccessRole: (roles: ClientAccessRole[]) =>
      Boolean(
        authState.value.user?.role === "CLIENT" &&
          authState.value.user.clientAccessRole &&
          roles.includes(authState.value.user.clientAccessRole),
      ),
  },
}));

const termsState = vi.hoisted(() => ({
  value: {
    hasAcceptedCurrentTerms: true,
    isLoading: false,
    terms: { id: "terms-v1" },
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState.value,
}));

vi.mock("@/hooks/use-current-terms", () => ({
  useCurrentTermsState: () => termsState.value,
}));

function makeUser(role: UserRole, clientAccessRole?: ClientAccessRole): AuthUser {
  return {
    id: `${role.toLowerCase()}-1`,
    email: `${role.toLowerCase()}@example.com`,
    name: `${role} User`,
    role,
    clientAccessRole,
    clientId: role === "CLIENT" ? "client-1" : undefined,
    bumId: role === "BUM" ? "bum-1" : undefined,
  };
}

describe("route guards", () => {
  beforeEach(() => {
    authState.value.user = null;
    authState.value.isLoaded = true;
    authState.value.isSignedIn = false;
    termsState.value.hasAcceptedCurrentTerms = true;
    termsState.value.isLoading = false;
    termsState.value.terms = { id: "terms-v1" };
  });

  it("sends anonymous protected-route visitors to login", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin portal</div>} />
          </Route>
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Login page")).toBeInTheDocument();
  });

  it("allows users with the required role through protected routes", () => {
    authState.value.user = makeUser("ADMIN");
    authState.value.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin portal</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin portal")).toBeInTheDocument();
  });

  it("redirects users with the wrong portal role to their default dashboard", async () => {
    authState.value.user = makeUser("CLIENT", "CLIENT_ADMIN");
    authState.value.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<div>Admin portal</div>} />
          </Route>
          <Route path="/client/dashboard" element={<div>Client dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Client dashboard")).toBeInTheDocument();
  });

  it("blocks client users from client areas outside their access role", async () => {
    authState.value.user = makeUser("CLIENT", "CLIENT_MEMBER");
    authState.value.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/client/payments"]}>
        <Routes>
          <Route element={<ClientAccessRoute allowedAccessRoles={["CLIENT_FINANCE"]} />}>
            <Route path="/client/payments" element={<div>Payments</div>} />
          </Route>
          <Route path="/client/dashboard" element={<div>Client dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Client dashboard")).toBeInTheDocument();
  });

  it("allows client users with the right access role", () => {
    authState.value.user = makeUser("CLIENT", "CLIENT_FINANCE");
    authState.value.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/client/payments"]}>
        <Routes>
          <Route element={<ClientAccessRoute allowedAccessRoles={["CLIENT_FINANCE"]} />}>
            <Route path="/client/payments" element={<div>Payments</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Payments")).toBeInTheDocument();
  });

  it("sends clients and bums who have not accepted current terms to terms", async () => {
    authState.value.user = makeUser("BUM");
    authState.value.isSignedIn = true;
    termsState.value.hasAcceptedCurrentTerms = false;

    render(
      <MemoryRouter initialEntries={["/bum/dashboard"]}>
        <Routes>
          <Route element={<ClientTermsGate />}>
            <Route path="/bum/dashboard" element={<div>Bum dashboard</div>} />
          </Route>
          <Route path="/terms" element={<div>Terms page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Terms page")).toBeInTheDocument();
  });

  it("does not terms-gate admin users", () => {
    authState.value.user = makeUser("ADMIN");
    authState.value.isSignedIn = true;
    termsState.value.hasAcceptedCurrentTerms = false;

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<ClientTermsGate />}>
            <Route path="/admin" element={<div>Admin portal</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin portal")).toBeInTheDocument();
  });

  it("routes /dashboard to the signed-in user's default portal", async () => {
    authState.value.user = makeUser("BUM");
    authState.value.isSignedIn = true;

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<RoleDashboardRedirect />} />
          <Route path="/bum/dashboard" element={<div>Bum dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Bum dashboard")).toBeInTheDocument();
  });
});
