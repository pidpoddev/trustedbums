param(
  [string]$TenantId = "69849311-dd5d-4dcb-b571-279708629587",
  [string]$AppId = "06a570a0-06f4-432a-8b3b-709d6cf762dc"
)

$ErrorActionPreference = "Stop"

Import-Module Microsoft.Graph.Authentication
Import-Module Microsoft.Graph.Applications

Connect-MgGraph `
  -TenantId $TenantId `
  -Scopes "Application.ReadWrite.All", "AppRoleAssignment.ReadWrite.All" `
  -UseDeviceCode `
  -NoWelcome

$graphAppId = "00000003-0000-0000-c000-000000000000"
$app = Get-MgApplication -Filter "appId eq '$AppId'"
$servicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$AppId'"
$graphServicePrincipal = Get-MgServicePrincipal -Filter "appId eq '$graphAppId'"

if (-not $app) {
  throw "App registration not found for $AppId"
}

if (-not $servicePrincipal) {
  throw "Enterprise application not found for $AppId"
}

$mailReadRole = $graphServicePrincipal.AppRoles |
  Where-Object { $_.Value -eq "Mail.Read" -and $_.AllowedMemberTypes -contains "Application" } |
  Select-Object -First 1

if (-not $mailReadRole) {
  throw "Microsoft Graph Mail.Read application role not found"
}

$requiredResourceAccess = @($app.RequiredResourceAccess)
$graphRequiredAccess = $requiredResourceAccess |
  Where-Object { $_.ResourceAppId -eq $graphAppId } |
  Select-Object -First 1

if ($graphRequiredAccess) {
  $resourceAccess = @($graphRequiredAccess.ResourceAccess)
  $hasMailRead = $resourceAccess |
    Where-Object { $_.Id -eq $mailReadRole.Id -and $_.Type -eq "Role" }

  if (-not $hasMailRead) {
    $resourceAccess += @{
      Id = $mailReadRole.Id
      Type = "Role"
    }
    $graphRequiredAccess.ResourceAccess = $resourceAccess
  }
} else {
  $requiredResourceAccess += @{
    ResourceAppId = $graphAppId
    ResourceAccess = @(
      @{
        Id = $mailReadRole.Id
        Type = "Role"
      }
    )
  }
}

Update-MgApplication -ApplicationId $app.Id -RequiredResourceAccess $requiredResourceAccess

$existingAssignment = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $servicePrincipal.Id -All |
  Where-Object { $_.ResourceId -eq $graphServicePrincipal.Id -and $_.AppRoleId -eq $mailReadRole.Id }

if (-not $existingAssignment) {
  New-MgServicePrincipalAppRoleAssignment `
    -ServicePrincipalId $servicePrincipal.Id `
    -PrincipalId $servicePrincipal.Id `
    -ResourceId $graphServicePrincipal.Id `
    -AppRoleId $mailReadRole.Id |
    Out-Null
}

$assignments = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $servicePrincipal.Id -All |
  Where-Object { $_.ResourceId -eq $graphServicePrincipal.Id }

Write-Host "Microsoft Graph application permissions granted to ${AppId}:"
$assignments |
  Select-Object Id, AppRoleId, ResourceDisplayName |
  Format-Table -AutoSize

Write-Host ""
Write-Host "Security note: Mail.Read application permission can read all mailboxes unless Exchange application access is scoped."
Write-Host "For the DMARC reader, restrict access to bums@trustedbums.com with Exchange application RBAC or an application access policy."

Disconnect-MgGraph | Out-Null
