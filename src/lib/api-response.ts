import { NextResponse } from "next/server";
import { ZodError } from "zod";

function withNoStore(init?: ResponseInit): ResponseInit {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store, no-cache, max-age=0, must-revalidate");
  headers.set("Pragma", "no-cache");
  return { ...init, headers };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, withNoStore(init));
}

export function fail(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: "Validation failed.",
        issues: error.issues,
      },
      withNoStore({ status: 422 }),
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    },
    withNoStore({ status }),
  );
}
