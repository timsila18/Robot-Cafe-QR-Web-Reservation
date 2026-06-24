"use client";

import { useMemo, useState } from "react";
import { branches } from "@/lib/demo-data";

type QrTarget = {
  label: string;
  url: string;
};

export function AdminQrManager() {
  const origin = typeof window === "undefined" ? "https://qr.robotcafe.co.ke" : window.location.origin;
  const [version, setVersion] = useState(0);
  const targets = useMemo<QrTarget[]>(() => [
    { label: "General Menu QR", url: `${origin}/menu` },
    ...branches.map((branch) => ({ label: `${branch.name.replace("Robot Cafe - ", "")} QR`, url: `${origin}/menu/${branch.slug}` })),
  ], [origin]);
  const [copied, setCopied] = useState("");

  const download = (target: QrTarget, type: "svg" | "png") => {
    const link = document.createElement("a");
    link.href = qrAssetUrl(target.url, type, version);
    link.download = `${slug(target.label)}.${type}`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-950">QR Code Management</h2>
        <p className="mt-3 text-sm text-slate-500">Generate branch-ready Robot Cafe QR assets for print, signage, and table placement.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {targets.map((target) => (
          <article className="luxury-panel overflow-hidden p-5" key={target.url}>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              {/* Production can replace this public generator with server-side QR rendering if strict offline generation is required. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`${target.label} preview`} className="aspect-square w-full rounded-xl object-contain" src={qrAssetUrl(target.url, "svg", version)} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-950">{target.label}</h3>
            <p className="mt-2 break-all text-xs text-slate-500">{target.url}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="ghost-button min-h-10 px-2 text-xs" type="button" onClick={() => download(target, "png")}>Download PNG</button>
              <button className="ghost-button min-h-10 px-2 text-xs" type="button" onClick={() => download(target, "svg")}>Download SVG</button>
              <button className="ghost-button min-h-10 px-2 text-xs" type="button" onClick={() => { void navigator.clipboard.writeText(target.url); setCopied(target.label); }}>Copy URL</button>
              <button className="ghost-button min-h-10 px-2 text-xs" type="button" onClick={() => { setVersion((current) => current + 1); setCopied(`Regenerated ${target.label}`); }}>Regenerate</button>
            </div>
            {copied === target.label || copied === `Regenerated ${target.label}` ? <p className="mt-3 text-xs font-semibold text-success">{copied}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function qrAssetUrl(value: string, type: "svg" | "png", version: number) {
  const format = type === "svg" ? "svg" : "png";
  return `https://api.qrserver.com/v1/create-qr-code/?size=720x720&format=${format}&color=0877bd&bgcolor=ffffff&data=${encodeURIComponent(value)}&v=${version}`;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
