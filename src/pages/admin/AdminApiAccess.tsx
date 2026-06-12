import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound, RefreshCw, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useUserTimeZone } from "@/hooks/use-user-timezone";
import {
  createAdminApiAccessKeyForProfile,
  listAdminApiAccessKeys,
  refreshAdminApiAccessKey,
  revokeAdminApiAccessKey,
  type ApiAccessKeyRecord,
} from "@/lib/portalApi";
import { formatDateTimeForTimeZone } from "@/lib/timezone";
import { getClientAccessLabel, type ClientAccessRole } from "@/data/authData";

function statusBadge(status: ApiAccessKeyRecord["status"]) {
  if (status === "ACTIVE") return <Badge>Active</Badge>;
  if (status === "REVOKED") return <Badge variant="secondary">Revoked</Badge>;
  return <Badge variant="outline">Expired</Badge>;
}

export default function AdminApiAccess() {
  const { toast } = useToast();
  const timeZone = useUserTimeZone();
  const queryClient = useQueryClient();
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [newApiSecret, setNewApiSecret] = useState<string | null>(null);

  const apiAccessQuery = useQuery({
    queryKey: ["admin-api-access-keys"],
    queryFn: () => listAdminApiAccessKeys(),
  });

  const eligibleProfiles = useMemo(() => apiAccessQuery.data?.eligibleProfiles ?? [], [apiAccessQuery.data?.eligibleProfiles]);
  const keys = useMemo(() => apiAccessQuery.data?.keys ?? [], [apiAccessQuery.data?.keys]);
  const selectedProfile = useMemo(
    () => eligibleProfiles.find((profile) => profile.id === selectedProfileId) ?? null,
    [eligibleProfiles, selectedProfileId],
  );

  const createMutation = useMutation({
    mutationFn: () => createAdminApiAccessKeyForProfile(selectedProfileId),
    onSuccess: async (result) => {
      setNewApiSecret(result.secret);
      await queryClient.invalidateQueries({ queryKey: ["admin-api-access-keys"] });
      toast({ title: "API token created", description: "Copy it now. The full token is only shown once." });
    },
    onError: (error) => {
      toast({ title: "Unable to create API token", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const refreshMutation = useMutation({
    mutationFn: (keyId: string) => refreshAdminApiAccessKey(keyId),
    onSuccess: async (result) => {
      setNewApiSecret(result.secret);
      await queryClient.invalidateQueries({ queryKey: ["admin-api-access-keys"] });
      toast({ title: "API token refreshed", description: "The previous token was revoked. Copy the new token now." });
    },
    onError: (error) => {
      toast({ title: "Unable to refresh API token", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (keyId: string) => revokeAdminApiAccessKey(keyId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-api-access-keys"] });
      toast({ title: "API token revoked", description: "The token can no longer access the API." });
    },
    onError: (error) => {
      toast({ title: "Unable to revoke API token", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    },
  });

  const copyApiSecret = async () => {
    if (!newApiSecret) return;
    await navigator.clipboard?.writeText(newApiSecret).catch(() => undefined);
    toast({ title: "Token copied", description: "The API token was copied when browser permissions allowed it." });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="API Access" description="Create, refresh, and revoke client API tokens backed by Clerk API keys." />

      <Card>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Generate Client Token
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="space-y-2">
              <Label>Client Admin or Client IT owner</Label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose token owner" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {(profile.full_name ?? profile.email ?? profile.id)} · {profile.companies?.name ?? "No company"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProfile ? (
                <p className="text-xs text-muted-foreground">
                  {selectedProfile.email ?? "No email"} · {getClientAccessLabel(selectedProfile.client_access_role as ClientAccessRole)}
                </p>
              ) : null}
            </div>
            <Button type="button" onClick={() => createMutation.mutate()} disabled={!selectedProfileId || createMutation.isPending}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Generate Token
            </Button>
          </div>

          {newApiSecret ? (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-4">
              <Label htmlFor="admin-api-token">New API token</Label>
              <div className="mt-2 flex gap-2">
                <Input id="admin-api-token" readOnly value={newApiSecret} className="font-mono text-xs" />
                <Button type="button" variant="outline" onClick={copyApiSecret}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">This full token will not be shown again after you leave this page.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display">Client API Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visible token</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="min-w-[220px]">
                      <p className="font-medium">{key.profiles?.full_name ?? key.profiles?.email ?? key.subject_user_id}</p>
                      <p className="text-xs text-muted-foreground">{key.profiles?.email ?? key.subject_user_id}</p>
                    </TableCell>
                    <TableCell>{key.companies?.name ?? key.company_id}</TableCell>
                    <TableCell>{statusBadge(key.status)}</TableCell>
                    <TableCell className="font-mono text-xs">{key.token_prefix ?? "Hidden"}</TableCell>
                    <TableCell>{formatDateTimeForTimeZone(key.created_at, timeZone)}</TableCell>
                    <TableCell>{key.expires_at ? formatDateTimeForTimeZone(key.expires_at, timeZone) : "No expiry"}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="outline" disabled={key.status !== "ACTIVE" || refreshMutation.isPending} onClick={() => refreshMutation.mutate(key.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Refresh
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={key.status !== "ACTIVE" || revokeMutation.isPending} onClick={() => revokeMutation.mutate(key.id)}>
                          Revoke
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!keys.length ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      {apiAccessQuery.isLoading ? "Loading API tokens..." : "No client API tokens have been generated yet."}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
