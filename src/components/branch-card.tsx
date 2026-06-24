import Link from "next/link";
import type { Branch } from "@/lib/demo-data";

export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <article className="group luxury-panel flex min-h-72 flex-col justify-between p-6 transition duration-300 hover:-translate-y-2 hover:border-gold/30 hover:shadow-[0_28px_90px_rgba(8,119,189,0.14)]">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Robot Cafe</p>
        <h2 className="mt-5 text-3xl font-semibold text-slate-950">{branch.name.replace("Robot Cafe - ", "")}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">{branch.location}</p>
      </div>
      <Link className="premium-button mt-8" href={`/menu/${branch.slug}`}>
        Enter Branch
      </Link>
    </article>
  );
}
