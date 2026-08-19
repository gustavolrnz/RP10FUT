# RP10FUT — contexto do projeto

E-commerce de camisas de futebol personalizadas com nome e número.
Loja + painel administrativo.

## Status: aguardando o handoff do design

O design está no **Claude Design**, no projeto
`b21cffca-1c7f-4694-be9a-869ee560aae2`, e ainda não chegou ao repositório.
Nada de implementação foi escrito até aqui, de propósito.

### Inventário confirmado pelo cliente

O projeto tem os arquivos na raiz e duplicados dentro de
`design_handoff_rp10fut/design/` (o bundle de handoff foi gerado dentro do
próprio projeto). São **11 telas**:

Home · Catalog · Product · Cart · MiniCartDrawer · Checkout · Account ·
MyOrders · Contact · Admin · AdminLogin

Bibliotecas: `lib/products.js`, `lib/cart-store.js`, `lib/orders-store.js`,
`lib/admin-store.js`, `lib/admin-auth.js`, `lib/user-auth.js`,
`lib/media-store.js`, além de `support.js` e `doc-page.js`.

Assets: `assets/rp10fut-logo.png`, `assets/hero-video.mp4`,
`assets/about-hero-video.mp4`.

Também no projeto: `design_handoff_rp10fut/README.md`,
`RP10FUT Admin (offline).html` (admin compilado, só referência visual) e
`screenshots/admin-print-check.png`.

### Como buscar os arquivos

Rotas automáticas testadas a partir de uma sessão do Claude Code **web**, todas
bloqueadas: `DesignSync` (sem escopo de design), o MCP
`api.anthropic.com/v1/design/mcp` (401), `WebFetch` na URL do projeto (403) e a
listagem de artifacts (o projeto não é artifact). O motivo é estrutural: a
autorização de design vem do `/design-login`, que exige terminal interativo.

Duas rotas que funcionam:

1. **Claude Code local, no terminal.** Abrir este repositório, rodar
   `/design-login` e então colar o prompt de handoff gerado pelo Claude Design
   (o que aponta para o projeto acima e lista os arquivos). Depois commitar e
   dar push nos arquivos recebidos.
2. **"Send to Claude Code Web", no próprio Claude Design.** Semeia o projeto
   direto no workspace, sem precisar de autorização de design.

Regra combinada com o cliente: **replicar pixel-perfect, nunca inventar valor**.
Cada cor, padding, peso de fonte, raio de borda e timing de animação deve ser
extraído do `.dc.html` original. Se um valor não for encontrado, perguntar —
não aproximar.

## Decisões de negócio já tomadas pelo cliente

| Tema | Decisão |
|---|---|
| Prazo de produção | Não possui política definida |
| Troca / devolução | Não possui política definida |
| Frete grátis | Não tem — frete sempre calculado (Correios / Melhor Envio) |
| Cupom x frete | Sem interação: cupom incide só sobre o subtotal |
| Reserva de estoque | No carrinho, expira em 15 min |
| Pix não pago | Cancela automático em 30 min |

## Pontos em aberto

1. **Prazo e política de troca não existem.** Se alguma tela do protótipo tiver
   copy citando prazo de produção ou troca/devolução, não escrever esse texto por
   conta própria: mostrar o trecho original ao cliente e perguntar. Vale também
   para o e-mail de confirmação de pedido. Proposta a aprovar: deixar o prazo
   como campo editável na aba Ajustes do admin, em vez de fixo no código.

2. **Sem frete grátis.** Se houver badge ou faixa de "frete grátis acima de R$ X"
   em alguma tela, avisar antes de remover — não mexer em elemento visual sem
   confirmar.

3. **Conflito entre reserva (15 min) e Pix (30 min).** Um pedido fechado no
   minuto 14 perde a reserva no minuto 15 com o Pix ainda válido, e outra pessoa
   pode levar a última peça. Proposta a confirmar: os 15 min valem enquanto o
   item está só no carrinho; ao criar o pedido a reserva é estendida para 30 min,
   casando com a expiração do Pix. Quando o Pix expira ou é cancelado, o estoque
   volta.

## Backend a construir (o protótipo usa localStorage, só para demonstração)

Banco de dados e API · autenticação real com hash de senha e sessões seguras,
com dois níveis no admin (Admin geral e Equipe operacional) · OAuth real de
Google e Apple · upload de imagens para storage externo (S3/Cloudinary) ·
pagamento via Mercado Pago (Pix e cartão) com webhook atualizando o status ·
cálculo de frete real · e-mails transacionais de confirmação e mudança de status.

## Regras de negócio que precisam funcionar

- Taxa de personalização definida no admin (aba Ajustes), cobrada por peça sempre
  que o cliente preenche nome ou número, somada no carrinho, no checkout e no
  pedido salvo. Valor 0 significa incluído sem custo.
- Estoque por produto e por tamanho. Tamanho sem estoque não entra no carrinho
  (aparece riscado e desabilitado). Alerta de estoque baixo abaixo de 5 unidades.
- Cupons validados por código: ativos, dentro da validade e abaixo do limite de
  usos. Percentual incide sobre o subtotal; valor fixo nunca excede o subtotal.
  O contador de usos incrementa ao finalizar o pedido.
- Status do pedido: Pendente → Em produção → Enviado → Entregue, atualizado
  manualmente pela equipe no admin, refletindo na hora na consulta pública.
- Consulta de pedidos por e-mail, sem login.
- Produto inativo some da loja e continua visível no admin.
- Checkout de página única, com compra como visitante (só e-mail) ou logado.
  Obrigatórios: e-mail válido, nome completo, CEP válido (00000-000), endereço,
  número, bairro, cidade, estado.

## Fidelidade visual

- Fontes: Anton (títulos, sempre caixa alta) e Inter 400–800, ambas do Google Fonts.
- Textos em português exatamente como no protótipo, incluindo mensagens de erro
  e microcopy. Não reescrever copy.
- Manter hover, foco e animações de entrada (fade + deslocamento vertical, com
  delays escalonados) idênticos.
- O admin tem visual propositalmente diferente da loja: fundo `#15171c`, painéis
  `#1b1e25`, cantos 8px. Não unificar os dois estilos.
- Responsivo: mobile < 640px, tablet < 900px, desktop ≥ 900px. No protótipo os
  breakpoints são via JavaScript por limitação do ambiente; na implementação usar
  media queries CSS, mantendo o mesmo comportamento (menu hambúrguer no mobile,
  grids de 4 → 3 → 2 → 1 colunas).
- Conferir cada tela contra o original em 375px, 768px e 1440px.
