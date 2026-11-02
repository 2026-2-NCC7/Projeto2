import { useMemo, useState } from "react";
import { BottomNav } from "../components/BottomNav";
import { StoreHeader } from "../components/StoreHeader";
import {
  formatProductPrice,
  formatSearchSubtitle,
  getProductEmoji,
} from "../services/webapp-api";

const CATEGORIES = [
  { id: "Hortifruti", label: "Hortifruti", icon: "🥬" },
  { id: "Laticínios", label: "Laticínios", icon: "🥛" },
  { id: "Padaria", label: "Padaria", icon: "🍞" },
  { id: "Limpeza", label: "Limpeza", icon: "🧼" },
];

function SearchInputIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <circle cx="9.8" cy="9.8" r="5.8" stroke="#F26900" strokeWidth="2.2" />
      <path d="M14.2 14.2L18.5 18.5" stroke="#F26900" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function ProductSearchScreen({
  storeName,
  products,
  searchQuery,
  onSearchChange,
  listItems,
  onAddProduct,
  onNavigate,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const visibleProducts = useMemo(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          (product.category || "").toLowerCase() === selectedCategory.toLowerCase(),
      );
    }
    if (!searchQuery.trim() && !selectedCategory) {
      return filtered.slice(0, 3);
    }
    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const itemCount = listItems.length;
  const itemLabel = itemCount === 1 ? "1 item" : `${itemCount} itens`;

  const quantityById = useMemo(() => {
    const map = new Map();
    for (const item of listItems) {
      map.set(Number(item.id), item.quantity || 1);
    }
    return map;
  }, [listItems]);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="wa-screen wa-screen--search">
      <div className="wa-content">
        <StoreHeader
          storeName={storeName}
          variant="search"
          onBrandClick={() => onNavigate("entry")}
        />

        <h1 className="wa-search-greeting">O que você precisa hoje?</h1>

        <div className="wa-search-box">
          <span className="wa-search-box__icon">
            <SearchInputIcon />
          </span>
          <input
            type="search"
            className="wa-search-box__input"
            placeholder="Buscar produto ou marca"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            aria-label="Buscar produto ou marca"
          />
          {searchQuery ? (
            <button
              type="button"
              className="wa-search-box__clear"
              onClick={() => onSearchChange("")}
              aria-label="Limpar busca"
            >
              ×
            </button>
          ) : null}
        </div>

        <section className="wa-categories-section" aria-label="Categorias">
          <h2 className="wa-section-heading wa-section-heading--categories">Categorias</h2>
          <div className="wa-categories-grid">
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`wa-category-card ${isSelected ? "wa-category-card--active" : ""}`}
                  onClick={() => handleCategoryClick(category.id)}
                  aria-pressed={isSelected}
                >
                  <span className="wa-category-card__icon" aria-hidden="true">
                    {category.icon}
                  </span>
                  <span className="wa-category-card__label">{category.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="wa-popular-section" aria-label="Produtos">
          <div className="wa-popular-header">
            <h2 className="wa-section-heading wa-section-heading--popular">
              {selectedCategory
                ? selectedCategory
                : searchQuery.trim()
                  ? "Resultados"
                  : "Mais buscados"}
            </h2>
            {selectedCategory || searchQuery.trim() ? (
              <button
                type="button"
                className="wa-reset-filter-btn"
                onClick={() => {
                  setSelectedCategory(null);
                  onSearchChange("");
                }}
              >
                Ver mais buscados
              </button>
            ) : null}
          </div>

          <div className="wa-products-list">
            {visibleProducts.length ? (
              visibleProducts.map((product) => {
                const qtyInList = quantityById.get(Number(product.id)) || 0;
                return (
                  <article className="wa-product-card" key={product.id}>
                    <div className="wa-product-card__thumb" aria-hidden="true">
                      <span className="wa-product-card__emoji">
                        {getProductEmoji(product)}
                      </span>
                    </div>
                    <div className="wa-product-card__body">
                      <h3 className="wa-product-card__name">{product.name}</h3>
                      <p className="wa-product-card__meta">
                        {formatSearchSubtitle(product)}
                      </p>
                      <p className="wa-product-card__price">
                        {formatProductPrice(product)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="wa-product-card__add-btn"
                      onClick={() => onAddProduct(product)}
                      disabled={!product.inStock}
                      aria-label={`Adicionar ${product.name} à lista`}
                      title={
                        qtyInList > 0
                          ? `Na lista (${qtyInList}) — toque para adicionar mais`
                          : "Adicionar à lista"
                      }
                    >
                      <span>+</span>
                    </button>
                  </article>
                );
              })
            ) : (
              <div className="wa-empty-state">
                Nenhum produto encontrado para essa busca.
              </div>
            )}
          </div>
        </section>

        <button
          type="button"
          className="wa-primary-cta wa-search-list-cta"
          onClick={() => onNavigate("list")}
        >
          <span>Ver minha lista  ·  {itemLabel}</span>
          <span className="wa-cta-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      <BottomNav activeTab="search" onNavigate={onNavigate} variant="search" />
    </div>
  );
}
