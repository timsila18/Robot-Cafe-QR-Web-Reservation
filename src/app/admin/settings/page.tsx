import { AdminSettingsConsole } from "@/components/admin-settings-console";
import { getSystemSettings } from "@/lib/system-settings";

export default function AdminSettingsPage() {
  return <AdminSettingsConsole initialSettings={getSystemSettings()} />;
}
