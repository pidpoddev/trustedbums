import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getBeneficiary, listCharities, saveBeneficiary, suggestCharity } from "@/lib/beneficiaries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptySuggestion = { name: "", website: "", registration_number: "", suggestion_reason: "" };
export function WhoBenefitsCard() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [choice, setChoice] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState(emptySuggestion);
  const charities = useQuery({ queryKey: ["charities", user?.id], queryFn: listCharities, enabled: Boolean(user) });
  const preference = useQuery({ queryKey: ["beneficiary", user?.id], queryFn: () => getBeneficiary(user!.id), enabled: Boolean(user) });
  const save = useMutation({
    mutationFn: () => saveBeneficiary(user!.id, (choice ?? preference.data?.charity_id ?? "me") === "me" ? null : choice ?? preference.data!.charity_id),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["beneficiary", user?.id] }); setChoice(null); },
  });
  const suggest = useMutation({
    mutationFn: () => suggestCharity(user!.id, suggestion),
    onSuccess: async () => { setSuggestion(emptySuggestion); await client.invalidateQueries({ queryKey: ["charities"] }); },
  });
  const selected = choice ?? preference.data?.charity_id ?? "me";
  const approved = (charities.data ?? []).filter(c => c.status === "APPROVED");
  const unavailable = selected !== "me" && !approved.some(c => c.id === selected);
  return <Card>
    <CardHeader><CardTitle>Who Benefits</CardTitle></CardHeader>
    <CardContent className="space-y-5">
      <p className="text-sm text-muted-foreground">Choose yourself or an approved charity to receive future payouts. Existing payouts keep their recorded beneficiary.</p>
      {charities.isPending || preference.isPending ? <p role="status">Loading beneficiaries…</p> : null}
      {charities.isError || preference.isError ? <div role="alert"><p>Unable to load your beneficiary options.</p><Button variant="outline" onClick={() => { void charities.refetch(); void preference.refetch(); }}>Retry</Button></div> : null}
      <div className="space-y-2">
        <Label htmlFor="beneficiary">Who receives your future payouts?</Label>
        <select id="beneficiary" className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={selected} onChange={e => { setChoice(e.target.value); save.reset(); }} disabled={!charities.isSuccess || !preference.isSuccess || save.isPending}>
          <option value="me">Me</option>
          {unavailable ? <option value={selected} disabled>Previously selected charity — no longer approved</option> : null}
          {approved.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {unavailable ? <p role="alert" className="text-sm">Choose yourself or another approved charity. Existing charity payouts require admin review.</p> : null}
        <Button onClick={() => save.mutate()} disabled={!user || !charities.isSuccess || !preference.isSuccess || unavailable || save.isPending || choice === null}>{save.isPending ? "Saving…" : "Save beneficiary"}</Button>
        {save.isSuccess ? <p role="status">Beneficiary saved for future payouts.</p> : null}
        {save.isError ? <p role="alert">{save.error.message}</p> : null}
      </div>
      <details>
        <summary className="cursor-pointer font-medium">Suggest a charity</summary>
        <form className="mt-4 space-y-3" onSubmit={e => { e.preventDefault(); suggest.mutate(); }}>
          <p className="text-sm text-muted-foreground">Trusted Bums reviews charitable status, political activity or affiliation, and alignment with our values. Suggestions cannot be selected until approved.</p>
          {([ ["name", "Charity name"], ["website", "Charity website (https://)"], ["registration_number", "EIN or charity registration number"] ] as const).map(([key, label]) => <div key={key}><Label htmlFor={`charity-${key}`}>{label}</Label><Input id={`charity-${key}`} type={key === "website" ? "url" : "text"} required maxLength={key === "website" ? 500 : 200} value={suggestion[key]} onChange={e => { setSuggestion({ ...suggestion, [key]: e.target.value }); suggest.reset(); }} /></div>)}
          <Label htmlFor="charity-reason">Why is this charity a good fit?</Label>
          <Textarea id="charity-reason" required maxLength={2000} value={suggestion.suggestion_reason} onChange={e => setSuggestion({ ...suggestion, suggestion_reason: e.target.value })} />
          <Button type="submit" disabled={!user || suggest.isPending}>{suggest.isPending ? "Submitting…" : "Submit for review"}</Button>
          {suggest.isSuccess ? <p role="status">Suggestion submitted. You can select it after admin approval.</p> : null}
          {suggest.isError ? <p role="alert">{suggest.error.message}</p> : null}
        </form>
      </details>
      {(charities.data ?? []).filter(c => c.suggested_by === user?.id).map(c => <div key={c.id} className="rounded-md border p-3 text-sm"><p className="font-medium">{c.name} · {c.status === "PENDING" ? "Pending review" : c.status === "APPROVED" ? "Approved" : "Not approved"}</p>{c.review_notes ? <p>{c.review_notes}</p> : null}</div>)}
    </CardContent>
  </Card>;
}
