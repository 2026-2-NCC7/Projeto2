const STEPS = [
  {
    number: "1",
    title: "Monte sua lista",
    detail: "Busque os produtos que precisa.",
  },
  {
    number: "2",
    title: "Receba sua rota",
    detail: "Encontre o caminho mais eficiente.",
  },
  {
    number: "3",
    title: "Acompanhe a compra",
    detail: "Marque os itens conforme coleta.",
  },
];

export function QrEntryScreen({ storeName = "Mercado Aurora", onStartShopping }) {
  return (
    <div className="wa-screen wa-screen--entry">
      <section className="wa-entry-hero">
        <div className="wa-entry-hero__brand">Ach.ai</div>
        <div className="wa-entry-hero__eyebrow">SUA COMPRA, MAIS INTELIGENTE</div>
        <h1 className="wa-entry-hero__headline">
          Encontre tudo. Sem
          <br />
          perder tempo.
        </h1>
        <p className="wa-entry-hero__subheadline">Sua rota de compras começa aqui.</p>
      </section>

      <div className="wa-entry-body">
        <div className="wa-store-card" role="region" aria-label="Identificação da loja">
          <div className="wa-store-card__info">
            <span className="wa-store-card__eyebrow">VOCÊ ESTÁ EM</span>
            <strong className="wa-store-card__name">{storeName}</strong>
          </div>
          <div className="wa-store-card__badge" aria-label="QR Code confirmado">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5L9.5 17L19 7.5"
                stroke="#000000"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="wa-entry-section-title">Como funciona</h2>

        <div className="wa-steps-list">
          {STEPS.map((step) => (
            <div className="wa-step-row" key={step.number}>
              <div className="wa-step-badge">{step.number}</div>
              <div className="wa-step-text">
                <div className="wa-step-title">{step.title}</div>
                <div className="wa-step-detail">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="wa-primary-cta wa-entry-cta"
          onClick={onStartShopping}
        >
          <span>Começar minha compra</span>
          <span className="wa-cta-arrow" aria-hidden="true">→</span>
        </button>

        <p className="wa-entry-privacy">Sem cadastro. Sua sessão é temporária.</p>
      </div>
    </div>
  );
}
