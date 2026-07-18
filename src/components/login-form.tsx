"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("admin@robotcafe.co.ke");
  const [password, setPassword] = useState("RobotCafe@2026");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "Unable to sign in.");
      return;
    }

    window.location.assign(searchParams.get("next") ?? payload.data.redirectTo ?? "/admin");
  };

  return (
    <div className="mx-auto grid min-h-[76vh] w-full max-w-md place-items-center">
      <form className="luxury-panel w-full overflow-hidden p-0" onSubmit={submit}>
        <div className="premium-surface p-6">
        <BrandMark imageClassName="w-52" />
        <h1 className="mt-8 text-3xl font-semibold text-white">Admin Login</h1>
        <p className="mt-2 text-sm leading-6 text-white/64">
          Secure access for Robot Cafe menu operations.
        </p>
        </div>
        <div className="p-6">
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <button className="premium-button mt-6 w-full" disabled={isLoading} type="submit">
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
        </div>
      </form>
    </div>
  );
}
