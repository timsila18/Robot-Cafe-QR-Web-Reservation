"use client";

import { useMemo, useState } from "react";
import type { AdminBranch } from "@/lib/admin-store";
import { readDemoBranches } from "@/lib/demo-persistence";

type QrTarget = {
  label: string;
  url: string;
};

type QrFormat = "svg" | "png";

export function AdminQrManager({ branches }: { branches: AdminBranch[] }) {
  const [activeBranches] = useState(() => readDemoBranches(branches));
  const origin = typeof window === "undefined" ? "https://qr.robotcafe.co.ke" : window.location.origin;
  const [version, setVersion] = useState(0);
  const targets = useMemo<QrTarget[]>(() => [
    { label: "Robot Cafe Digital Dining Menu", url: `${origin}/menu` },
    ...activeBranches.map((branch) => ({ label: `Robot Cafe ${branch.name.replace("Robot Cafe - ", "")} Digital Menu`, url: `${origin}/menu/${branch.slug}` })),
  ], [activeBranches, origin]);
  const [copied, setCopied] = useState("");

  const download = async (target: QrTarget, type: QrFormat) => {
    const assetUrl = type === "png" ? await brandedPngUrl(target, version) : brandedSvgUrl(target, version);
    const link = document.createElement("a");
    link.href = assetUrl;
    link.download = `${slug(target.label)}-robot-cafe-qr.${type}`;
    link.click();
    if (type === "png") {
      window.setTimeout(() => URL.revokeObjectURL(assetUrl), 1200);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-slate-950">QR Code Management</h2>
        <p className="mt-3 text-sm text-slate-500">Generate branch-ready Robot Cafe QR cards with a futuristic golden dining finish.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {targets.map((target) => (
          <article className="overflow-hidden rounded-[26px] border border-gold/25 bg-[radial-gradient(circle_at_top,rgba(216,169,40,.22),transparent_34%),linear-gradient(145deg,#02060d,#071827_58%,#02060d)] p-4 text-white shadow-[0_28px_90px_rgba(0,0,0,.34)]" key={target.url}>
            <div className="rounded-[22px] border border-gold/30 bg-[#fff8e2] p-4 text-center shadow-[inset_0_0_40px_rgba(216,169,40,.16)]">
              <div className="rounded-2xl border border-[#d8a928]/28 bg-[linear-gradient(180deg,#081522,#02060d)] px-4 py-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.36em] text-gold">Digital Dining</p>
                <h3 className="mt-2 text-balance text-xl font-black leading-tight">{target.label}</h3>
                <p className="mt-1 text-xs font-semibold text-[#9fd8ff]">Scan. Choose. Dine elevated.</p>
              </div>
              <div className="mx-auto mt-4 max-w-[260px] rounded-[22px] border border-[#d8a928]/35 bg-white p-3 shadow-[0_20px_55px_rgba(2,6,13,.18)]">
              {/* Production can replace this public generator with server-side QR rendering if strict offline generation is required. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${target.label} preview`} className="aspect-square w-full rounded-xl object-contain" src={qrAssetUrl(target.url, "svg", version)} />
              </div>
              <p className="mt-4 text-[10px] font-black uppercase tracking-[0.32em] text-[#071827]">Robot Cafe QR Experience</p>
            </div>
            <p className="mt-4 break-all rounded-2xl border border-white/10 bg-white/8 p-3 text-xs font-medium text-[#d7e7f8]">{target.url}</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button className="ghost-button min-h-10 border-white/15 bg-white/10 px-2 text-xs text-white hover:bg-white/15" type="button" onClick={() => void download(target, "png")}>Download PNG</button>
              <button className="ghost-button min-h-10 border-white/15 bg-white/10 px-2 text-xs text-white hover:bg-white/15" type="button" onClick={() => void download(target, "svg")}>Download SVG</button>
              <button className="ghost-button min-h-10 border-white/15 bg-white/10 px-2 text-xs text-white hover:bg-white/15" type="button" onClick={() => { void navigator.clipboard.writeText(target.url); setCopied(target.label); }}>Copy URL</button>
              <button className="ghost-button min-h-10 border-white/15 bg-white/10 px-2 text-xs text-white hover:bg-white/15" type="button" onClick={() => { setVersion((current) => current + 1); setCopied(`Regenerated ${target.label}`); }}>Regenerate</button>
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
  return `https://api.qrserver.com/v1/create-qr-code/?size=720x720&format=${format}&color=071827&bgcolor=fff8e2&data=${encodeURIComponent(value)}&v=${version}`;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function brandedSvgUrl(target: QrTarget, version: number) {
  const qr = qrAssetUrl(target.url, "svg", version);
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1480" viewBox="0 0 1080 1480">
  <defs>
    <radialGradient id="a" cx="50%" cy="0%" r="78%"><stop offset="0" stop-color="#1b5f96"/><stop offset=".36" stop-color="#071827"/><stop offset="1" stop-color="#02060d"/></radialGradient>
    <linearGradient id="g" x1="0" x2="1"><stop stop-color="#fff2b0"/><stop offset=".55" stop-color="#d8a928"/><stop offset="1" stop-color="#8a6414"/></linearGradient>
  </defs>
  <rect width="1080" height="1480" rx="72" fill="url(#a)"/>
  <rect x="42" y="42" width="996" height="1396" rx="56" fill="none" stroke="#d8a928" stroke-opacity=".55" stroke-width="3"/>
  <text x="540" y="150" text-anchor="middle" fill="#d8a928" font-family="Arial, sans-serif" font-size="30" font-weight="800" letter-spacing="12">ROBOT CAFE</text>
  <text x="540" y="235" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="56" font-weight="900">${escapeSvg(target.label)}</text>
  <text x="540" y="302" text-anchor="middle" fill="#9fd8ff" font-family="Arial, sans-serif" font-size="28" font-weight="700">Golden QR rendezvous for premium digital dining</text>
  <rect x="190" y="395" width="700" height="700" rx="48" fill="#fff8e2" stroke="url(#g)" stroke-width="12"/>
  <image href="${qr}" x="235" y="440" width="610" height="610"/>
  <text x="540" y="1190" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="900">Scan to open the menu</text>
  <text x="540" y="1250" text-anchor="middle" fill="#d8a928" font-family="Arial, sans-serif" font-size="24" font-weight="800">${escapeSvg(target.url)}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function brandedPngUrl(target: QrTarget, version: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1480;
  const context = canvas.getContext("2d");
  if (!context) return qrAssetUrl(target.url, "png", version);

  const qrImage = await loadImage(qrAssetUrl(target.url, "png", version));
  const gradient = context.createLinearGradient(0, 0, 1080, 1480);
  gradient.addColorStop(0, "#071827");
  gradient.addColorStop(0.45, "#02060d");
  gradient.addColorStop(1, "#06111f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1480);
  context.strokeStyle = "#d8a928";
  context.lineWidth = 5;
  roundRect(context, 42, 42, 996, 1396, 56);
  context.stroke();
  context.textAlign = "center";
  context.fillStyle = "#d8a928";
  context.font = "800 30px Arial";
  context.fillText("ROBOT CAFE", 540, 150);
  context.fillStyle = "#ffffff";
  context.font = "900 56px Arial";
  wrapText(context, target.label, 540, 235, 860, 62);
  context.fillStyle = "#9fd8ff";
  context.font = "700 28px Arial";
  context.fillText("Golden QR rendezvous for premium digital dining", 540, 330);
  context.fillStyle = "#fff8e2";
  roundRect(context, 190, 395, 700, 700, 48);
  context.fill();
  context.strokeStyle = "#d8a928";
  context.lineWidth = 12;
  context.stroke();
  context.drawImage(qrImage, 235, 440, 610, 610);
  context.fillStyle = "#ffffff";
  context.font = "900 34px Arial";
  context.fillText("Scan to open the menu", 540, 1190);
  context.fillStyle = "#d8a928";
  context.font = "800 24px Arial";
  context.fillText(target.url, 540, 1250);

  const blob = await new Promise<Blob>((resolve) => canvas.toBlob((value) => resolve(value as Blob), "image/png", 0.95));
  return URL.createObjectURL(blob);
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  words.forEach((word) => {
    const next = `${line} ${word}`.trim();
    if (context.measureText(next).width > maxWidth && line) {
      context.fillText(line, x, y);
      y += lineHeight;
      line = word;
    } else {
      line = next;
    }
  });
  context.fillText(line, x, y);
}

function escapeSvg(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
