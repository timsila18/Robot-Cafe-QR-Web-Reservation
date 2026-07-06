import { Suspense } from "react";
import { PublicLayout } from "@/components/public-layout";
import { ReservationForm } from "@/components/reservation-form";

export const metadata = {
  title: "Reservations | Robot Cafe",
  description: "Request a Robot Cafe branch reservation and notify the right branch team.",
};

export default function ReservationsPage() {
  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-gold">Robot Cafe Reservations</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Reserve your branch experience</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Select a branch and the reservation request is routed to the matching Robot Cafe inbox.
          </p>
        </div>
        <Suspense fallback={<div className="luxury-panel mx-auto h-96 max-w-4xl animate-pulse" />}>
          <ReservationForm />
        </Suspense>
      </section>
    </PublicLayout>
  );
}

