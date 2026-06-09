export const FIRST_LOGIN_WALKTHROUGH_EVENT = "trustedbums:open-first-login-walkthrough";

export function openFirstLoginWalkthrough() {
  window.dispatchEvent(new Event(FIRST_LOGIN_WALKTHROUGH_EVENT));
}
