const appBaseUrl = import.meta.env.BASE_URL;

export const clerkSignInRedirectProps = {
  forceRedirectUrl: appBaseUrl,
  fallbackRedirectUrl: appBaseUrl,
} as const;

export const clerkSignUpRedirectProps = {
  forceRedirectUrl: appBaseUrl,
  fallbackRedirectUrl: appBaseUrl,
} as const;
