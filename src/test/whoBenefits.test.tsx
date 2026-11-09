import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WhoBenefitsCard } from "@/components/WhoBenefitsCard";
import AdminCharities from "@/pages/admin/AdminCharities";
import { listCharities, getBeneficiary, saveBeneficiary, reviewCharity } from "@/lib/beneficiaries";
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { id: "bum" } }) }));
vi.mock("@/lib/beneficiaries", () => ({ listCharities: vi.fn(), getBeneficiary: vi.fn(), saveBeneficiary: vi.fn(), suggestCharity: vi.fn(), reviewCharity: vi.fn() }));
const charity = { id: "approved", name: "Education", website: "https://example.org", registration_number: "123", suggestion_reason: "Helps children", suggested_by: "bum", status: "APPROVED" as const, review_notes: null, reviewed_by: null, reviewed_at: null };
function mount(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}
beforeEach(() => { vi.clearAllMocks(); vi.mocked(listCharities).mockResolvedValue([charity, { ...charity, id: "pending", name: "Pending charity", status: "PENDING" }, { ...charity, id: "rejected", name: "Rejected charity", status: "REJECTED" }]); vi.mocked(getBeneficiary).mockResolvedValue(null); });
it("offers only approved charities and saves an explicit selection", async () => {
  mount(<WhoBenefitsCard />);
  const select = await screen.findByLabelText("Who receives your future payouts?");
  await screen.findByRole("option", { name: "Education" });
  expect(screen.queryByRole("option", { name: "Pending charity" })).not.toBeInTheDocument();
  expect(screen.queryByRole("option", { name: "Rejected charity" })).not.toBeInTheDocument();
  expect(saveBeneficiary).not.toHaveBeenCalled();
  fireEvent.change(select, { target: { value: "approved" } });
  fireEvent.click(screen.getByRole("button", { name: "Save beneficiary" }));
  await waitFor(() => expect(saveBeneficiary).toHaveBeenCalledWith("bum", "approved"));
});
it("requires all approval checks and a reason before admin approval", async () => {
  vi.mocked(listCharities).mockResolvedValue([{ ...charity, status: "PENDING" }]);
  mount(<AdminCharities />);
  const approve = await screen.findByRole("button", { name: "Approve charity" });
  expect(approve).toBeDisabled();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Verified against official records" } });
  expect(approve).toBeDisabled();
  for (const checkbox of screen.getAllByRole("checkbox")) fireEvent.click(checkbox);
  expect(approve).toBeEnabled();
  fireEvent.click(approve);
  await waitFor(() => expect(reviewCharity).toHaveBeenCalledWith("approved", "APPROVED", "Verified against official records"));
});
