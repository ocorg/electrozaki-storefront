// Where a phone order's 300 DH reservation advance can be sent (cart page).
// The account details are the shop's own, given by the owner on 2026-10-14.
// Labels are shown as is: "RIB", "IBAN" and "SWIFT" read the same in every
// language. Only CIH needs the holder's name; CashPlus and Al Barid Bank
// need the number alone.

export type PaymentAccount = {
  key: string;
  name: string;
  logo: { src: string; width: number; height: number };
  /** shown only where the owner gave it */
  holder?: string;
  details: { label: "RIB" | "IBAN" | "SWIFT"; value: string }[];
};

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    key: "cih",
    name: "CIH Bank",
    logo: { src: "/payments/cih-bank.png", width: 337, height: 96 },
    holder: "M. ZAKARIAE BOUHASSANI",
    details: [
      { label: "RIB", value: "230 480 604308321 1009200 78" },
      { label: "IBAN", value: "MA64 2304 8060 4308 3211 0092 0078" },
      { label: "SWIFT", value: "CIHMMAMC" },
    ],
  },
  {
    key: "cashplus",
    name: "CashPlus",
    logo: { src: "/payments/cashplus.png", width: 215, height: 63 },
    details: [{ label: "RIB", value: "835 780 0300177306579144 07" }],
  },
  {
    key: "barid",
    name: "Al Barid Bank",
    logo: { src: "/payments/al-barid-bank.png", width: 71, height: 96 },
    // Al Barid Bank account numbers are 8 digits; that is the full RIB.
    details: [{ label: "RIB", value: "12678252" }],
  },
];
