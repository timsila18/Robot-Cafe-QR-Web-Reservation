import { Suspense } from "react";
import { FeedbackForm } from "@/components/feedback-form";
import { PublicLayout } from "@/components/public-layout";

export const metadata = {
  title: "Feedback | Robot Cafe",
  description: "Share your Robot Cafe digital dining, food, service, and ambience feedback.",
};

export default function FeedbackPage() {
  return (
    <PublicLayout>
      <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-gold">Robot Cafe Feedback</p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950 sm:text-5xl">Tell us how the experience felt</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">Your feedback helps Robot Cafe refine food, service, ambience, and the digital dining journey.</p>
        </div>
        <Suspense fallback={<div className="luxury-panel mx-auto h-96 max-w-4xl animate-pulse" />}>
          <FeedbackForm />
        </Suspense>
      </section>
    </PublicLayout>
  );
}
