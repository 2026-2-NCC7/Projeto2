```sh
Utilize o site <https://www.toptal.com/developers/gitignore> para gerar seu arquivo gitignore e apague este campo.

Vide tutoriais do PI.
```

# FECAP - Fundação de Comércio Álvares Penteado

<p align="center">
<a href= "https://www.fecap.br/"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhZPrRa89Kma0ZZogxm0pi-tCn_TLKeHGVxywp-LXAFGR3B1DPouAJYHgKZGV0XTEf4AE&usqp=CAU" alt="FECAP - Fundação de Comércio Álvares Penteado" border="0"></a>
</p>

# Ach.ai

## Ach.ai

## Integrantes: <a href="https://www.linkedin.com/in/ettore-grecco/">Ettore Grecco</a>, <a href="https://www.linkedin.com/in/leoonaardoferreira/">Leonardo Ferreira</a>, <a href="https://www.linkedin.com/in/luis-felipe-torelli-sparrapan-05b54b2b5/">Luis Felipe Torelli Sparrapan</a>, <a href="https://www.linkedin.com/in/rafaella-morelli-075539240">Rafaella Morelli</a>

## Professores Orientadores: <a href="https://www.linkedin.com/in/leonardo-fabris-lugoboni-a3369416/">Dr. Leonardo Fabris Lugoboni</a>

## Descrição

<p align="center">
<img src="https://pix4free.org/assets/library/2021-01-20/originals/game.jpg" alt="NOME DO JOGO" border="0">
  Game by <a href="http://www.nyphotographic.com/">Nick Youngson</a> <a rel="license" href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a> <a href="http://pix4free.org/">Pix4free</a>
</p>


De um a dois parágrafos sobre o que é seu projeto e o que ele faz.
<br><br>
Meu projeto ajuda estudantes FECAP a configurarem seus githubs.
<br><br>
May the force be with you!
<br><br>

## 🛠 Estrutura de pastas

-Raiz<br>
|<br>
|-->documentos<br>
  &emsp;|-->antigos<br>
  &emsp;|Documentação.docx<br>
|-->executáveis<br>
  &emsp;|-->windows<br>
  &emsp;|-->android<br>
  &emsp;|-->HTML<br>
|-->imagens<br>
|-->src<br>
  &emsp;|-->Backend<br>
  &emsp;|-->Frontend<br>
|readme.md<br>

A pasta raiz contem dois arquivos que devem ser alterados:

<b>README.MD</b>: Arquivo que serve como guia e explicação geral sobre seu projeto. O mesmo que você está lendo agora.

Há também 4 pastas que seguem da seguinte forma:

<b>documentos</b>: Toda a documentação estará nesta pasta.

<b>executáveis</b>: Binários e executáveis do projeto devem estar nesta pasta.

<b>imagens</b>: Imagens do sistema

<b>src</b>: Pasta que contém o código fonte.

## 🛠 Instalação

<b>Android:</b>

Faça o Download do JOGO.apk no seu celular.
Execute o APK e siga as instruções de seu telefone.

```sh
Coloque código do prompt de comnando se for necessário
```

<b>Windows:</b>

Não há instalação! Apenas executável!
Encontre o JOGO.exe na pasta executáveis e execute-o como qualquer outro programa.

```sh
Coloque código do prompt de comnando se for necessário
```

<b>HTML:</b>

Não há instalação!
Encontre o index.html na pasta executáveis e execute-o como uma página WEB (através de algum browser).

## 💻 Configuração para Desenvolvimento

Descreva como instalar todas as dependências para desenvolvimento e como rodar um test-suite automatizado de algum tipo. Se necessário, faça isso para múltiplas plataformas.

Para abrir este projeto você necessita das seguintes ferramentas:

-<a href="https://godotengine.org/download">GODOT</a>

### Organização do backend

O backend segue uma organização em camadas dentro de `src/backend`:

- `app.js`: composição da aplicação HTTP e middlewares.
- `router.js`: encaminhamento das requisições para as rotas.
- `src/routes`: definição dos recursos HTTP.
- `src/controllers`: tratamento de entrada e resposta HTTP.
- `src/services`: regras de negócio, como autenticação e emissão de tokens.
- `src/model`: acesso às entidades persistidas no PostgreSQL.
- `src/middlewares`: preocupações transversais, como CORS.
- `src/utils`: helpers de autenticação, validação e transporte HTTP.
- `src/server.js`: ponto de entrada do processo.

```sh
make install
npm test
Coloque código do prompt de comnando se for necessário
```

### Ambiente local com Docker

É necessário ter o Docker instalado com o plugin Docker Compose. Na raiz do repositório, execute:

```sh
docker compose up --build --wait
```

Esse comando inicia o PostgreSQL 16 com PostGIS e a API em `http://localhost:3000`. A API aplica as migrations pendentes antes de iniciar; o endpoint `http://localhost:3000/health` só fica saudável quando a API consegue consultar o banco. Se uma migration falhar, a API encerra com o nome da migration e o erro, e não fica saudável.

As migrations ficam em `src/backend/migrations/` e são aplicadas uma única vez, em ordem, com registro na tabela `schema_migrations`. Para interromper os serviços, execute `docker compose down`. Os dados do banco permanecem no volume `postgres_data`; para removê-los e recriar o banco do zero, use `docker compose down -v`.

