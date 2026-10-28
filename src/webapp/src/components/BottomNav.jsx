function HomeNavIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path
        d="M4 9.5L11 3.5L18 9.5V18.5H4V9.5Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchNavIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="5.5" stroke={color} strokeWidth="2" />
      <path d="M14.2 14.2L18.5 18.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ListNavIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="4" height="2.4" rx="0.6" fill={color} />
      <rect x="9" y="4.5" width="10" height="2.4" rx="0.6" fill={color} />
      <rect x="3" y="9.8" width="4" height="2.4" rx="0.6" fill={color} />
      <rect x="9" y="9.8" width="10" height="2.4" rx="0.6" fill={color} />
      <rect x="3" y="15.1" width="4" height="2.4" rx="0.6" fill={color} />
      <rect x="9" y="15.1" width="10" height="2.4" rx="0.6" fill={color} />
    </svg>
  );
}

export function BottomNav({ activeTab, onNavigate, variant = "search" }) {
  const inactiveColor = variant === "list" ? "#7A5A3A" : "#6B6B6B";
  const activeColor = "#F26900";

  const tabs = [
    { id: "entry", label: "Início", Icon: HomeNavIcon },
    { id: "search", label: "Buscar", Icon: SearchNavIcon },
    { id: "list", label: "Minha lista", Icon: ListNavIcon },
  ];

  return (
    <nav
      className={`wa-bottom-nav wa-bottom-nav--${variant}`}
      aria-label="Navegação principal do WebApp"
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        const color = isActive ? activeColor : inactiveColor;
        return (
          <button
            key={id}
            type="button"
            className={`wa-bottom-nav__item ${isActive ? "wa-bottom-nav__item--active" : ""}`}
            onClick={() => onNavigate(id)}
            style={{ color }}
          >
            <span className="wa-bottom-nav__icon">
              <Icon color={color} />
            </span>
            <span className="wa-bottom-nav__label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
