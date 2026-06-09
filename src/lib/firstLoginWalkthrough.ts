export const FIRST_LOGIN_WALKTHROUGH_EVENT = "trustedbums:open-first-login-walkthrough";
export const FIRST_LOGIN_WALKTHROUGH_AUTOSTART_DISABLED_KEY =
  "trustedbums:first-login-walkthrough:disable-autostart";

export function openFirstLoginWalkthrough() {
  window.dispatchEvent(new Event(FIRST_LOGIN_WALKTHROUGH_EVENT));
}
