import { fail, ok } from "@/lib/api-response";
import { getSystemSettings, updateSystemSettings } from "@/lib/system-settings";
import { recordAudit } from "@/lib/rbac";

export async function GET() {
  return ok(getSystemSettings());
}

export async function PUT(request: Request) {
  try {
    const oldValue = getSystemSettings();
    const next = await request.json();
    const updated = updateSystemSettings(next);
    recordAudit("Settings Updated", "system_settings", "robot-cafe", oldValue, updated);
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}
