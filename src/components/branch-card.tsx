import Link from "next/link";
import type { Branch } from "@/lib/demo-data";

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="group flex min-h-72 flex-col justify-between rounded-[22px] border border-white/10 bg-[linear-gradient(145deg,rgba(7,24,39,.92),rgba(8,55,86,.78))] p-6 shadow-[0_24px_70px_rgba(0,0,0,.24)] transition duration-300 hover:-translate-y-2 hover:border-[#168df2]/50 hover:shadow-[0_28px_90px_rgba(8,119,189,0.22)]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[#6dc6ff]">Robot Cafe</p>
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
