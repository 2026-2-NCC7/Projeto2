import LoginSupermercado from "./pages/LoginSupermercado.jsx";

/**
 * Demo da página de Login do Supermercado
 * 
 * Para usar, substitua a importação em main.jsx temporariamente:
 * import App from "./App-Supermercado-Demo.jsx";
 */
export default function AppSupermercadoDemo() {
  const handleCadastro = () => {
    console.log("Navegar para cadastro de supermercado");
    alert("Funcionalidade de cadastro será implementada");
  };

  const handleEsqueciSenha = () => {
    console.log("Navegar para recuperação de senha");
    alert("Funcionalidade de recuperação de senha será implementada");
  };

  return (
    <LoginSupermercado 
      onCadastro={handleCadastro}
      onEsqueciSenha={handleEsqueciSenha}
    />
  );
}
