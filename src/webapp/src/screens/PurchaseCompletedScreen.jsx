import { useState } from "react";
import { registerAndSaveSessionList } from "../services/webapp-api";

const APP_BENEFITS = [
  {
    number: "1",
    title: "Salve esta lista para a próxima vez",
    detail: "Repita sua compra em 1 toque sem montar tudo do zero.",
  },
  {
    number: "2",
    title: "Monte listas antes de sair de casa",
    detail: "Organize seus itens com calma e só escaneie o QR na loja.",
  },
  {
    number: "3",
    title: "Encontre mercados próximos no mapa",
    detail: "Veja unidades parceiras, horários e rotas completas no app.",
  },
];

const MOBILE_APP_URL = import.meta.env.VITE_MOBILE_APP_URL || "http://localhost:8081";

export function PurchaseCompletedScreen({
  storeId,
  storeName = "Mercado Aurora",
  listItems = [],
  collectedCount,
  onStartNewShopping,
  onBackToRoute,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  const totalItems = Math.max(listItems.length, 1);
  const finalCollected = collectedCount || totalItems;

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !email.trim() || password.length < 12) {
      setErrorMessage("Preencha nome, e-mail válido e senha com pelo menos 12 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
      await registerAndSaveSessionList({
        name: name.trim(),
        email: email.trim(),
        password,
        storeId,
        storeName,
        listItems,
      });
      setAccountCreated(true);
    } catch (error) {
      setErrorMessage(error.message || "Não foi possível concluir o cadastro agora.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wa-screen wa-screen--completed">
      <section className="wa-entry-hero wa-completed-hero">
        <div className="wa-completed-hero__top">
          <div className="wa-entry-hero__brand">Ach.ai</div>
          <button
            type="button"
            className="wa-completed-hero__back"
            onClick={onBackToRoute}
          >
            ← Ver mapa
          </button>
        </div>

        <div className="wa-entry-hero__eyebrow">COMPRA CONCLUÍDA COM SUCESSO</div>
        <h1 className="wa-entry-hero__headline">
          Tudo no carrinho.
          <br />
          Siga para o caixa!
        </h1>
        <p className="wa-entry-hero__subheadline">
          {finalCollected} de {totalItems} itens coletados pelo caminho mais curto.
        </p>
      </section>

      <div className="wa-entry-body wa-completed-body">
        <div className="wa-store-card" role="region" aria-label="Resumo da compra concluída">
          <div className="wa-store-card__info">
            <span className="wa-store-card__eyebrow">SUA COMPRA EM {storeName.toUpperCase()}</span>
            <strong className="wa-store-card__name">
              {totalItems} {totalItems === 1 ? "produto coletado" : "produtos coletados"}
            </strong>
          </div>
          <div className="wa-store-card__badge" aria-label="Compra finalizada">
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

        <h2 className="wa-entry-section-title">Gostou? Crie sua conta no App</h2>
        <p className="wa-completed-lead">
          Sua sessão no QR Code é temporária. Crie sua conta gratuita para não perder esta lista:
        </p>

        <div className="wa-steps-list wa-completed-benefits">
          {APP_BENEFITS.map((benefit) => (
            <div className="wa-step-row" key={benefit.number}>
              <div className="wa-step-badge">{benefit.number}</div>
              <div className="wa-step-text">
                <div className="wa-step-title">{benefit.title}</div>
                <div className="wa-step-detail">{benefit.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="wa-primary-cta wa-completed-cta"
          onClick={() => setModalOpen(true)}
        >
          <span>Criar conta e salvar minha lista</span>
          <span className="wa-cta-arrow" aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          className="wa-add-more-btn wa-completed-secondary-btn"
          onClick={onStartNewShopping}
        >
          <span>Iniciar nova compra nesta loja</span>
        </button>

        <p className="wa-entry-privacy wa-completed-footer">
          Já tem o aplicativo?{" "}
          <a href={MOBILE_APP_URL} className="wa-completed-link">
            Abrir App Ach.ai
          </a>
        </p>
      </div>

      {modalOpen ? (
        <div className="wa-modal-backdrop" role="dialog" aria-modal="true" aria-label="Criar conta no Ach.ai">
          <div className="wa-modal-sheet">
            <div className="wa-modal-handle" />

            {accountCreated ? (
              <div className="wa-modal-success">
                <div className="wa-store-card__badge wa-modal-success__badge">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M5 12.5L9.5 17L19 7.5"
                      stroke="#000000"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="wa-modal-title">Conta criada e lista salva!</h3>
                <p className="wa-modal-subtitle">
                  Sua lista <strong>Compra QR · {storeName}</strong> já está disponível na sua conta do aplicativo Ach.ai.
                </p>
                <a
                  href={MOBILE_APP_URL}
                  className="wa-primary-cta wa-modal-submit"
                  style={{ textDecoration: "none" }}
                >
                  <span>Ir para o App Ach.ai</span>
                  <span className="wa-cta-arrow" aria-hidden="true">→</span>
                </a>
                <button
                  type="button"
                  className="wa-modal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form className="wa-modal-form" onSubmit={handleCreateAccount}>
                <div className="wa-modal-header">
                  <h3 className="wa-modal-title">Salvar lista no App Ach.ai</h3>
                  <button
                    type="button"
                    className="wa-modal-close"
                    onClick={() => setModalOpen(false)}
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>
                <p className="wa-modal-subtitle">
                  Crie sua conta em segundos e salve seus {totalItems} itens de hoje automaticamente.
                </p>

                <label className="wa-modal-field">
                  <span>Seu nome</span>
                  <input
                    type="text"
                    placeholder="Ex.: Marina Oliveira"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </label>

                <label className="wa-modal-field">
                  <span>E-mail</span>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>

                <label className="wa-modal-field">
                  <span>Senha (mínimo 12 caracteres)</span>
                  <input
                    type="password"
                    placeholder="Crie uma senha segura"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={12}
                    required
                  />
                </label>

                {errorMessage ? (
                  <p className="wa-modal-error" role="alert">
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="wa-primary-cta wa-modal-submit"
                  disabled={submitting}
                >
                  <span>{submitting ? "Salvando..." : "Criar conta e salvar lista"}</span>
                  <span className="wa-cta-arrow" aria-hidden="true">→</span>
                </button>

                <button
                  type="button"
                  className="wa-modal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Agora não, continuar sem cadastro
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
