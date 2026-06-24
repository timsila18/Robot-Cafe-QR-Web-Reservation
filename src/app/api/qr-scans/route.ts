import { fail, ok } from "@/lib/api-response";
import { createQrScan, detectDevice, listQrScans } from "@/lib/dining-intelligence";
import { qrScanSchema } from "@/lib/validation";

export async function GET() {
  return ok(listQrScans());
}

export async function POST(request: Request) {
  try {
    const detected = detectDevice(request.headers.get("user-agent") ?? "");
    const scan = qrScanSchema.parse(await request.json());
    return ok(
      createQrScan({
        ...scan,
        route: scan.route || scan.page,
        deviceType: scan.deviceType === "unknown" ? detected.deviceType : scan.deviceType,
        browser: scan.browser === "unknown" ? detected.browser : scan.browser,
        os: scan.os === "unknown" ? detected.os : scan.os,
        referrer: scan.referrer || request.headers.get("referer") || "",
        sessionId: scan.sessionId || crypto.randomUUID(),
      }),
      { status: 201 },
    );
  } catch (error) {
    return fail(error);
  }
}
