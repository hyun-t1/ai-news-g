export function isManualSyncEnabled() {
  return !process.env.CRON_SECRET && process.env.NODE_ENV !== "production";
}

export function isAuthorizedSyncRequest(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${secret}`;
}
