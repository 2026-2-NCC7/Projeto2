# Login do Supermercado - Implementação do Figma

## 📋 Sobre

Esta é a implementação pixel-perfect da tela de **Login do Supermercado** do Figma, criada para o portal de parceiros Ach.ai.

**Design Figma:** [Ver no Figma](https://www.figma.com/design/IrxLRT7xxR4HuImDxYvHjr/Ach.ai-telas?node-id=2028-1141)

## 📁 Arquivos Criados

### Componente Principal
- `src/pages/LoginSupermercado.jsx` - Componente React da página

### Estilos
- `src/styles/login-supermercado.css` - CSS específico da página

### Assets (SVG Icons)
- `src/assets/icons/store.svg` - Ícone da loja
- `src/assets/icons/circle-help.svg` - Ícone de ajuda
- `src/assets/icons/eye-off.svg` - Ícone de ocultar senha
- `src/assets/icons/seta-avanco.svg` - Seta de avanço
- `src/assets/icons/detalhe-grafico.svg` - Detalhe gráfico decorativo
- `src/assets/icons/destaque-crescimento.svg` - Gráfico de crescimento
- `src/assets/icons/arrow-up-right.svg` - Seta diagonal

### Demo
- `src/App-Supermercado-Demo.jsx` - App de demonstração

## 🚀 Como Visualizar

### Opção 1: Substituir App temporariamente

1. Abra `src/main.jsx`
2. Substitua a importação do App:

```jsx
// Antes
import App from "./App.jsx";

// Depois
import App from "./App-Supermercado-Demo.jsx";
```

3. Execute o servidor de desenvolvimento:

```bash
cd src/frontend
npm run dev
```

4. Acesse http://localhost:5173

### Opção 2: Integrar ao App existente

Adicione uma rota ou botão para navegar para a página:

```jsx
import LoginSupermercado from "./pages/LoginSupermercado.jsx";

// No seu componente
<LoginSupermercado 
  onCadastro={() => navigate('/cadastro-supermercado')}
  onEsqueciSenha={() => navigate('/recuperar-senha')}
/>
```

## 🎨 Design System

### Cores
- **Orange Primary:** `#f26900`
- **Orange Dark:** `#d95f00`
- **Background Warm:** `#fbf7f2`
- **Text Primary:** `#191919`
- **Text Muted:** `#72716e`
- **Border:** `#e8e5e1`
- **Input Background:** `#fffaf6`
- **Badge Background:** `#fff1e5`
- **Badge Text:** `#a94700`

### Tipografia
- **Títulos:** Rubik Bold (34px, 46px)
- **Corpo:** Inter (Regular 400, Semibold 600)
- **Labels:** Inter Semibold 13px
- **Small Text:** Inter 11-12px

### Componentes

#### Selo do Portal
Badge com ícone e texto, fundo laranja claro

#### Ilustração do Supermercado
Ilustração vetorizada em CSS com:
- Fachada da loja
- Letreiro com logo Ach.ai
- Toldos alternados laranja e bege
- Vitrine e porta
- Gráfico de crescimento animado

#### Campos de Formulário
- Background: `#fffaf6`
- Border: `#e8e5e1`
- Border radius: `17px`
- Height: `52px`
- Focus: borda laranja com shadow suave

#### Botão Principal
- Background: `#f26900`
- Border radius: `17px`
- Height: `56px`
- Hover: `#d95f00`

## ✨ Características

### Fidelidade ao Design
- ✅ Layout de duas colunas (568px | flex-grow)
- ✅ Cores exatas do Figma
- ✅ Tipografia Inter + Rubik
- ✅ Ilustração do supermercado em CSS
- ✅ Espaçamentos pixel-perfect
- ✅ Estados de hover e focus

### Acessibilidade
- ✅ Labels semânticos
- ✅ ARIA labels nos botões de ação
- ✅ Atributos `aria-hidden` em ícones decorativos
- ✅ Contraste de cores WCAG AA
- ✅ Navegação por teclado

### Responsividade
- ✅ Layout responsivo em telas < 1200px
- ✅ Painel lateral ocultado em mobile
- ✅ Formulário centralizado e adaptável

### Funcionalidades
- ✅ Toggle de mostrar/ocultar senha
- ✅ Validação de formulário preparada
- ✅ Estados de loading
- ✅ Callbacks para navegação

## 🔧 Próximos Passos

### Backend Integration
1. Conectar ao endpoint de autenticação de supermercados
2. Implementar tratamento de erros
3. Adicionar feedback visual de sucesso/erro

### Navegação
1. Criar página de cadastro de supermercado
2. Criar página de recuperação de senha
3. Integrar com sistema de rotas

### Melhorias
1. Adicionar animações de transição
2. Implementar validação em tempo real
3. Adicionar testes unitários

## 📸 Screenshot

Veja o arquivo `screenshot-login.png` na raiz do projeto para comparação visual com o design original do Figma.

## 🤝 Comparação com o Design Original

A implementação segue fielmente o Figma:
- ✅ Layout idêntico
- ✅ Cores exatas (hex codes)
- ✅ Tipografia correta (Inter + Rubik)
- ✅ Espaçamentos precisos
- ✅ Ilustração replicada em CSS
- ✅ Todos os assets baixados do Figma

---

**Implementado com Kiro Figma Power** 🚀
