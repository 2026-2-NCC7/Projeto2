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

export function StoreBuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M13.7501 19.2493V14.666C13.7501 14.4229 13.6535 14.1897 13.4816 14.0178C13.3097 13.8459 13.0765 13.7493 12.8334 13.7493H9.16675C8.92363 13.7493 8.69048 13.8459 8.51857 14.0178C8.34666 14.1897 8.25008 14.4229 8.25008 14.666V19.2493M16.2929 9.45014C16.1018 9.26721 15.8475 9.1651 15.5829 9.1651C15.3184 9.1651 15.064 9.26721 14.873 9.45014C14.4467 9.8567 13.8803 10.0835 13.2912 10.0835C12.7022 10.0835 12.1358 9.8567 11.7095 9.45014C11.5185 9.26748 11.2644 9.16554 11 9.16554C10.7357 9.16554 10.4816 9.26748 10.2905 9.45014C9.86425 9.85697 9.29763 10.084 8.70837 10.084C8.11911 10.084 7.55249 9.85697 7.1262 9.45014C6.93511 9.26721 6.68078 9.1651 6.41625 9.1651C6.15171 9.1651 5.89738 9.26721 5.70629 9.45014C5.29456 9.84304 4.75137 10.0687 4.18245 10.0831C4.00811 10.0876 3.83517 10.0721 3.66675 10.0378M3.66675 10.0378C3.28555 9.96011 2.92744 9.78604 2.6284 9.52841C2.19724 9.15694 1.91972 8.63834 1.84986 8.07353C1.78 7.50873 1.92279 6.93813 2.25045 6.47281L4.8987 2.63748C5.06674 2.38953 5.29296 2.18652 5.55758 2.04622C5.82221 1.90592 6.11718 1.83259 6.4167 1.83264H15.5834C15.882 1.83253 16.1762 1.90537 16.4402 2.04484C16.7043 2.18431 16.9303 2.38618 17.0986 2.63289L19.7524 6.47556C20.0801 6.94125 20.2227 7.51228 20.1524 8.07738C20.0821 8.64248 19.804 9.16116 19.3721 9.53236C19.0728 9.7896 18.7146 9.96325 18.3334 10.0405M3.66675 10.0378V10.037M3.66675 10.0378V17.4162C3.66675 17.9024 3.8599 18.3687 4.20372 18.7125C4.54754 19.0563 5.01385 19.2495 5.50008 19.2495H16.5001C16.9863 19.2495 17.4526 19.0563 17.7964 18.7125C18.1403 18.3687 18.3334 17.9024 18.3334 17.4162V10.0405M18.3334 10.0405C18.1646 10.0747 17.9912 10.09 17.8164 10.0853C17.2472 10.0699 16.7041 9.84318 16.2929 9.44922M18.3334 10.0405V10.037"
        stroke="#F26900"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StoreHeader({
  storeName = "Mercado Aurora",
  variant = "default",
  onBrandClick,
  onStoreClick,
}) {
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
      {onStoreClick ? (
        <button
          type="button"
          className={`wa-store-pill wa-store-pill--${variant} wa-store-pill--interactive`}
          onClick={onStoreClick}
          aria-label={`Supermercado da lista: ${storeName}. Toque para trocar de supermercado.`}
        >
          <span className="wa-store-pill__icon">
            <TargetIcon />
          </span>
          <span className={`wa-store-pill__label ${variant === "route" ? "wa-font-rubik" : ""}`}>
            {storeName}
          </span>
          <span className="wa-store-pill__change">Trocar ▾</span>
        </button>
      ) : (
        <div className={`wa-store-pill wa-store-pill--${variant}`}>
          <span className="wa-store-pill__icon">
            <TargetIcon />
          </span>
          <span className={`wa-store-pill__label ${variant === "route" ? "wa-font-rubik" : ""}`}>
            {storeName}
          </span>
        </div>
      )}
    </header>
  );
}
