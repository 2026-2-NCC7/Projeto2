import { BottomNav } from "../components/BottomNav";
import { StoreHeader } from "../components/StoreHeader";
import {
  formatListLocation,
  formatQuantityLabel,
} from "../services/webapp-api";

export function ShoppingListScreen({
  storeName,
  listItems,
  onToggleChecked,
  onIncrementQuantity,
  onAddMoreProducts,
  onGenerateRoute,
  onNavigate,
  isGeneratingRoute,
}) {
  const count = listItems.length;
  const subtitleText =
    count === 1 ? "1 produto adicionado" : `${count} produtos adicionados`;
  const summaryDetailText =
    count === 1
      ? "1 item · percurso otimizado"
      : `${count} itens · percurso otimizado`;

  return (
    <div className="wa-screen wa-screen--list">
      <div className="wa-content">
        <StoreHeader
          storeName={storeName}
          variant="list"
          onBrandClick={() => onNavigate("entry")}
        />

        <h1 className="wa-list-title">Minha lista</h1>
        <p className="wa-list-subtitle">{subtitleText}</p>

        <div className="wa-list-items" role="list">
          {listItems.length ? (
            listItems.map((item) => {
              const isChecked = item.checked !== false;
              return (
                <div className="wa-list-item-card" role="listitem" key={item.id}>
                  <button
                    type="button"
                    className={`wa-list-checkbox ${isChecked ? "wa-list-checkbox--checked" : ""}`}
                    onClick={() => onToggleChecked(item.id)}
                    aria-label={`${isChecked ? "Remover" : "Selecionar"} ${item.name}`}
                  >
                    {isChecked ? (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 18 18"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 9.5L7.2 13.2L14.5 5.5"
                          stroke="#000000"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>

                  <div className="wa-list-item-card__info">
                    <div className="wa-list-item-card__name">{item.name}</div>
                    <div className="wa-list-item-card__location">
                      {formatListLocation(item)}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="wa-list-item-card__qty"
                    onClick={() => onIncrementQuantity(item.id)}
                    title="Toque para ajustar a quantidade"
                  >
                    {formatQuantityLabel(item)}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="wa-empty-state">
              Sua lista está vazia. Adicione produtos para gerar sua rota.
            </div>
          )}
        </div>

        <button
          type="button"
          className="wa-add-more-btn"
          onClick={onAddMoreProducts}
        >
          <span>+  Adicionar mais produtos</span>
        </button>

        <div className="wa-route-summary-card" role="region" aria-label="Resumo da rota">
          <div className="wa-route-summary-card__title">
            Sua rota está quase pronta
          </div>
          <div className="wa-route-summary-card__detail">
            {summaryDetailText}
          </div>
        </div>

        <button
          type="button"
          className="wa-primary-cta wa-generate-route-cta"
          onClick={onGenerateRoute}
          disabled={!listItems.length || isGeneratingRoute}
        >
          <span>
            {isGeneratingRoute ? "Calculando rota..." : "Gerar rota otimizada"}
          </span>
          <span className="wa-cta-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <BottomNav activeTab="list" onNavigate={onNavigate} variant="list" />
    </div>
  );
}
