export function TargetIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="4.2" stroke="#191919" strokeWidth="1.2" />
      <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="#191919" strokeWidth="1.2" />
      <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#191919" strokeWidth="1.2" />
    </svg>
  );
}

export function StoreHeader({ storeName = "Mercado Aurora", variant = "default", onBrandClick }) {
  return (
    <header className="wa-header">
      <button
        type="button"
        className="wa-brand-btn"
        onClick={onBrandClick}
        aria-label="Voltar para início Ach.ai"
      >
        Ach.ai
      </button>
      <div className={`wa-store-pill wa-store-pill--${variant}`}>
        <span className="wa-store-pill__icon">
          <TargetIcon />
        </span>
        <span className={`wa-store-pill__label ${variant === "route" ? "wa-font-rubik" : ""}`}>
          {storeName}
        </span>
      </div>
    </header>
  );
}
