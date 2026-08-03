import { useState } from "react";

export const PROVIDER_INFO: Record<
  string,
  { label: string; full: string; domain?: string }
> = {
  jamb: { label: "JAMB", full: "Joint Admissions & Matriculation Board", domain: "jamb.gov.ng" },
  waec: { label: "WAEC", full: "West African Examinations Council", domain: "waecnigeria.org" },
  neco: { label: "NECO", full: "National Examinations Council", domain: "neco.gov.ng" },
  nabteb: {
    label: "NABTEB",
    full: "National Business & Technical Examinations Board",
    domain: "nabtebnigeria.org",
  },
  admission: { label: "Admissions", full: "University & admission support" },
};

export const providerInfo = (key: string) =>
  PROVIDER_INFO[key] ?? { label: key.toUpperCase(), full: key };

type Props = {
  provider: string;
  className?: string;
};

export const ProviderLogo = ({ provider, className = "h-10 w-10" }: Props) => {
  const info = providerInfo(provider);
  const [failed, setFailed] = useState(false);

  if (!info.domain || failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-md border bg-muted text-[10px] font-bold text-foreground ${className}`}
      >
        {info.label.slice(0, 4)}
      </div>
    );
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?domain=${info.domain}&sz=128`}
      alt={`${info.label} logo`}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`rounded-md border bg-card object-contain p-1 ${className}`}
    />
  );
};

export default ProviderLogo;
