# Muka Store
Storefront digital em Node.js + Express, com painel admin, cadastro de produtos, 5 categorias e moderação dos envios da comunidade.

## Rodar localmente
1. Instale Node.js 18+.
2. No terminal dentro desta pasta: `npm install`
3. Copie `.env.example` para `.env` (ou defina as variáveis no ambiente) e altere a senha e o segredo.
4. `npm start`
5. Acesse `http://localhost:3000`

## Administração
Clique em **Admin** no rodapé. Configure `ADMIN_USER` e `ADMIN_PASSWORD` no ambiente de execução. A senha padrão de exemplo é insegura; altere antes de publicar.


## Deploy Render
- New Web Service, repositório deste projeto
- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Defina `ADMIN_USER`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `DISCORD_SERVER_ID` nas Environment Variables.
- Para persistir o `data.json` em deploy, conecte um Persistent Disk e use a pasta de montagem como diretório de dados (esta versão salva `data.json` junto do projeto; sem disco persistente, dados podem ser resetados após redeploy).

## Logo
Coloque sua imagem em `public/images/pngin.png`. A logo aparece no cabeçalho. Se não tiver sido adicionada, o texto MUKA STORE permanece visível.

## Contagem de membros Discord
O servidor tenta consultar o widget público do Discord (widget.json). Para exibir a contagem, habilite Server Widget nas configurações do servidor. Se o widget não estiver habilitado ou estiver indisponível, o número mostra `—`.

## Categorias
BOTS, SERVIDORES, SITES, DESIGN e PRODUTOS LIVRES. Envio comunitário vai para a fila de aprovação e só é publicado após o admin aprovar.