As credenciais e portas padrão são destinadas somente ao desenvolvimento. Podem ser alteradas com as variáveis `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT` e `API_PORT` no ambiente ou em um arquivo `.env` local.

### Login administrativo

Configure `JWT_SECRET` com pelo menos 32 bytes aleatórios em seu arquivo `.env` (não o compartilhe nem o versione). Gere um valor com:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Com os serviços em execução, crie um administrador pelo terminal interativo; a senha (mínimo de 12 caracteres) não é exibida nem armazenada em texto puro:

```sh
docker compose exec api npm run create-admin -- admin@example.com
```

Faça login enviando `POST /auth/login` com `Content-Type: application/json` e o corpo `{"email":"admin@example.com","password":"..."}`. Credenciais válidas retornam `token`, `token_type` (`Bearer`) e `expires_in` (segundos). O JWT também contém o papel do usuário em `role`: `admin` para o Administrador master ou `manager` para um Gerente. Credenciais inválidas retornam HTTP 401. O JWT é assinado com `JWT_SECRET` e expira em uma hora.

O cadastro também está disponível em `POST /auth/register`. Envie `name`, `email`, `password` e `password_confirmation`; o endpoint retorna HTTP 201 quando a conta é criada e HTTP 409 quando o e-mail já está cadastrado. A página React de registro pode ser acessada pelo botão `Criar administrador` ou diretamente em `http://localhost:5173/#register`.

A recuperação de senha usa um link direto, sem código digitável. O endpoint `POST /auth/forgot-password` recebe `email`, cria um token de uso único com validade de uma hora e, no ambiente local, imprime o link no log da API. Em produção, esse ponto deve ser conectado a um provedor de e-mail. O link abre a tela `/reset-password`, que envia o token e a nova senha para `POST /auth/reset-password`.

Operações administrativas de criação de usuários usam `POST /admin/register` e exigem `Authorization: Bearer <token>` de um Administrador. Essa rota cria Gerentes (`role: manager`); tokens de Gerente recebem HTTP 403. O endpoint `/auth/register` continua reservado ao bootstrap inicial de Administradores.

O frontend fica separado em `src/frontend` e usa React + Vite. Em um terminal, execute:

```sh
cd src/frontend
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite encaminha `/auth` e `/health` para a API em `http://localhost:3000`. A tela apresenta os estados de validação local, carregamento, erro de credenciais e sucesso; o token recebido fica apenas na `sessionStorage` do navegador até a aba ser encerrada.

Em outro ambiente, configure `VITE_API_URL` no frontend e `FRONTEND_ORIGIN` na API para as origens permitidas, separadas por vírgula. Por padrão, a API aceita o frontend Vite (`http://localhost:5173`) e o Expo Web (`http://localhost:8081`).

### Aplicativo mobile

O aplicativo instalável fica em `src/mobile` e é uma aplicação React Native com Expo. A estrutura separa:

- `App.jsx`: composição da aplicação e navegação.
- `src/screens`: telas nativas de autenticação e a `HomeScreen`.
- `src/components`: componentes visuais reutilizáveis.
- `src/context`: estado de sessão e autenticação.
- `src/services`: comunicação com a API REST.
- `src/storage`: persistência segura no dispositivo com `expo-secure-store`.
- `src/config`: configuração de ambiente e endereço da API.

A estilização usa NativeWind, a integração mobile do Tailwind CSS. O app nativo é independente do Web App em `src/frontend`, mas compartilha a API do backend em `src/backend`, como definido na seção 6.3.6 do documento do projeto.

Para testar o app nativo:

```sh
# Terminal 1: API
cd src/backend
set JWT_SECRET=chave-local-com-pelo-menos-32-caracteres
npm start

# Terminal 2: Expo
cd src/mobile
npm install
npm start
```

Depois, pressione `a` para abrir no emulador Android, `i` para abrir no simulador iOS ou escaneie o QR Code com o Expo Go. No Android Emulator, a API local é acessada por `10.0.2.2`; em dispositivo físico, use `EXPO_PUBLIC_API_URL=http://<IP-DA-MAQUINA>:3000 npm start`.

Para criar um administrador de teste, execute `docker compose exec api npm run create-admin -- admin@example.com` e use a senha criada no prompt. A tela nativa envia `email` e `password` para a API, navega para a Home após o login e armazena o JWT no armazenamento seguro do dispositivo. A Home inicia sem listas e consulta `GET /suggestions` para carregar sugestões do backend. O endpoint atualmente retorna uma lista vazia até que as regras de recomendação e o domínio de listas sejam implementados.

## 📋 Licença/License
Utilize o link <https://chooser-beta.creativecommons.org/> para fazer uma licença CC BY 4.0.

## 🎓 Referências

Aqui estão as referências usadas no projeto.

1. <https://github.com/iuricode/readme-template>
2. <https://github.com/gabrieldejesus/readme-model>
3. <https://chooser-beta.creativecommons.org/>
4. <https://freesound.org/>
5. <https://www.toptal.com/developers/gitignore>
6. Músicas por: <a href="https://freesound.org/people/DaveJf/sounds/616544/"> DaveJf </a> e <a href="https://freesound.org/people/DRFX/sounds/338986/"> DRFX </a> ambas com Licença CC 0.
