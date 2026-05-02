export const clerkRedirectUrl = `${import.meta.env.BASE_URL}login`;

export const clerkSignInRedirectProps = {
  fallbackRedirectUrl: clerkRedirectUrl,
  forceRedirectUrl: clerkRedirectUrl,
  signUpFallbackRedirectUrl: clerkRedirectUrl,
  signUpForceRedirectUrl: clerkRedirectUrl,
};

export const clerkSignUpRedirectProps = {
  fallbackRedirectUrl: clerkRedirectUrl,
  forceRedirectUrl: clerkRedirectUrl,
  signInFallbackRedirectUrl: clerkRedirectUrl,
  signInForceRedirectUrl: clerkRedirectUrl,
};
