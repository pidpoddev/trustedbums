<#
.SYNOPSIS
Creates and grants the Teams application access policy required for app-only Microsoft Graph online meeting and transcript access.

.DESCRIPTION
Trusted Bums uses Supabase Edge Functions with Microsoft Graph application permissions to create Teams meetings,
configure recording/transcription, and fetch transcripts. Microsoft requires a Teams application access policy in
addition to Graph admin consent for these app-only online meeting APIs.

Run this from PowerShell 7+ as a Microsoft Teams administrator. The script opens an interactive Microsoft sign-in.
Policy propagation can take up to 30 minutes.
#>

[CmdletBinding()]
param(
  [Parameter()]
  [ValidateNotNullOrEmpty()]
  [string]$TenantId = "69849311-dd5d-4dcb-b571-279708629587",

  [Parameter()]
  [ValidateNotNullOrEmpty()]
  [string]$AppId = "06a570a0-06f4-432a-8b3b-709d6cf762dc",

  [Parameter()]
  [ValidateNotNullOrEmpty()]
  [string]$Username = "bums@trustedbums.com",

  [Parameter()]
  [ValidateNotNullOrEmpty()]
  [string]$OrganizerEmail = "bums@trustedbums.com",

  [Parameter()]
  [ValidateNotNullOrEmpty()]
  [string]$PolicyName = "TrustedBumsGraphPolicy",

  [Parameter()]
  [string]$Description = "Allow Trusted Bums backend to manage Teams meetings and transcripts"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Get-Module -ListAvailable -Name MicrosoftTeams)) {
  Write-Host "MicrosoftTeams module is missing. Installing into CurrentUser scope..."
  Set-PSRepository -Name PSGallery -InstallationPolicy Trusted
  Install-Module MicrosoftTeams -Scope CurrentUser -Force -AllowClobber
}

Import-Module MicrosoftTeams

Write-Host "Connecting to Microsoft Teams tenant '$TenantId' as '$Username'. Complete the device-code admin sign-in..."
Connect-MicrosoftTeams -TenantId $TenantId -AccountId $Username -UseDeviceAuthentication | Out-Null

$existingPolicy = $null
try {
  $existingPolicy = Get-CsApplicationAccessPolicy -Identity $PolicyName -ErrorAction Stop
} catch {
  if ($_.Exception.Message -notmatch "not found") {
    throw
  }
}

if ($null -ne $existingPolicy) {
  Write-Host "Updating existing application access policy '$PolicyName'..."
  Set-CsApplicationAccessPolicy -Identity $PolicyName -AppIds $AppId -Description $Description
} else {
  Write-Host "Creating application access policy '$PolicyName'..."
  New-CsApplicationAccessPolicy -Identity $PolicyName -AppIds $AppId -Description $Description
}

Write-Host "Granting '$PolicyName' to organizer '$OrganizerEmail'..."
Grant-CsApplicationAccessPolicy -PolicyName $PolicyName -Identity $OrganizerEmail

Write-Host "Policy details:"
Get-CsApplicationAccessPolicy -Identity $PolicyName | Format-List

Write-Host "Done. Microsoft says application access policy changes can take up to 30 minutes to affect Graph API calls."
