"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

const SUPPORTED_CURRENCIES = [
  { code: "PHP", label: "Philippine Peso" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "SGD", label: "Singapore Dollar" },
  { code: "KRW", label: "Korean Won" },
] as const;

// Exchange rates: 1 PHP = X target currency (approximate)
const RATES_FROM_PHP: Record<string, number> = {
  PHP: 1,
  USD: 0.0175,
  EUR: 0.0162,
  GBP: 0.0139,
  JPY: 2.65,
  AUD: 0.0272,
  SGD: 0.0235,
  KRW: 24.5,
};

interface CurrencyContextType {
  currency: string;
  setCurrency: (code: string) => void;
  currencies: typeof SUPPORTED_CURRENCIES;
  formatPrice: (amount: number, sourceCurrency?: string) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "PHP",
  setCurrency: () => {},
  currencies: SUPPORTED_CURRENCIES,
  formatPrice: (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount),
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState("PHP");

  // Load saved preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("currency");
      if (saved && RATES_FROM_PHP[saved]) setCurrencyState(saved);
    } catch {}
  }, []);

  const setCurrency = useCallback((code: string) => {
    setCurrencyState(code);
    try { localStorage.setItem("currency", code); } catch {}
  }, []);

  const formatPrice = useCallback(
    (amount: number, sourceCurrency = "PHP") => {
      const sourceRate = RATES_FROM_PHP[sourceCurrency] || 1;
      const targetRate = RATES_FROM_PHP[currency] || 1;
      // Convert: source → PHP → target
      const converted = (amount / sourceRate) * targetRate;

      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(converted);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider
      value={{ currency, setCurrency, currencies: SUPPORTED_CURRENCIES, formatPrice }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

/* ── Reusable dropdown selector ── */

export function CurrencySelector({
  variant = "header",
  scrolled = false,
  light = false,
}: {
  variant?: "header" | "footer";
  scrolled?: boolean;
  light?: boolean;
}) {
  const { currency, setCurrency, currencies } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isHeader = variant === "header";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={
          isHeader
            ? `text-sm font-medium flex items-center gap-x-1.5 transition-colors ${
                scrolled || light
                  ? "text-sage-700 hover:text-sage-800"
                  : "text-white/80 hover:text-white"
              }`
            : "text-xs text-sage-400 hover:text-sage-300 transition-colors flex items-center gap-x-1"
        }
      >
        {currency}
        <svg
          className={`${isHeader ? "size-3" : "size-3"} transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-48 rounded-xl shadow-xl border overflow-hidden ${
            isHeader
              ? "left-0 bg-white border-cream-200"
              : "bottom-full mb-2 left-0 bg-sage-800 border-white/10"
          }`}
        >
          {currencies.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                isHeader
                  ? `hover:bg-sage-50 ${
                      currency === c.code
                        ? "text-sage-800 font-semibold bg-sage-50"
                        : "text-sage-600"
                    }`
                  : `hover:bg-white/10 ${
                      currency === c.code
                        ? "text-white font-semibold bg-white/10"
                        : "text-sage-300"
                    }`
              }`}
            >
              <span>
                {c.code}{" "}
                <span className={isHeader ? "text-cream-400" : "text-sage-500"}>
                  {c.label}
                </span>
              </span>
              {currency === c.code && (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
