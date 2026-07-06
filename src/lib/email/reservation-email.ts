import { branches } from "@/lib/demo-data";
import type { ReservationRecord } from "@/lib/reservations";

type SendReservationEmailResult = {
  status: "sent" | "not_configured" | "failed";
  recipient?: string;
  message?: string;
};

const envKeyForBranch = (slug: string) => `${slug.toUpperCase().replaceAll("-", "_")}_RESERVATION_EMAIL`;

const escapeHtml = (value: string | number | undefined) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export function reservationRecipientForBranch(branchId: string) {
  const branch = branches.find((entry) => entry.id === branchId);
  if (!branch) throw new Error("Reservation branch not found.");
  return {
    branch,
    recipient: process.env[envKeyForBranch(branch.slug)] || branch.email,
  };
}

function reservationHtml(reservation: ReservationRecord, branchName: string) {
  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#06111f;color:#0f172a;padding:24px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dbeafe">
        <div style="background:#071827;color:#ffffff;padding:24px">
          <p style="margin:0;color:#6dc6ff;font-size:12px;letter-spacing:3px;text-transform:uppercase">Robot Cafe Reservation</p>
          <h1 style="margin:12px 0 0;font-size:28px">New reservation request</h1>
        </div>
        <div style="padding:24px">
          <p style="margin:0 0 18px;color:#475569">A guest submitted a reservation for <strong>${escapeHtml(branchName)}</strong>.</p>
          <table style="width:100%;border-collapse:collapse">
            ${[
              ["Guest", reservation.name],
              ["Phone", reservation.phone],
              ["Email", reservation.email || "Not provided"],
              ["Branch", branchName],
              ["Date", reservation.reservationDate],
              ["Time", reservation.reservationTime],
              ["Guests", reservation.guests],
              ["Occasion", reservation.occasion || "Not specified"],
              ["Notes", reservation.notes || "No notes"],
            ]
              .map(
                ([label, value]) => `
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:13px">${escapeHtml(label)}</td>
                    <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#0f172a;font-weight:700;text-align:right">${escapeHtml(value)}</td>
                  </tr>
                `,
              )
              .join("")}
          </table>
          <p style="margin:22px 0 0;color:#64748b;font-size:13px">Please contact the guest to confirm the table.</p>
        </div>
      </div>
    </div>
  `;
}

export async function sendReservationEmail(reservation: ReservationRecord): Promise<SendReservationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESERVATION_FROM_EMAIL || "Robot Cafe <onboarding@resend.dev>";
  const requireEmail = process.env.REQUIRE_RESERVATION_EMAIL === "true";
  const { branch, recipient } = reservationRecipientForBranch(reservation.branchId);
  const branchName = branch.name.replace("Robot Cafe - ", "");

  if (!apiKey) {
    if (requireEmail) throw new Error("RESEND_API_KEY is required before accepting reservations.");
    return { status: "not_configured", recipient, message: "RESEND_API_KEY is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      reply_to: reservation.email || undefined,
      subject: `New ${branchName} reservation - ${reservation.reservationDate} ${reservation.reservationTime}`,
      html: reservationHtml(reservation, branchName),
    }),
  });

  if (!response.ok) {
    const payload = await response.text();
    if (requireEmail) throw new Error(`Reservation email failed: ${payload}`);
    return { status: "failed", recipient, message: payload };
  }

  return { status: "sent", recipient };
}

