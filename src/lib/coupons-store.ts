// ─── Coupons Store ────────────────────────────────────────────
// In-memory store for coupons (no filesystem — works on Vercel).
// For production, coupons should be stored in the database.

export interface Coupon {
  code: string;
  discount: number;
  type: "percentage" | "flat";
  active: boolean;
  usageCount: number;
}

// In-memory state — persists within the serverless function lifecycle
let _coupons: Coupon[] | null = null;

const DEFAULT_COUPONS: Coupon[] = [
  { code: "CREATOR20", discount: 20, type: "percentage", active: true, usageCount: 42 },
  { code: "SAASSTART", discount: 100, type: "flat", active: true, usageCount: 15 },
  { code: "LAUNCHFREE", discount: 100, type: "percentage", active: false, usageCount: 5 },
];

export function getCoupons(): Coupon[] {
  if (_coupons === null) {
    _coupons = [...DEFAULT_COUPONS];
  }
  return _coupons;
}

export function saveCoupons(coupons: Coupon[]): void {
  _coupons = coupons;
}

export function addCoupon(coupon: Coupon): Coupon[] {
  const current = getCoupons();
  if (current.some((c) => c.code.toUpperCase() === coupon.code.toUpperCase())) {
    throw new Error("Coupon code already exists");
  }
  const updated = [...current, { ...coupon, code: coupon.code.toUpperCase() }];
  saveCoupons(updated);
  return updated;
}

export function toggleCoupon(code: string): Coupon[] {
  const current = getCoupons();
  const updated = current.map((c) =>
    c.code.toUpperCase() === code.toUpperCase() ? { ...c, active: !c.active } : c
  );
  saveCoupons(updated);
  return updated;
}

export function deleteCoupon(code: string): Coupon[] {
  const current = getCoupons();
  const updated = current.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
  saveCoupons(updated);
  return updated;
}
