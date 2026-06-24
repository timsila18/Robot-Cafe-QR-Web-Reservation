export const diningFeatureFlags = {
  enableReservations: false,
  enableOrdering: false,
  enableWaiterCall: false,
  enableMpesa: false,
  enableLoyalty: false,
  enableGiftCards: false,
};

export const futureDiningFeatures = [
  { key: "enableWaiterCall", label: "Call Waiter", description: "Guest table assistance from the digital menu." },
  { key: "enableOrdering", label: "Table Ordering", description: "Send selected items to branch operations." },
  { key: "enableReservations", label: "Reserve Table", description: "Book Robot Cafe branch seating." },
  { key: "enableMpesa", label: "Pay with M-Pesa", description: "Mobile checkout for future ordering." },
  { key: "enableLoyalty", label: "Loyalty Program", description: "Member rewards and visit recognition." },
  { key: "enableGiftCards", label: "Gift Cards", description: "Digital gifting for Robot Cafe guests." },
] as const;

export type DiningFeatureKey = keyof typeof diningFeatureFlags;
