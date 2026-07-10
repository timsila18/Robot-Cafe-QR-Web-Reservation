import { ok } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const withTimeout = async <T,>(promise: Promise<T>, ms: number, label: string) => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export async function GET() {
  const startedAt = Date.now();
  const checks: Record<string, { message?: string; ok: boolean }> = {};
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    checks.database = { ok: false, message: "Supabase is not configured." };
  } else {
    try {
      const result = await withTimeout(
        Promise.resolve(supabase.from("branches").select("id", { count: "exact", head: true })),
        4000,
        "Database check",
      );
      const error = result.error;
      checks.database = error ? { ok: false, message: error.message } : { ok: true };
    } catch (error) {
      checks.database = { ok: false, message: error instanceof Error ? error.message : String(error) };
    }
  }

  const cpanelBase = process.env.CPANEL_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_CPANEL_PUBLIC_BASE_URL;
  if (cpanelBase) {
    try {
      const response = await withTimeout(fetch(cpanelBase, { method: "HEAD", cache: "no-store" }), 4000, "cPanel check");
      checks.imageStorage = { ok: response.ok || response.status === 403 || response.status === 404, message: `HTTP ${response.status}` };
    } catch (error) {
      checks.imageStorage = { ok: false, message: error instanceof Error ? error.message : String(error) };
    }
  } else {
    checks.imageStorage = { ok: false, message: "cPanel public image base URL is not configured." };
  }

  const healthy = Object.values(checks).every((check) => check.ok);
  return ok({
    checks,
    healthy,
    service: "robot-cafe-digital-dining",
    timestamp: new Date().toISOString(),
    uptimeMs: Date.now() - startedAt,
  }, { status: healthy ? 200 : 503 });
}
