import { useState } from "react";
import Brand from "./components/Brand.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

export default function App() {
  const [page, setPage] = useState(() => window.location.hash === "#register" ? "register" : "login");
  const navigate = (nextPage) => {
    window.history.replaceState(null, "", nextPage === "register" ? "#register" : "#login");
    setPage(nextPage);
  };

  return (
    <main className="login-shell">
      <section className="brand-panel" aria-label="Ach.ai">
        <Brand />
        <div className="brand-copy"><p className="eyebrow">Painel do varejo</p><h1>Decisões melhores começam com uma visão mais clara.</h1><p>Monitore sua operação, catálogo e comportamento de compra em um só lugar.</p></div>
        <div className="brand-footer"><span className="status-dot" />Plataforma operacional</div>
      </section>
      <section className="form-panel">
        <div className="form-container">
          <Brand mobile />
          {page === "register" ? <RegisterPage onLogin={() => navigate("login")} /> : <LoginPage onRegister={() => navigate("register")} />}
          <p className="form-footer">Uso exclusivo para equipes autorizadas da loja.</p>
        </div>
      </section>
    </main>
  );
}
