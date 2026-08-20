# RP10FUT

E-commerce de camisas de futebol personalizadas + painel administrativo. Implementação de produção (Next.js
App Router + TypeScript + Prisma/Postgres) do design em `../chats` e `../project/design_handoff_rp10fut`.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **Prisma 6** + **PostgreSQL**
- **NextAuth v5** (Credentials) -- sessões separadas para equipe (`kind: "staff"`) e clientes (`kind: "customer"`)
- **Tailwind CSS v4**

## Rodando localmente

```bash
# 1. Banco de dados (ajuste DATABASE_URL em .env)
cp .env.example .env

# 2. Dependências
npm install

# 3. Schema + seed (produtos, competições, cupons, contas de admin)
npx prisma migrate dev
npx prisma db seed

# 4. Dev server
npm run dev
```

As duas contas fundadoras de admin geral (`gustavolrnzcontato@gmail.com`, `rpfut010@gmail.com`) são
criadas pelo seed com a senha em `SEED_ADMIN_PASSWORD_1`/`_2` (padrão `change-me` -- defina uma senha real
no `.env` antes de rodar o seed em qualquer ambiente que não seja local, e troque-a pela tela **Usuários**
do admin no primeiro login).

## Estrutura

```
src/
  app/
    (site)/        loja: Home, Catálogo, Produto, Carrinho, Meus Pedidos, Contato, Conta
    checkout/       checkout (layout próprio, sem nav/rodapé, como no design)
    admin/          login + painel administrativo (protegido por proxy.ts)
    api/auth/       NextAuth route handler
  auth.ts           configuração NextAuth (providers: staff, customer, social-simulated, staff-bypass)
  proxy.ts          protege /admin/* (equivalente ao antigo "middleware" no Next 16)
  lib/
    data/           leituras Prisma (Server Components)
    actions/        Server Actions (mutações, "use server")
    cart/           carrinho client-side (Context + localStorage)
prisma/
  schema.prisma
  seed.ts           dados iniciais (produtos, competições, cupons, staff)
```

## O que falta para produção "de verdade"

Escopo já mapeado como pendência desde o handoff original de design, não implementado aqui:

1. **Pagamento real** -- Pix/Cartão hoje são apenas UI; não há integração com gateway (Mercado Pago etc.).
2. **OAuth real do Google/Apple** -- os botões em Conta simulam o login (pedem o e-mail via prompt e
   criam/autenticam a conta localmente); precisam de client id/secret reais para virar OAuth de verdade.
3. **E-mail transacional** -- nenhuma confirmação de pedido ou mudança de status é enviada por e-mail.
4. **Frete real** -- valores fixos (Padrão R$ 24,90 / Expresso R$ 39,90); precisa de integração com
   Correios/Melhor Envio ou similar.
5. **Storage de mídia** -- uploads (fotos de produto, logo, vídeo do hero) vão para `public/uploads` no
   disco local do servidor. Funciona para um único servidor, mas não escala horizontalmente nem sobrevive a
   um redeploy sem volume persistente -- trocar por S3/R2/Blob antes de um deploy real com múltiplas
   instâncias.
