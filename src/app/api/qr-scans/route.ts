import { fail, ok } from "@/lib/api-response";
import { createQrScan, detectDevice, listQrScans } from "@/lib/dining-intelligence";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { qrScanSchema } from "@/lib/validation";

export async function GET() {
  return ok(listQrScans());
}

export async function POST(request: Request) {
  try {
    const detected = detectDevice(request.headers.get("user-agent") ?? "");
    const scan = qrScanSchema.parse(await request.json());
    const payload = {
      ...scan,
      route: scan.route || scan.page,
      deviceType: scan.deviceType === "unknown" ? detected.deviceType : scan.deviceType,
      browser: scan.browser === "unknown" ? detected.browser : scan.browser,
      os: scan.os === "unknown" ? detected.os : scan.os,
      referrer: scan.referrer || request.headers.get("referer") || "",
      sessionId: scan.sessionId || crypto.randomUUID(),
    };
    const supabase = createSupabaseServerClient();
    if (supabase) {
      const { data, error } = await supabase
        .from("qr_scans")
        .insert({
          branch_id: payload.branchId || null,
          route: payload.route,
          page: payload.page,
          device_type: payload.deviceType,
          device: payload.deviceType,
          browser: payload.browser,
          os: payload.os,
          session_id: payload.sessionId,
          referrer: payload.referrer,
          item_id: payload.itemId || null,
          category_id: payload.categoryId || null,
          search_query: payload.searchQuery || null,
          country: payload.country || null,
          city: payload.city || null,
        })
        .select("*")
        .single();
      if (error) throw new Error(`Unable to save QR event: ${error.message}`);
      return ok(data, { status: 201 });
    }
    return ok(
      createQrScan(payload),
      { status: 201 },
    );
  } catch (error) {
    return fail(error);
  }
}
