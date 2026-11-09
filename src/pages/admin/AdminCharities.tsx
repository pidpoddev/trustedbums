import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listCharities, reviewCharity, type Charity, type CharityStatus } from "@/lib/beneficiaries";

function CharityReview({ charity }: { charity: Charity }) {
  const client = useQueryClient();
  const [notes, setNotes] = useState("");
  const [checks, setChecks] = useState([false, false, false]);
  const review = useMutation({ mutationFn: (status: CharityStatus) => reviewCharity(charity.id, status, notes), onSuccess: async () => { setNotes(""); setChecks([false, false, false]); await client.invalidateQueries({ queryKey: ["charities"] }); } });
  return <Card>
    <CardHeader><CardTitle>{charity.name}</CardTitle><p className="text-sm">{charity.status.replaceAll("_", " ")}</p></CardHeader>
    <CardContent className="space-y-3">
      <p className="break-all text-sm">Website: {charity.website}</p>
      <p className="text-sm">EIN / registration: {charity.registration_number}</p>
      <p className="whitespace-pre-wrap text-sm">{charity.suggestion_reason}</p>
      {charity.review_notes ? <p className="text-sm">Last review: {charity.review_notes}</p> : null}
      {charity.reviewed_at ? <p className="text-sm text-muted-foreground">Reviewed {new Date(charity.reviewed_at).toLocaleDateString()}</p> : null}
      <fieldset className="space-y-2"><legend className="font-medium">Approval checklist</legend>
        {["Verified charitable status and organization identity", "Reviewed political activity and affiliations; meets our nonpolitical standard", "Aligned with Trusted Bums values"].map((label, i) => <label key={label} className="flex items-start gap-2 text-sm"><input type="checkbox" checked={checks[i]} onChange={e => setChecks(checks.map((v, index) => index === i ? e.target.checked : v))} />{label}</label>)}
      </fieldset>
      <Label htmlFor={`review-${charity.id}`}>Review reason and verification sources (shared with the suggester)</Label>
      <Textarea id={`review-${charity.id}`} maxLength={4000} value={notes} onChange={e => setNotes(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Button disabled={review.isPending || !notes.trim() || !checks.every(Boolean)} onClick={() => review.mutate("APPROVED")}>Approve charity</Button>
        <Button variant="outline" disabled={review.isPending || !notes.trim()} onClick={() => review.mutate("REJECTED")}>{charity.status === "APPROVED" ? "Withdraw approval" : "Reject suggestion"}</Button>
      </div>
      {review.isError ? <p role="alert">{review.error.message}</p> : null}
      {review.isSuccess ? <p role="status">Review saved.</p> : null}
    </CardContent>
  </Card>;
}
export default function AdminCharities() {
  const query = useQuery({ queryKey: ["charities", "admin"], queryFn: listCharities });
  const charities = [...(query.data ?? [])].sort((a, b) => Number(b.status === "PENDING") - Number(a.status === "PENDING"));
  return <div className="space-y-6">
    <PageHeader title="Charity Reviews" description="Review suggestions before they can be selected in Who Benefits." />
    {query.isPending ? <p role="status">Loading charity suggestions…</p> : null}
    {query.isError ? <div role="alert"><p>Unable to load charity suggestions.</p><Button onClick={() => void query.refetch()}>Retry</Button></div> : null}
    {query.isSuccess && !charities.length ? <p>No charity suggestions yet.</p> : null}
    {charities.map(c => <CharityReview key={c.id} charity={c} />)}
  </div>;
}
