drop policy if exists "Users can read relevant meeting transcripts" on public.meeting_transcripts;
create policy "Users can read relevant meeting transcripts"
on public.meeting_transcripts for select
to anon, authenticated
using (
  public.is_admin()
  or company_id = public.current_company_id()
  or exists (
    select 1
    from public.teams_meetings meeting
    where meeting.id = meeting_transcripts.teams_meeting_id
      and (
        meeting.scheduled_by = public.current_user_id()
        or meeting.client_company_id = public.current_company_id()
        or public.is_admin()
      )
  )
  or exists (
    select 1
    from public.opportunity_claims claim
    where claim.id = meeting_transcripts.opportunity_claim_id
      and claim.bum_user_id = public.current_user_id()
  )
  or exists (
    select 1
    from public.opportunity_registrations opportunity
    where opportunity.id = meeting_transcripts.opportunity_registration_id
      and opportunity.status = 'Accepted'
      and public.is_bum()
  )
);
