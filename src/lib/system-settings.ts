import { diningFeatureFlags } from "@/lib/feature-flags";

export type SystemSettings = {
  general: {
    platformName: string;
    contactEmail: string;
    contactPhone: string;
    footerText: string;
  };
  branding: {
    logoUrl: string;
    faviconUrl: string;
    primaryColour: string;
    secondaryColour: string;
    accentColour: string;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    x: string;
  };
  security: {
    requireStrongPasswords: boolean;
    sessionHours: number;
    auditRetentionDays: number;
  };
  features: typeof diningFeatureFlags & {
    enableReviews: boolean;
    enablePromotions: boolean;
    enableDelivery: boolean;
    enableKitchenDisplay: boolean;
    enableInventoryIntegration: boolean;
    enablePosIntegration: boolean;
  };
};

let settings: SystemSettings = {
  general: {
    platformName: "Robot Cafe Digital Dining Platform",
    contactEmail: "hello@robotcafe.co.ke",
    contactPhone: "+254 700 000 000",
    footerText: "Premium digital dining by Robot Cafe.",
  },
  branding: {
    logoUrl: "/robot-cafe-logo.png",
    faviconUrl: "/favicon.ico",
    primaryColour: "#0877bd",
    secondaryColour: "#00b050",
    accentColour: "#f5b301",
  },
  socialLinks: {
    instagram: "https://instagram.com/robotcafe",
    facebook: "https://facebook.com/robotcafe",
    x: "https://x.com/robotcafe",
  },
  security: {
    requireStrongPasswords: true,
    sessionHours: 8,
    auditRetentionDays: 365,
  },
  features: {
    ...diningFeatureFlags,
    enableReviews: true,
    enablePromotions: true,
    enableDelivery: false,
    enableKitchenDisplay: false,
    enableInventoryIntegration: false,
    enablePosIntegration: false,
  },
};

export function getSystemSettings() {
  return settings;
}

export function updateSystemSettings(next: SystemSettings) {
  settings = next;
  return settings;
}
