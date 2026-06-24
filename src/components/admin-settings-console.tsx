"use client";

import { useState } from "react";
import type { SystemSettings } from "@/lib/system-settings";

export function AdminSettingsConsole({ initialSettings }: { initialSettings: SystemSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [toast, setToast] = useState("");
  const save = async () => {
    const response = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setToast(response.ok ? "Settings saved." : "Unable to save settings.");
    window.setTimeout(() => setToast(""), 2400);
  };
  const update = <T extends keyof SystemSettings>(section: T, patch: Partial<SystemSettings[T]>) =>
    setSettings((current) => ({ ...current, [section]: { ...current[section], ...patch } }));

  return (
    <div className="space-y-6">
      {toast ? <div className="fixed right-5 top-24 z-50 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-2xl">{toast}</div> : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-slate-950">System Settings</h2>
          <p className="mt-3 text-sm text-slate-500">General, branding, security, analytics, and feature controls.</p>
        </div>
        <button className="premium-button" type="button" onClick={() => void save()}>Save Settings</button>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="General">
          <Field label="Platform Name" value={settings.general.platformName} onChange={(value) => update("general", { platformName: value })} />
          <Field label="Contact Email" value={settings.general.contactEmail} onChange={(value) => update("general", { contactEmail: value })} />
          <Field label="Contact Phone" value={settings.general.contactPhone} onChange={(value) => update("general", { contactPhone: value })} />
          <Field label="Footer Text" value={settings.general.footerText} onChange={(value) => update("general", { footerText: value })} />
        </Panel>
        <Panel title="Branding">
          <Field label="Logo URL" value={settings.branding.logoUrl} onChange={(value) => update("branding", { logoUrl: value })} />
          <Field label="Favicon URL" value={settings.branding.faviconUrl} onChange={(value) => update("branding", { faviconUrl: value })} />
          <Field label="Primary Colour" type="color" value={settings.branding.primaryColour} onChange={(value) => update("branding", { primaryColour: value })} />
          <Field label="Secondary Colour" type="color" value={settings.branding.secondaryColour} onChange={(value) => update("branding", { secondaryColour: value })} />
          <Field label="Accent Colour" type="color" value={settings.branding.accentColour} onChange={(value) => update("branding", { accentColour: value })} />
        </Panel>
        <Panel title="Security">
          <Field label="Session Hours" type="number" value={String(settings.security.sessionHours)} onChange={(value) => update("security", { sessionHours: Number(value) })} />
          <Field label="Audit Retention Days" type="number" value={String(settings.security.auditRetentionDays)} onChange={(value) => update("security", { auditRetentionDays: Number(value) })} />
          <Toggle label="Require Strong Passwords" checked={settings.security.requireStrongPasswords} onChange={(value) => update("security", { requireStrongPasswords: value })} />
        </Panel>
        <Panel title="Feature Flags">
          {Object.entries(settings.features).map(([key, value]) => (
            <Toggle key={key} label={labelize(key)} checked={Boolean(value)} onChange={(checked) => update("features", { [key]: checked } as Partial<SystemSettings["features"]>)} />
          ))}
        </Panel>
      </section>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="luxury-panel space-y-4 p-5"><h3 className="text-xl font-semibold text-slate-950">{title}</h3>{children}</section>;
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; type?: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-gold" type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"><span>{label}</span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}

function labelize(value: string) {
  return value.replace(/^enable/, "").replace(/([A-Z])/g, " $1").trim();
}
