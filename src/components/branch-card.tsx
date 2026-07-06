import Link from "next/link";
import type { Branch } from "@/lib/demo-data";

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="group flex min-h-72 flex-col justify-between rounded-[22px] border border-gold/14 bg-[radial-gradient(circle_at_80%_0%,rgba(216,169,40,.16),transparent_15rem),linear-gradient(145deg,rgba(5,14,25,.96),rgba(8,43,67,.78))] p-6 shadow-[0_24px_80px_rgba(0,0,0,.34)] transition duration-300 hover:-translate-y-2 hover:border-gold/45 hover:shadow-[0_28px_90px_rgba(216,169,40,0.14)]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Robot Cafe</p>
        <h2 className="mt-5 text-3xl font-black text-white">{branch.name.replace("Robot Cafe - ", "")}</h2>
        <p className="mt-3 text-sm font-medium leading-6 text-[#d7e7f8]">{branch.location}</p>
      </div>
      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        <Link className="premium-button" href={`/menu/${branch.slug}`}>
          Enter Branch
        </Link>
        <Link className="ghost-button border-white/15 bg-white/10 text-white hover:bg-white/15" href={`/reservations?branch=${branch.slug}`}>
          Reserve
        </Link>
      </div>
    </article>
  );
}
