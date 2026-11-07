import { useState } from "react";
import Brand from "./components/Brand.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const demoPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("demo") === "1";
  const [authenticated, setAuthenticated] = useState(() => demoPreview || Boolean(sessionStorage.getItem("achai_admin_token")));
  const [page, setPage] = useState(() => window.location.hash === "#register" ? "register" : "login");
  const navigate = (nextPage) => {
    window.history.replaceState(null, "", nextPage === "register" ? "#register" : "#login");
    setPage(nextPage);
  };

  if (authenticated) return <Dashboard demoPreview={demoPreview} onLogout={() => { sessionStorage.removeItem("achai_admin_token"); setAuthenticated(false); }} />;
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
          {page === "register" ? <RegisterPage onLogin={() => navigate("login")} /> : <LoginPage onRegister={() => navigate("register")} onLogin={() => setAuthenticated(true)} />}
          <p className="form-footer">Uso exclusivo para equipes autorizadas da loja.</p>
        </div>
      </section>
    </main>
  );
}
